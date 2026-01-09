"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy } from "lucide-react";
import { calculateLevel, getXpProgress, XP_PER_LEVEL } from "@/lib/gamification";

export function XPNotification() {
    const { user } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const [xpGained, setXpGained] = useState(0);
    const [currentXp, setCurrentXp] = useState(0);
    const [leveledUp, setLeveledUp] = useState(false);
    const prevXpRef = useRef<number | null>(null);

    // Track queue of gains to prevent rapid overwrites? 
    // For simplicity, we just update the visual whenever a snapshot comes in.

    useEffect(() => {
        if (!user) return;

        const unsub = onSnapshot(doc(db, "users", user.uid), (docPic) => {
            const data = docPic.data();
            const newXp = data?.xp || 0;

            // Initial load
            if (prevXpRef.current === null) {
                prevXpRef.current = newXp;
                setCurrentXp(newXp);
                return;
            }

            // If XP increased
            if (newXp > prevXpRef.current) {
                const gained = newXp - prevXpRef.current;
                const oldLevel = calculateLevel(prevXpRef.current);
                const newLevel = calculateLevel(newXp);

                setXpGained(gained);
                setCurrentXp(newXp);
                setLeveledUp(newLevel > oldLevel);
                setShowPopup(true);

                // Hide after 3 seconds
                setTimeout(() => {
                    setShowPopup(false);
                    setLeveledUp(false);
                }, 4000);
            }

            prevXpRef.current = newXp;
        });

        return () => unsub();
    }, [user]);

    const progress = getXpProgress(currentXp);
    const progressPercent = (progress / XP_PER_LEVEL) * 100;

    return (
        <AnimatePresence>
            {showPopup && (
                <div className="fixed bottom-8 left-8 z-50 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        className="bg-[#151a2d]/90 backdrop-blur-md border border-blue-500/30 p-4 rounded-xl shadow-2xl w-80 relative overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-transparent pointer-events-none" />

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-blue-500/20 rounded-full">
                                {leveledUp ? (
                                    <Trophy className="h-6 w-6 text-yellow-400 animate-bounce" />
                                ) : (
                                    <Zap className="h-6 w-6 text-blue-400" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-lg text-white">
                                    {leveledUp ? "Level Up!" : "XP Gained!"}
                                </h4>
                                <p className="text-blue-200 text-sm">
                                    +{xpGained} XP
                                </p>
                            </div>

                            <span className="text-xl font-bold text-blue-400">
                                Lvl {calculateLevel(currentXp)}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 relative z-10">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{progress} / {XP_PER_LEVEL} XP</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: `${((progress - xpGained) / XP_PER_LEVEL) * 100}%` }} // Approximate generic prev width
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                                />
                            </div>
                        </div>

                        {/* Confetti / Shine for Level Up */}
                        {leveledUp && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-yellow-500/10 z-0"
                            />
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
