"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    toUserId: string;
    toUserName: string;
    onReviewSubmitted?: () => void;
}

export function ReviewModal({ isOpen, onClose, toUserId, toUserName, onReviewSubmitted }: ReviewModalProps) {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            addNotification("Please select a rating", "error");
            return;
        }
        if (!user) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "reviews"), {
                fromUserId: user.uid,
                fromUserName: user.displayName || "Anonymous",
                fromUserPhoto: user.photoURL || null,
                toUserId: toUserId,
                rating: rating,
                comment: comment,
                createdAt: serverTimestamp(),
            });

            addNotification("Review submitted successfully!", "success");
            if (onReviewSubmitted) onReviewSubmitted();
            onClose();
            setRating(0);
            setComment("");
        } catch (error) {
            console.error("Error submitting review:", error);
            addNotification("Failed to submit review", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-[#0c1121] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">Rate Experience</h2>
                            <p className="text-sm text-gray-400">Review interaction with {toUserName}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                className={`h-8 w-8 transition-colors ${star <= (hoverRating || rating)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-600 fill-transparent"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-sm font-medium text-yellow-400 h-5">
                                    {hoverRating > 0 ? (
                                        ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating]
                                    ) : (
                                        rating > 0 && ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]
                                    )}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share details about your experience..."
                                    className="w-full bg-[#151a2d] border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[100px] text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1 border-white/10 text-gray-300 hover:bg-white/5" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black border-none font-bold" disabled={isSubmitting || rating === 0}>
                                    {isSubmitting ? "Submitting..." : "Submit Review"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

