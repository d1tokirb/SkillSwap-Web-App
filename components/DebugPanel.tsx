"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { useNotification } from "@/context/NotificationContext";
import { Bell, Star, Zap, MessageSquare, Award } from "lucide-react";
import { addXp } from "@/lib/gamification";

export function DebugPanel() {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const simulateEndorsement = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "users", user.uid, "notifications"), {
                type: "endorsement",
                message: "Bot User endorsed you for Debugging!",
                read: false,
                createdAt: serverTimestamp()
            });
            // Also actually add the endorsement count so badge logic works
            await updateDoc(doc(db, "users", user.uid), {
                "endorsements.Debugging": increment(1)
            });
            addNotification("Simulated incoming endorsement", "info");
        } catch (e) {
            console.error(e);
            addNotification("Error simulating endorsement", "error");
        }
        setLoading(false);
    };

    const simulateRequest = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "users", user.uid, "notifications"), {
                type: "request",
                message: "Bot User requested a session: 'Help me test this!'",
                read: false,
                createdAt: serverTimestamp()
            });
            addNotification("Simulated incoming request", "info");
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const grantXp = async (amount: number) => {
        if (!user) return;
        setLoading(true);
        try {
            await addXp(user.uid, amount);
            addNotification(`Granted ${amount} XP`, "success");
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🛠️ Testing Control Panel</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notifications */}
                <div className="space-y-2">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase">Notifications</h3>
                    <Button onClick={simulateEndorsement} disabled={loading} className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20">
                        <Bell className="mr-2 h-4 w-4" /> Simulate Endorsement
                    </Button>
                    <Button onClick={simulateRequest} disabled={loading} className="w-full justify-start bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                        <MessageSquare className="mr-2 h-4 w-4" /> Simulate Request
                    </Button>
                </div>

                {/* Gamification */}
                <div className="space-y-2">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase">Gamification</h3>
                    <Button onClick={() => grantXp(50)} disabled={loading} className="w-full justify-start bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                        <Zap className="mr-2 h-4 w-4" /> Grant 50 XP (Action)
                    </Button>
                    <Button onClick={() => grantXp(1000)} disabled={loading} className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20">
                        <Star className="mr-2 h-4 w-4" /> Force Level Up (+1000XP)
                    </Button>
                </div>
            </div>

            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-sm text-yellow-200">
                <p><strong>Note:</strong> These actions directly affect your real account data. Use &quot;Simulate Endorsement&quot; 5 times to test the &quot;Helpful Hand&quot; badge!</p>
            </div>
        </div>
    );
}
