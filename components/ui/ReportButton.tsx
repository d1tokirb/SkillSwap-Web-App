"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { reportViolation } from "@/lib/moderation";
import { useNotification } from "@/context/NotificationContext";

interface ReportButtonProps {
    userId: string;
    userName: string;
    content: string;
    contentId: string;
    context: string; // "Post", "Profile", "Chat"
}

export function ReportButton({ userId, userName, content, contentId, context }: ReportButtonProps) {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [reporting, setReporting] = useState(false);

    const handleReport = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Report this content to admins?")) return;

        setReporting(true);
        try {
            await reportViolation(
                userId,
                userName,
                content,
                "User Reported: " + (prompt("Optional reason (or leave blank):") || "Inappropriate Content"),
                `${context} (ID: ${contentId})`
            );
            addNotification("Report submitted. Admins will review it shortly.", "success");
        } catch (error) {
            console.error("Report failed", error);
            addNotification("Failed to submit report", "error");
        } finally {
            setReporting(false);
        }
    };

    if (!user || user.uid === userId) return null; // Don't report self

    return (
        <Button
            size="sm"
            variant="ghost"
            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-2"
            onClick={handleReport}
            disabled={reporting}
            title="Report"
        >
            <AlertTriangle className="h-4 w-4" />
        </Button>
    );
}
