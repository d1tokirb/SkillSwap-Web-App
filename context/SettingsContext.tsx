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
    const [reduceMotion, setReduceMotion] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [privacyMode, setPrivacyMode] = useState(false);

    useEffect(() => {
        // Check for saved preferences
        const savedMotion = localStorage.getItem("reduceMotion");
        if (savedMotion) setReduceMotion(JSON.parse(savedMotion));

        const savedPush = localStorage.getItem("pushNotifications");
        if (savedPush) setPushNotifications(JSON.parse(savedPush));

        const savedPrivacy = localStorage.getItem("privacyMode");
        if (savedPrivacy) setPrivacyMode(JSON.parse(savedPrivacy));
    }, []);

    const toggleReduceMotion = () => {
        setReduceMotion(prev => {
            const newValue = !prev;
            localStorage.setItem("reduceMotion", JSON.stringify(newValue));
            return newValue;
        });
    };

    const togglePushNotifications = () => {
        setPushNotifications(prev => {
            const newValue = !prev;
            localStorage.setItem("pushNotifications", JSON.stringify(newValue));
            return newValue;
        });
    };

    const togglePrivacyMode = () => {
        setPrivacyMode(prev => {
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
