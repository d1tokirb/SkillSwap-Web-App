"use client";

import { usePathname } from "next/navigation";
import DarkVeil from "./DarkVeil";
import Aurora from "./Aurora";

export default function BackgroundManager() {
    const pathname = usePathname();
    const isMainPage = pathname === "/";

    if (isMainPage) {
        return <DarkVeil />;
    }

    return (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: "#0a0118" }}>
            <Aurora speed={0.5} />
        </div>
    );
}
