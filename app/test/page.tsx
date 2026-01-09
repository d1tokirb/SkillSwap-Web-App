"use client";

import { DebugPanel } from "@/components/DebugPanel";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return (
        <div className="min-h-screen pt-24 px-4 container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8">System Tests</h1>
            <DebugPanel />
        </div>
    );
}
