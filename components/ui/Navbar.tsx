"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import CardNav from "./CardNav";
import { NotificationCenter } from "../NotificationCenter";

export function Navbar() {
    const { user, loading, role } = useAuth();
    const router = useRouter();

    const handleLogout = React.useCallback(async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }, [router]);

    const textColor = "#e0e7ff";

    const loggedInItems = useMemo(() => [
        {
            label: "Discover",
            bgColor: "",
            textColor: textColor,
            links: [
                { label: "Community Feed", href: "/dashboard", ariaLabel: "Go to Dashboard" },
                { label: "Leaderboard", href: "/leaderboard", ariaLabel: "View Leaderboard" },
                { label: "Test Panel", href: "/test", ariaLabel: "System Tests" }, // Added for user testing
                ...(role === "admin" ? [{ label: "Admin Panel", href: "/admin", ariaLabel: "Admin Dashboard" }] : [])
            ]
        },
        {
            label: "Activity",
            bgColor: "",
            textColor: textColor,
            links: [
                { label: "Teaching Requests", href: "/requests", ariaLabel: "View Requests" },
                { label: "My Learning", href: "/learning", ariaLabel: "View Learning" },
                { label: "Inbox", href: "/messages", ariaLabel: "View Messages" }
            ]
        },
        {
            label: "Account",
            bgColor: "",
            textColor: textColor,
            links: [
                { label: "My Profile", href: user ? `/profile/${user.uid}` : "#", ariaLabel: "View Profile" },
                { label: "Settings", href: "/settings", ariaLabel: "Settings" },
                { label: "Sign Out", ariaLabel: "Log Out", onClick: handleLogout }
            ]
        }
    ], [role, user, textColor, handleLogout]); // Dependencies

    const loggedOutItems = useMemo(() => [
        {
            label: "Product",
            bgColor: "",
            textColor: textColor,
            links: [
                { label: "Features", href: "/#features", ariaLabel: "Features" },
                { label: "How it works", href: "/#how-it-works", ariaLabel: "How it works" }
            ]
        },
        {
            label: "Join",
            bgColor: "",
            textColor: textColor,
            links: [
                { label: "Log In", href: "/login", ariaLabel: "Log In" },
                { label: "Register", href: "/register", ariaLabel: "Register" }
            ]
        }
    ], [textColor]);

    if (loading) return null;

    return (
        <div className="relative w-full z-50">
            <CardNav
                key={user ? "user" : "guest"}
                logoText="SkillSwap"
                items={user ? loggedInItems : loggedOutItems}
                baseColor="rgba(255,255,255,0.05)"
                buttonBgColor="#4f46e5"
                buttonTextColor="#fff"
                ctaLabel={!user ? "Get Started" : undefined}
                onCtaClick={!user ? () => router.push("/register") : undefined}
                menuColor="#fff"
                rightContent={user ? <NotificationCenter /> : null}
            />
        </div>
    );
}
