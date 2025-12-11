"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, MessageCircle } from "lucide-react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

type NotificationType = "info" | "success" | "message";

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    addNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();

    const addNotification = (message: string, type: NotificationType = "info") => {
        const id = Math.random().toString(36).substring(7);
        setNotifications((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    // Listen for new messages
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "modified") {
                    const data = change.doc.data();
                    const lastUpdated = new Date(data.updatedAt).getTime();
                    const now = Date.now();

                    // Check if update is recent (within 5 seconds) to prevent spam on load
                    // and check if the last message was NOT sent by current user
                    // Note: Ideally we'd compare against a 'lastChecked' timestamp, 
                    // but for "live" notifications this works if the app is open.
                    if (now - lastUpdated < 10000 && data.lastMessage && data.lastMessageSenderId !== user.uid) {
                        const senderName = data.participantNames[data.lastMessageSenderId] || "Someone";
                        addNotification(`New message from ${senderName}`, "message");
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            {/* Render Toasts Portal */}
            {typeof document !== "undefined" && createPortal(
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                    <AnimatePresence>
                        {notifications.map((n) => (
                            <Toast key={n.id} notification={n} onClose={() => removeNotification(n.id)} />
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </NotificationContext.Provider>
    );
}

function Toast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
    const isMessage = notification.type === "message";

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3 
                ${isMessage ? "bg-blue-600/90 border-blue-500/50" : "bg-[#151a2d]/90 border-white/10"}`}
        >
            <div className={`p-2 rounded-full ${isMessage ? "bg-white/20" : "bg-white/5"}`}>
                {isMessage ? <MessageCircle className="h-5 w-5 text-white" /> : <Bell className="h-5 w-5 text-gray-300" />}
            </div>
            <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-white">{notification.message}</p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within NotificationProvider");
    return context;
};
