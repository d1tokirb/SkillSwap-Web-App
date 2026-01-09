"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (skill: string, note: string, swapSkill?: string) => Promise<void>;
    recipientName: string;
    initialSkill?: string;
    availableSkills?: string[];
    myOfferedSkills?: string[];
    recipientWantedSkills?: string[];
}

export function RequestModal({ isOpen, onClose, onSubmit, recipientName, initialSkill = "", availableSkills = [], myOfferedSkills = [], recipientWantedSkills = [] }: RequestModalProps) {
    const [skill, setSkill] = useState(initialSkill);
    const [swapSkill, setSwapSkill] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    // Identify Perfect Matches
    const matchingSkills = myOfferedSkills.filter(offered =>
        recipientWantedSkills.some(wanted => wanted.toLowerCase() === offered.toLowerCase())
    );

    const otherSkills = myOfferedSkills.filter(offered =>
        !recipientWantedSkills.some(wanted => wanted.toLowerCase() === offered.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skill) return;
        setLoading(true);
        await onSubmit(skill, note, swapSkill || undefined);
        setLoading(false);
        onClose();
        setNote("");
        setSwapSkill("");
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
                        className="bg-[#0c1121] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Propose a Swap</h2>
                                <p className="text-sm text-gray-400">with {recipientName}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">I want to learn:</label>
                                {availableSkills.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            className="w-full bg-[#151a2d] border border-white/10 rounded-lg p-3 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white cursor-pointer"
                                            value={skill}
                                            onChange={(e) => setSkill(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select a skill...</option>
                                            {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
                                            <option value="other">Other / Not Listed</option>
                                        </select>
                                    </div>
                                ) : (
                                    <Input
                                        placeholder="e.g. Calculus, Guitar..."
                                        value={skill}
                                        onChange={(e) => setSkill(e.target.value)}
                                        required
                                        className="bg-[#151a2d] border-white/10"
                                    />
                                )}
                                {skill === "other" && availableSkills.length > 0 && (
                                    <Input
                                        className="mt-2 bg-[#151a2d] border-white/10"
                                        placeholder="Specify skill..."
                                        onChange={(e) => setSkill(e.target.value)}
                                        required
                                    />
                                )}
                            </div>

                            <div className="p-4 bg-blue-900/10 rounded-xl border border-blue-500/10">
                                <label className="block text-sm font-bold mb-2 text-blue-400 flex items-center justify-between">
                                    I can teach you:
                                    <span className="text-xs font-normal text-gray-500 opacity-70">(Optional)</span>
                                </label>
                                {myOfferedSkills.length > 0 ? (
                                    <div className="relative">
                                        <select
                                            className="w-full bg-[#151a2d] border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white cursor-pointer"
                                            value={swapSkill}
                                            onChange={(e) => setSwapSkill(e.target.value)}
                                        >
                                            <option value="">Just requesting (No swap)</option>

                                            {matchingSkills.length > 0 && (
                                                <optgroup label="✨ Perfect Matches (They want this!)">
                                                    {matchingSkills.map(s => <option key={s} value={s}>✨ {s}</option>)}
                                                </optgroup>
                                            )}

                                            <optgroup label="Other Skills">
                                                {otherSkills.map(s => <option key={s} value={s}>{s}</option>)}
                                            </optgroup>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">
                                        You haven&apos;t posted any skills yet.
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Note (Optional)</label>
                                <textarea
                                    className="w-full bg-[#151a2d] border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[80px] text-white placeholder:text-gray-600"
                                    placeholder="Say hi! Let them know why you're interested..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1 border-white/10 text-gray-300 hover:bg-white/5" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-500/20" disabled={loading || !skill}>
                                    {loading ? "Sending..." : (swapSkill ? "Propose Swap" : "Send Request")}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
