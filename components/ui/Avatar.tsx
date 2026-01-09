"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FirestoreTimestamp } from "@/types";

interface AvatarProps {
    src?: string | null; // Allow null for robustness
    alt?: string;
    className?: string;
    lastSeen?: FirestoreTimestamp; // Timestamp
    size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ src, alt = "User", className, lastSeen, size = "md" }: AvatarProps) {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const checkOnline = () => {
            if (!lastSeen) {
                setIsOnline(false);
                return;
            }

            const now = new Date();
            let seen: Date;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const val = lastSeen as any;
            if (val && typeof val.toDate === 'function') {
                seen = val.toDate();
            } else if (val && typeof val.seconds === 'number') {
                seen = new Date(val.seconds * 1000);
            } else {
                seen = new Date(val);
            }
            const diff = (now.getTime() - seen.getTime()) / 1000 / 60; // diff in minutes
            setIsOnline(diff < 10); // Online if seen in last 10 minutes
        };

        checkOnline();
        const interval = setInterval(checkOnline, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [lastSeen]);

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
        xl: "w-32 h-32 text-4xl" // Updated to match profile page size
    };

    const dotSize = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
        xl: "w-6 h-6"
    };

    const dotPosition = {
        sm: "bottom-0 right-0",
        md: "bottom-0 right-0",
        lg: "bottom-0.5 right-0.5",
        xl: "bottom-0 right-0" // Moved fully to corner
    };

    const initials = alt
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className={cn("relative inline-block shrink-0 rounded-full bg-[#0c1121]", sizeClasses[size].split(" ").slice(0, 2).join(" "), className)}>
            <div className={cn("relative w-full h-full rounded-full overflow-hidden")}>
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={cn("w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-inner select-none", className?.includes("text-") ? "" : sizeClasses[size].split(" ").slice(2).join(" "))}>
                        {initials}
                    </div>
                )}
            </div>

            {isOnline && (
                <span className={cn(
                    "absolute rounded-full bg-green-500 box-content z-30", // Boosted Z-index
                    dotSize[size],
                    dotPosition[size]
                )} />
            )}
        </div>
    );
}
