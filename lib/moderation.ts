import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

export const checkContentSafety = async (text: string): Promise<{ flagged: boolean; reason?: string; severity?: "high" | "low" | "safe" }> => {
    if (!text || text.trim().length === 0) return { flagged: false, severity: "safe" };

    try {
        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "moderate", content: text })
        });

        if (!res.ok) {
            console.error("Moderation API failed");
            return { flagged: false, severity: "safe" };
        }

        const data = await res.json();
        // Strict blocking only for HIGH severity
        const isFlagged = data.severity === "high";

        return {
            flagged: isFlagged,
            severity: data.severity,
            reason: data.reason
        };
    } catch (error) {
        console.error("Moderation error:", error);
        return { flagged: false, severity: "safe" };
    }
};

export const reportViolation = async (userId: string, userName: string, content: string, reason: string, context: string) => {
    try {
        // 1. Log to moderation_logs
        await addDoc(collection(db, "moderation_logs"), {
            userId,
            userName,
            content,
            reason,
            context,
            createdAt: serverTimestamp(),
            status: "pending" // pending admin review
        });

        // 2. Notify Admins
        const q = query(collection(db, "users"), where("role", "==", "admin"));
        const admins = await getDocs(q);

        const notificationsPromises = admins.docs.map(adminDoc => {
            return addDoc(collection(db, "users", adminDoc.id, "notifications"), {
                type: "security_alert",
                title: "Safety Violation Blocked",
                message: `User ${userName} attempted to post unsafe content in ${context}. Reason: ${reason}`,
                read: false,
                createdAt: serverTimestamp(),
                link: `/admin/logs` // non-existent page but good for future
            });
        });

        await Promise.all(notificationsPromises);
    } catch (error) {
        console.error("Failed to report violation:", error);
    }
};
