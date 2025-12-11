"use client";

import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { motion } from "framer-motion";
import { Moon, Sun, Trash2, Bell, Shield, ChevronRight, User, AlertTriangle, EyeOff } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

export default function SettingsPage() {
    const { reduceMotion, toggleReduceMotion } = useSettings();
    const { user } = useAuth();
    const router = useRouter();
    const { addNotification } = useNotification();

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, "users", user.uid));
            await signOut(auth);
            router.push("/");
            addNotification("Account deleted successfully.", "success");
        } catch (error) {
            console.error("Error deleting account:", error);
            addNotification("Failed to delete account.", "info");
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold mb-8">Settings</h1>

                    {/* Accessibility */}
                    <section className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            Accessibility
                        </h2>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div>
                                <h3 className="font-medium">Reduce Motion</h3>
                                <p className="text-sm text-gray-400">Minimize animations and movement.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={toggleReduceMotion}
                                className={`border-white/10 hover:bg-white/5 ${reduceMotion ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                            >
                                <EyeOff className="mr-2 h-4 w-4" />
                                {reduceMotion ? "Motion Reduced" : "Reduce Motion"}
                            </Button>
                        </div>
                    </section>



                    {/* Danger Zone */}
                    <section className="border border-red-500/20 bg-red-500/5 p-6 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" /> Danger Zone
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-red-400">Delete Account</h3>
                                <p className="text-sm text-red-500/70">Permanently delete your account and all data.</p>
                            </div>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => setDeleteConfirmOpen(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                            </Button>
                        </div>
                    </section>
                </motion.div>

                <ConfirmModal
                    isOpen={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={handleDeleteAccount}
                    title="Delete Account"
                    message="Are you sure you want to delete your account? This action cannot be undone."
                />
            </div>
        </div>
    );
}
