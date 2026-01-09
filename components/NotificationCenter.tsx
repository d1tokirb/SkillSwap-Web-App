"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, Heart, MessageSquare, Award, Info } from "lucide-react";
import { collection, query, orderBy, onSnapshot, limit, updateDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FirestoreTimestamp } from "@/types";

export interface Notification {
    id: string;
    type: "endorsement" | "request" | "system" | "achievement";
    message: string;
    read: boolean;
    createdAt: FirestoreTimestamp;
    data?: any; // link, related ID, etc
}

export function NotificationCenter() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const [mounted, setMounted] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, right: 0 });

    useEffect(() => {
        setMounted(true);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "endorsement": return <Heart className="h-4 w-4 text-pink-500" />;
            case "request": return <MessageSquare className="h-4 w-4 text-indigo-500" />;
            case "achievement": return <Award className="h-4 w-4 text-yellow-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, `users/${user.uid}/notifications`),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            console.log("Fetched notifications:", items.length);
            setNotifications(items);
            setUnreadCount(items.filter(n => !n.read).length);
        }, (error) => {
            console.error("Error fetching notifications:", error);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (id: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, `users/${user.uid}/notifications`, id), { read: true });
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const batch = writeBatch(db);
        notifications.filter(n => !n.read).forEach(n => {
            batch.update(doc(db, `users/${user.uid}/notifications`, n.id), { read: true });
        });
        await batch.commit();
    };

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 12,
                right: Math.max(16, window.innerWidth - rect.right) // Ensure at least 16px padding from right
            });
        }
        setIsOpen(!isOpen);
    };

    const handleClick = async (notification: Notification) => {
        if (!notification.read) markAsRead(notification.id);
        setIsOpen(false);
        // Navigate based on type/data
        if (notification.type === "endorsement") {
            router.push(`/profile/${user?.uid}`);
        } else if (notification.type === "request") {
            router.push("/requests");
        }
    };

    return (
        <div className="relative z-50">
            <button
                ref={buttonRef}
                onClick={toggleOpen}
                className="relative p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-[#0c1121] animate-pulse" />
                )}
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-[10000]" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'fixed',
                                    top: position.top,
                                    right: window.innerWidth < 640 ? 16 : position.right,
                                    left: window.innerWidth < 640 ? 16 : 'auto',
                                    maxWidth: '100vw' // Reset maxWidth constraints as we control left/right
                                }}
                                className="w-auto sm:w-80 bg-[#151a2d] border border-white/10 rounded-xl shadow-2xl z-[10001] overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0c1121]">
                                    <h3 className="font-bold text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300">
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => handleClick(n)}
                                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3 items-start ${!n.read ? "bg-blue-500/5" : ""}`}
                                            >
                                                <div className="mt-1 flex-shrink-0 p-1.5 bg-white/5 rounded-full">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${!n.read ? "text-white font-medium" : "text-gray-400"}`}>
                                                        {n.message}
                                                    </p>
                                                    <span className="text-xs text-gray-600 mt-1 block">
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                        {(n.createdAt as any)?.toDate ? (n.createdAt as any).toDate().toLocaleDateString() : "Just now"}
                                                    </span>
                                                </div>
                                            </div>

                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
