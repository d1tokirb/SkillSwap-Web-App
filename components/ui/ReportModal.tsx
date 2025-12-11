"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, description: string) => void;
    userName: string;
}

const REPORT_REASONS = [
    "Inappropriate Content",
    "Spam or Scam",
    "Harassment or Bullying",
    "Fake Profile",
    "Other"
];

export function ReportModal({ isOpen, onClose, onSubmit, userName }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) return;
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSubmit(selectedReason, description);
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setSelectedReason("");
            setDescription("");
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0c1121] dark:bg-[#0c1121] bg-white border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6"
                                >
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2">Report Received</h3>
                                <p className="text-gray-400">Thank you for helping keep our community safe. We will review this report shortly.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertTriangle className="h-5 w-5" />
                                        <h2 className="text-lg font-bold text-foreground">Report User</h2>
                                    </div>
                                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-6">
                                    <p className="text-sm text-gray-400">
                                        You are reporting <span className="text-foreground font-semibold">{userName}</span>. Please select a reason for your report.
                                    </p>

                                    <div className="space-y-3">
                                        {REPORT_REASONS.map((reason) => (
                                            <button
                                                key={reason}
                                                onClick={() => setSelectedReason(reason)}
                                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedReason === reason
                                                        ? "bg-red-500/10 border-red-500/50 text-red-400"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                    }`}
                                            >
                                                {reason}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedReason && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Additional Details (Optional)</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:border-red-500/30"
                                                placeholder="Please provide any specific details..."
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleSubmit}
                                        disabled={!selectedReason || isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Report"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
