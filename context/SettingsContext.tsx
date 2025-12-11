"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
    reduceMotion: boolean;
    toggleReduceMotion: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        // Check for saved preference
        const savedMotion = localStorage.getItem("reduceMotion");
        if (savedMotion) {
            setReduceMotion(JSON.parse(savedMotion));
        }
    }, []);

    const toggleReduceMotion = () => {
        setReduceMotion(prev => {
            const newValue = !prev;
            localStorage.setItem("reduceMotion", JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <SettingsContext.Provider value={{ reduceMotion, toggleReduceMotion }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
