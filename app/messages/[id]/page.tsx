"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { RequestModal } from "@/components/ui/RequestModal";

interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: any;
}

export default function ChatPage() {
    const { id } = useParams(); // conversation ID
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUserName, setOtherUserName] = useState("Chat");
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
                const otherUserId = data.participants.find((uid: string) => uid !== user.uid);
                if (otherUserId && data.participantNames) {
                    setOtherUserName(data.participantNames[otherUserId] || "User");
                    // Fetch other user's skills for request modal
                    const userDoc = await getDoc(doc(db, "users", otherUserId));
                    if (userDoc.exists()) {
                        setOtherUserSkills(userDoc.data().skillsOffered || []);
                    }
                }
            }
        };
        fetchConvoDetails();

        // Listen for messages
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
        if (!newMessage.trim() || !user) return;

        try {
            const text = newMessage.trim();
            setNewMessage("");

            // Add message to subcollection
            await addDoc(collection(db, "conversations", id as string, "messages"), {
                senderId: user.uid,
                text: text,
                createdAt: serverTimestamp()
            });

            // Update conversation last message
            await setDoc(doc(db, "conversations", id as string), {
                lastMessage: text,
                updatedAt: new Date().toISOString()
            }, { merge: true });

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
                alert("Could not determine recipient.");
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
            alert("Request sent successfully!");

            // Automatically send a message about the request
            const autoMsg = `I just sent a request to learn ${skill}!`;
            await addDoc(collection(db, "conversations", id as string, "messages"), {
                senderId: user.uid,
                text: autoMsg,
                createdAt: serverTimestamp()
            });
            await setDoc(doc(db, "conversations", id as string), {
                lastMessage: autoMsg,
                updatedAt: new Date().toISOString()
            }, { merge: true });

        } catch (err) {
            console.error("Error sending request", err);
            alert("Failed to send request.");
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
                    <h1 className="text-xl font-bold">{otherUserName}</h1>
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
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-white/10 text-foreground rounded-tl-none'
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
                <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
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
