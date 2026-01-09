"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, MessageSquare, Trash2, Inbox } from "lucide-react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Avatar } from "@/components/ui/Avatar";

interface Conversation {
    id: string;
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage: string;
    updatedAt: string;
    hiddenBy?: string[];
}

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

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
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                        <div className="bg-white/5 p-4 rounded-full mb-4">
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">
                            Connect with others by starting a conversation from the Dashboard or a Profile.
                        </p>
                        <Link href="/dashboard">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                                Find People
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                        className="divide-y divide-white/10"
                    >
                        {conversations.map((convo) => {
                            // Find the other user's name
                            const otherUserId = convo.participants.find(uid => uid !== user?.uid) || "";
                            const otherUserName = convo.participantNames?.[otherUserId] || "User";

                            return (
                                <motion.div
                                    key={convo.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
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
                                                <Avatar
                                                    alt={otherUserName}
                                                    size="md"
                                                    className="ring-2 ring-transparent hover:ring-blue-400 transition-all"
                                                />
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
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div >
    );
}
