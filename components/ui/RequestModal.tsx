"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (skill: string, note: string) => Promise<void>;
    recipientName: string;
    initialSkill?: string;
    availableSkills?: string[];
}

export function RequestModal({ isOpen, onClose, onSubmit, recipientName, initialSkill = "", availableSkills = [] }: RequestModalProps) {
    const [skill, setSkill] = useState(initialSkill);
    const [note, setNote] = useState(""); // Note feature could be added later to data model
    const [loading, setLoading] = useState(false);

    // If initialSkill changes when opening, update state
    // (Effect omitted for simplicity, parent should handle key/remount or passing correct initial)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skill) return;
        setLoading(true);
        await onSubmit(skill, note);
        setLoading(false);
        onClose();
        setNote("");
        if (!initialSkill) setSkill("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md relative shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Request Session</h2>
                                <p className="text-sm text-muted-foreground">with {recipientName}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">What do you want to learn?</label>
                                {availableSkills.length > 0 ? (
                                    <select
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={skill}
                                        onChange={(e) => setSkill(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select a skill...</option>
                                        {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
                                        <option value="other">Other / Not Listed</option>
                                    </select>
                                ) : (
                                    <Input
                                        placeholder="e.g. Calculus, Guitar..."
                                        value={skill}
                                        onChange={(e) => setSkill(e.target.value)}
                                        required
                                    />
                                )}
                                {skill === "other" && availableSkills.length > 0 && (
                                    <Input
                                        className="mt-2"
                                        placeholder="Specify skill..."
                                        onChange={(e) => setSkill(e.target.value)}
                                        required
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Note (Optional)</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[80px]"
                                    placeholder="Hey, I'd love some help with..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-none" disabled={loading || !skill}>
                                    {loading ? "Sending..." : "Send Request"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
