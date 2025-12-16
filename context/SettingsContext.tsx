"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
    reduceMotion: boolean;
    toggleReduceMotion: () => void;
    pushNotifications: boolean;
    togglePushNotifications: () => void;
    privacyMode: boolean;
    togglePrivacyMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [reduceMotion, setReduceMotion] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("reduceMotion");
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });

    const [pushNotifications, setPushNotifications] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("pushNotifications");
            return saved ? JSON.parse(saved) : true;
        }
        return true;
    });

    const [privacyMode, setPrivacyMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("privacyMode");
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });

    const toggleReduceMotion = () => {
        setReduceMotion((prev: boolean) => {
            const newValue = !prev;
            localStorage.setItem("reduceMotion", JSON.stringify(newValue));
            return newValue;
        });
    };

    const togglePushNotifications = () => {
        setPushNotifications((prev: boolean) => {
            const newValue = !prev;
            localStorage.setItem("pushNotifications", JSON.stringify(newValue));
            return newValue;
        });
    };

    const togglePrivacyMode = () => {
        setPrivacyMode((prev: boolean) => {
            const newValue = !prev;
            localStorage.setItem("privacyMode", JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <SettingsContext.Provider value={{
            reduceMotion, toggleReduceMotion,
            pushNotifications, togglePushNotifications,
            privacyMode, togglePrivacyMode
        }}>
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
