"use client";

import { useEffect, useState } from "react";


import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserProfile } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        skillsSought: [] as string[]
    });

    useEffect(() => {
        if (targetUser && isOpen) {
            setFormData({
                name: targetUser.name || "",
                bio: targetUser.bio || "",
                role: targetUser.role || "user",
                skillsOffered: targetUser.skillsOffered || [],
                skillsSought: targetUser.skillsSought || []
            });
        }
    }, [targetUser, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updates: any = {
                name: formData.name,
                bio: formData.bio,
            };

            // Only admin can update role
            if (role === 'admin') {
                updates.role = formData.role;
            }

            await updateDoc(doc(db, "users", targetUser.id), updates);

            addNotification("Profile updated successfully", "success");

            if (onUserUpdated) {
                onUserUpdated({ ...targetUser, ...updates });
            }
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            addNotification("Failed to update profile", "error");
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
