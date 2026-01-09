"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { BADGES } from "@/lib/badges";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNotification } from "@/context/NotificationContext";

export function AchievementManager() {
    const { user, userData } = useAuth();
    const { addNotification } = useNotification();

    const processedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!user || !userData) return;

        const checkAchievements = async () => {
            const unlockedBagdes = userData.achievements || []; // Array of strings (badge IDs)

            for (const badge of BADGES) {
                // Check if already unlocked (Database)
                if (unlockedBagdes.includes(badge.id)) continue;

                // Check if recently processed in this session (Prevention of spam)
                if (processedRef.current.has(badge.id)) continue;

                // Check condition
                if (badge.condition(userData)) {
                    // Mark as processed immediately
                    processedRef.current.add(badge.id);

                    try {
                        // 1. Update User Profile
                        await updateDoc(doc(db, "users", user.uid), {
                            achievements: arrayUnion(badge.id)
                        });

                        // 2. Add Persistent Notification
                        await addDoc(collection(db, "users", user.uid, "notifications"), {
                            type: "achievement",
                            message: `🏆 Achievement Unlocked: ${badge.label}!`,
                            read: false,
                            createdAt: serverTimestamp(),
                            data: { badgeId: badge.id }
                        });

                        // 3. Show Toast
                        addNotification(`Unlocked: ${badge.label}`, "success");

                    } catch (err) {
                        console.error("Error unlocking badge:", err);
                        // If failed, remove from set so we retry? Or keep to avoid spam loop on error?
                        // Let's keep it to avoid spam loop.
                    }
                }
            }
        };

        checkAchievements();

    }, [userData, user, addNotification]);

    return null; // Headless component
}
