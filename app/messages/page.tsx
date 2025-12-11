"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, MessageSquare, Trash2 } from "lucide-react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

interface Conversation {
    id: string;
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage: string;
    updatedAt: string;
    hiddenBy?: string[];
}

import { useRouter } from "next/navigation";

export default function MessagesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (!user) return;

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

            // Filter out hidden conversations
            const visibleConvos = convos.filter(c => !c.hiddenBy?.includes(user.uid));
            setConversations(visibleConvos);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDeleteConversation = async (e: React.MouseEvent, convoId: string) => {
        e.preventDefault(); // Prevent navigation
        if (!user) return;

        if (!confirm("Are you sure you want to delete this conversation? It will reappear if they message you again.")) return;

        try {
            const convoRef = doc(db, "conversations", convoId);
            await updateDoc(convoRef, {
                hiddenBy: arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Error deleting conversation", error);
        }
    };

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
                                <div
                                    key={convo.id}
                                    onClick={() => router.push(`/messages/${convo.id}`)}
                                    className="block p-4 hover:bg-[#1a1f33] transition-colors group relative cursor-pointer"
                                >

                                    <div className="flex items-center justify-between pr-8">
                                        <div className="flex items-center gap-4">
                                            <Link
                                                href={`/profile/${otherUserId}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="relative z-20 hover:scale-105 transition-transform"
                                            >
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-inner border border-white/10 ring-2 ring-transparent hover:ring-blue-400 transition-all">
                                                    <span>{otherUserName.charAt(0)}</span>
                                                </div>
                                            </Link>
                                            <div>
                                                <h3 className="font-medium hover:text-blue-300 transition-colors">{otherUserName}</h3>
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
                                    <button
                                        onClick={(e) => handleDeleteConversation(e, convo.id)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                                        title="Delete Conversation"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}
