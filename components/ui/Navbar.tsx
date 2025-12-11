"use client";

import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import CardNav from "./CardNav";

export function Navbar() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (loading) return null;

    const textColor = "#e0e7ff";

    const loggedInItems = [
        {
            label: "Discover",
            bgColor: "",
            textColor: textColor,
            links: [
                { label: "Community Feed", href: "/dashboard", ariaLabel: "Go to Dashboard" }
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
    ];

    const loggedOutItems = [
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
    ];

    return (
        <CardNav
            logoText="SkillSwap"
            items={user ? loggedInItems : loggedOutItems}
            baseColor="rgba(255,255,255,0.05)"
            buttonBgColor="#4f46e5"
            buttonTextColor="#fff"
            ctaLabel={!user ? "Get Started" : undefined}
            onCtaClick={!user ? () => router.push("/register") : undefined}
            menuColor="#fff"
        />
    );
}
