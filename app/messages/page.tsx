"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, MessageSquare } from "lucide-react";

interface Conversation {
    id: string;
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage: string;
    updatedAt: string;
}

export default function MessagesPage() {
    const { user, loading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (!user) return;

        // Listen for conversations where the user is a participant
        // Note: Firestore array-contains query
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Conversation[];
            setConversations(convos);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Messages</h1>

            <div className="glass-card border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
                {conversations.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                        <p>No messages yet.</p>
                        <p className="text-sm">Visit the Dashboard to start a conversation!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {conversations.map((convo) => {
                            // Find the other user's name
                            const otherUserId = convo.participants.find(uid => uid !== user?.uid) || "";
                            const otherUserName = convo.participantNames?.[otherUserId] || "User";

                            return (
                                <Link
                                    key={convo.id}
                                    href={`/messages/${convo.id}`}
                                    className="block p-4 hover:bg-[#1a1f33] transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                                <span>{otherUserName.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{otherUserName}</h3>
                                                <p className="text-sm text-muted-foreground truncate max-w-md">
                                                    {convo.lastMessage || "Start chatting..."}
                                                </p>
                                            </div>
                                        </div>
                                        {convo.updatedAt && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(convo.updatedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
