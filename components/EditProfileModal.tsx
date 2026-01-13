"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserProfile } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { X, Save, Upload, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { compressImage } from "@/utils/imageCompression";
import { checkContentSafety, reportViolation } from "@/lib/moderation";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile & { id: string }; // The user being edited
    onUserUpdated?: (updatedUser: UserProfile & { id: string }) => void;
}

export function EditProfileModal({ isOpen, onClose, user: targetUser, onUserUpdated }: EditProfileModalProps) {
    const { role } = useAuth(); // Current logged in user's role
    const { addNotification } = useNotification();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        role: "user" as "user" | "admin",
        skillsOffered: [] as string[],
        skillsSought: [] as string[],
        visibility: "public" as "public" | "private"
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (targetUser && isOpen) {
            setFormData({
                name: targetUser.name || "",
                bio: targetUser.bio || "",
                role: targetUser.role || "user",
                skillsOffered: targetUser.skillsOffered || [],
                skillsSought: targetUser.skillsSought || [],
                visibility: targetUser.visibility || "public"
            });
            setPreviewUrl(targetUser.photoURL || null);
            setSelectedFile(null);
        }
    }, [targetUser, isOpen]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            try {
                // Compress the image client-side before setting it
                // This handles large files (e.g. 5MB) by resizing them to ~800px
                // Resulting string is usually < 100KB, perfect for Firestore
                const compressedBase64 = await compressImage(file);

                setPreviewUrl(compressedBase64);
                setSelectedFile(file); // Still keep original file reference just in case
            } catch (err) {
                console.error("Compression failed:", err);
                addNotification("Failed to process image. Try a different one.", "error");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Moderation Check - Name
            const nameCheck = await checkContentSafety(formData.name);
            if (nameCheck.flagged) {
                addNotification(`Name blocked: ${nameCheck.reason}`, "error");
                setIsLoading(false);
                return;
            }
            if (nameCheck.severity === "low") {
                reportViolation(targetUser.id, targetUser.name || "Unknown", formData.name, nameCheck.reason || "Low severity name", "Profile Edit (Allowed)");
            }

            // Moderation Check - Bio
            const bioCheck = await checkContentSafety(formData.bio);
            if (bioCheck.flagged) {
                addNotification(`Bio blocked: ${bioCheck.reason}`, "error");
                setIsLoading(false);
                return;
            }
            if (bioCheck.severity === "low") {
                reportViolation(targetUser.id, targetUser.name || "Unknown", formData.bio, bioCheck.reason || "Low severity bio", "Profile Edit (Allowed)");
            }

            // If previewUrl starts with "data:", it's a new base64 image
            // If it starts with "http" or is null, it's existing or empty
            let photoURL = targetUser.photoURL;

            if (previewUrl && previewUrl.startsWith("data:")) {
                photoURL = previewUrl;
            }

            const updates: any = {
                name: formData.name,
                bio: formData.bio,
                visibility: formData.visibility,
                photoURL: photoURL
            };

            // Only admin can update role
            if (role === 'admin') {
                updates.role = formData.role;
            }

            // Update Firestore
            await updateDoc(doc(db, "users", targetUser.id), updates);

            // Update Auth Profile (so it reflects immediately in AuthContext)
            // NOTE: We DO NOT update photoURL in Auth Profile because Base64 strings are too long.
            // We rely on Firestore for the photoURL.
            if (auth.currentUser && auth.currentUser.uid === targetUser.id) {
                await updateProfile(auth.currentUser, {
                    displayName: formData.name,
                    // photoURL: photoURL // Too long for Auth Profile
                });
            }

            addNotification("Profile updated successfully", "success");

            if (onUserUpdated) {
                onUserUpdated({ ...targetUser, ...updates });
            }
            onClose();
        } catch (error: any) {
            console.error("Error updating profile:", error);
            // detailed error for debugging
            if (error.code === 'permission-denied') {
                addNotification("Permission denied. Check your rules.", "error");
            } else if (error.message && error.message.includes("size")) {
                addNotification("Image data too large for database.", "error");
            } else {
                addNotification(`Failed to update: ${error.message || "Unknown error"}`, "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-lg bg-[#151a2d] border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0c1121]">
                            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            {/* Profile Picture Upload */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-blue-500 transition-colors">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                                <Camera className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-blue-400 mt-2 hover:underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    Change Photo
                                </p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-black/20 border-white/10 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-md bg-black/20 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            {role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as "user" | "admin" })}
                                        className="w-full rounded-md bg-black/20 border border-white/10 text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <p className="text-xs text-yellow-500/80 mt-1">Warning: Changing to Admin grants full system access.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Profile Visibility</label>
                                <select
                                    value={formData.visibility}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as "public" | "private" })}
                                    className="w-full rounded-md bg-black/20 border border-white/10 text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="public">Public (Visible to everyone)</option>
                                    <option value="private">Private (Only visible to you)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Private profiles hide your posts and details from others.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white">
                                    {isLoading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
