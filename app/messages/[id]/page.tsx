"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { addXp, XP_REWARDS } from "@/lib/gamification";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { RequestModal } from "@/components/ui/RequestModal";
import { useNotification } from "@/context/NotificationContext";
import { checkContentSafety, reportViolation } from "@/lib/moderation";

interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: any;
}

export default function ChatPage() {
    const { id } = useParams(); // conversation ID
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUserName, setOtherUserName] = useState("Chat");
    const [otherUserId, setOtherUserId] = useState("");
    const [otherUserSkills, setOtherUserSkills] = useState<string[]>([]);
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!id || !user) return;

        // Fetch conversation details to get names
        const fetchConvoDetails = async () => {
            const docRef = doc(db, "conversations", id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const oUid = data.participants.find((uid: string) => uid !== user.uid);
                if (oUid && data.participantNames) {
                    setOtherUserName(data.participantNames[oUid] || "User");
                    setOtherUserId(oUid);
                    // Fetch other user's skills for request modal
                    const userDoc = await getDoc(doc(db, "users", oUid));
                    if (userDoc.exists()) {
                        setOtherUserSkills(userDoc.data().skillsOffered || []);
                    }
                }
            }
        };
        fetchConvoDetails();

        // Listen for messages ... same code
        const q = query(
            collection(db, "conversations", id as string, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(msgs);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        return () => unsubscribe();
    }, [id, user]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !user) return;

        try {
            setNewMessage("");

            // 1. Add message immediately
            const docRef = await addDoc(collection(db, "conversations", id as string, "messages"), {
                senderId: user.uid,
                text: text,
                createdAt: serverTimestamp()
            });

            // 2. Background Moderation
            (async () => {
                const safety = await checkContentSafety(text);
                if (safety.flagged) {
                    // Blocked! Delete the message.
                    await deleteDoc(doc(db, "conversations", id as string, "messages", docRef.id));
                    await reportViolation(user.uid, user.displayName || "Unknown", text, safety.reason || "Unsafe message", "Chat Message (Retroactively Blocked)");
                    addNotification(`Message removed: ${safety.reason}`, "error");
                } else if (safety.severity === "low") {
                    reportViolation(user.uid, user.displayName || "Unknown", text, safety.reason || "Low severity message", "Chat Message (Allowed)");
                }
            })();

            // Update conversation last message AND senderId
            await setDoc(doc(db, "conversations", id as string), {
                lastMessage: text,
                lastMessageSenderId: user.uid,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Award XP
            await addXp(user.uid, XP_REWARDS.SEND_MESSAGE);

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleRequestSubmit = async (skill: string, note: string) => {
        if (!user || !id) return;

        try {
            // Get other user ID
            const docRef = doc(db, "conversations", id as string);
            const docSnap = await getDoc(docRef);
            let toUserId = "";
            if (docSnap.exists()) {
                const data = docSnap.data();
                toUserId = data.participants.find((uid: string) => uid !== user.uid);
            }

            if (!toUserId) {
                addNotification("Could not determine recipient.", "info");
                return;
            }

            await addDoc(collection(db, "requests"), {
                fromUserId: user.uid,
                fromUserName: user.displayName,
                toUserId: toUserId,
                toUserName: otherUserName,
                skill: skill,
                status: "pending",
                createdAt: new Date().toISOString(),
                note: note
            });
            addNotification("Request sent successfully!", "success");

            // Automatically send a message about the request
            const autoMsg = `I just sent a request to learn ${skill}!`;
            await addDoc(collection(db, "conversations", id as string, "messages"), {
                senderId: user.uid,
                text: autoMsg,
                createdAt: serverTimestamp()
            });
            await setDoc(doc(db, "conversations", id as string), {
                lastMessage: autoMsg,
                lastMessageSenderId: user.uid,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Award XP
            await addXp(user.uid, XP_REWARDS.SEND_REQUEST);

        } catch (err) {
            console.error("Error sending request", err);
            addNotification("Failed to send request.", "info");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-64px)] flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/messages">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    {otherUserId ? (
                        <Link href={`/profile/${otherUserId}`} className="hover:underline hover:text-blue-300 transition-colors">
                            <h1 className="text-xl font-bold">{otherUserName}</h1>
                        </Link>
                    ) : (
                        <h1 className="text-xl font-bold">{otherUserName}</h1>
                    )}
                    <p className="text-xs text-muted-foreground">Messaging</p>
                </div>
                <div className="ml-auto">
                    <Button size="sm" variant="outline" onClick={() => setRequestModalOpen(true)}>
                        <Calendar className="mr-2 h-4 w-4" /> Request Session
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-card border border-white/10 rounded-xl overflow-hidden flex flex-col">
                {/* Messages messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user?.uid;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-[#1a1f33] text-white rounded-tl-none border border-white/10'
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                    <span className="text-[10px] opacity-70 block mt-1">
                                        {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>

                {/* Input area */}
                <form onSubmit={sendMessage} className="p-4 bg-[#0c1121] border-t border-white/10 flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="md" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>

            <RequestModal
                isOpen={requestModalOpen}
                onClose={() => setRequestModalOpen(false)}
                onSubmit={handleRequestSubmit}
                recipientName={otherUserName}
                availableSkills={otherUserSkills}
            />
        </div>
    );
}
