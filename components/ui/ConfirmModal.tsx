"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#151a2d] border border-white/10 rounded-2xl shadow-xl z-50 p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={onClose} className="border-white/10 text-gray-300 hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white border-0"
                            >
                                Confirm
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
