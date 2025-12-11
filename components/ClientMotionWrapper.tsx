"use client";

import { MotionConfig } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";
import { ReactNode } from "react";

export function ClientMotionWrapper({ children }: { children: ReactNode }) {
    const { reduceMotion } = useSettings();

    return (
        <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
            {children}
        </MotionConfig>
    );
}
