"use client";

import { MotionConfig } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";

export function ClientMotionWrapper({ children }: { children: React.ReactNode }) {
    const { reduceMotion } = useSettings();

    return (
        <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
            {children}
        </MotionConfig>
    );
}
