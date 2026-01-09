"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Star, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { addXp, XP_REWARDS } from "@/lib/gamification";

interface EndorsementModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: string;
    targetUserName: string;
    skills: string[];
}

export function EndorsementModal({ isOpen, onClose, targetUserId, targetUserName, skills }: EndorsementModalProps) {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleEndorse = async () => {
        if (!selectedSkill || !user) return;
        setSubmitting(true);

        try {
            const userRef = doc(db, "users", targetUserId);
            // Use dot notation to update map field
            await updateDoc(userRef, {
                [`endorsements.${selectedSkill}`]: increment(1)
            });

            // Persistent Notification
            await addDoc(collection(db, "users", targetUserId, "notifications"), {
                type: "endorsement",
                message: `${user.displayName || "Someone"} endorsed you for ${selectedSkill}!`,
                read: false,
                createdAt: serverTimestamp()
            });

            // Toast
            addNotification(`You endorsed ${targetUserName} for ${selectedSkill}!`, "success");
            onClose();
        } catch (error) {
            console.error(error);
            addNotification("Failed to endorse user", "info");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#151a2d] border border-white/10 p-6 rounded-xl w-full max-w-md relative shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                        <ThumbsUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Endorse {targetUserName}</h2>
                    <p className="text-gray-400 mt-2">
                        Did they help you? Pick a skill to endorse!
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {["Helpful", "Friendly", "Knowledgeable", "Patient"].map(skill => (
                        <button
                            key={skill}
                            onClick={() => setSelectedSkill(skill)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all
                                ${selectedSkill === skill
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            {skill}
                        </button>
                    ))}
                    {/* Default skills fallback ensures we always have options */}
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        disabled={!selectedSkill || submitting}
                        onClick={handleEndorse}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {submitting ? "Endorsing..." : "Submit Endorsement"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
