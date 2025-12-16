"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "@/types";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: string | null;
    userData: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    role: null,
    userData: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);

    // Heartbeat Effect: Updates lastSeen every 5 minutes
    useEffect(() => {
        if (!user) return;

        const updateHeartbeat = async () => {
            try {
                await updateDoc(doc(db, "users", user.uid), {
                    lastSeen: serverTimestamp()
                });
            } catch (err) {
                // Silent fail for heartbeat
            }
        };

        // Initial call
        updateHeartbeat();

        // Interval
        const interval = setInterval(updateHeartbeat, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch user data & role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data() as UserProfile;
                        setRole(data.role || "user");
                        setUserData(data);
                    } else {
                        setRole("user"); // Default role
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole("user");
                    setUserData(null);
                }
            } else {
                setRole(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, role, userData }}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
