"use client";

import { usePathname } from "next/navigation";
import DarkVeil from "./DarkVeil";
import Aurora from "./Aurora";

import { useSettings } from "@/context/SettingsContext";

export default function BackgroundManager() {
    const pathname = usePathname();
    const isMainPage = pathname === "/";
    const { reduceMotion } = useSettings();

    if (reduceMotion) {
        return <div className="fixed inset-0 -z-10 bg-[#0c1121]" />;
    }

    if (isMainPage) {
        return (
            <div className="fixed inset-0 -z-10" style={{ backgroundColor: "#0c1121" }}>
                <Aurora speed={0.3} amplitude={1.2} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: "#0c1121" }}>
            <Aurora speed={0.5} />
        </div>
    );
}
