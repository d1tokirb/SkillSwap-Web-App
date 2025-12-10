"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [skillAds, setSkillAds] = useState<{ userId: string, userName: string, skill: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [fetching, setFetching] = useState(true);
    const [startingChat, setStartingChat] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchSkills();
        }
    }, [user, loading, router]);

    const fetchSkills = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const ads: { userId: string, userName: string, skill: string }[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.skillsOffered && Array.isArray(data.skillsOffered)) {
                    data.skillsOffered.forEach((s: string) => {
                        ads.push({ userId: doc.id, userName: data.name, skill: s });
                    });
                }
            });
            setSkillAds(ads);
        } catch (e) {
            console.error("Error fetching skills", e);
        } finally {
            setFetching(false);
        }
    };

    const handleMessage = async (targetUserId: string, targetUserName: string) => {
        if (!user) return;
        setStartingChat(targetUserId);

        // Create a unique conversation ID (sorted UIDs)
        const participants = [user.uid, targetUserId].sort();
        const convoId = participants.join("_");

        try {
            const convoRef = doc(db, "conversations", convoId);
            const convoSnap = await getDoc(convoRef);

            if (!convoSnap.exists()) {
                // Create new conversation
                await setDoc(convoRef, {
                    participants: participants,
                    participantNames: {
                        [user.uid]: user.displayName || "User",
                        [targetUserId]: targetUserName
                    },
                    lastMessage: "",
                    updatedAt: new Date().toISOString()
                });
            }

            router.push(`/messages/${convoId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setStartingChat("");
        }
    };

    const filteredSkills = skillAds.filter((ad) =>
        ad.skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || !user || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-7xl">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Community Feed</h1>
                    <p className="text-gray-400">Find skills to teach or learn.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search skills..."
                            className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link href={`/profile/${user.uid}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                            <Plus className="mr-2 h-4 w-4" /> Post
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((ad, idx) => (
                    <motion.div
                        key={`${ad.userId}-${ad.skill}-${idx}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        className="glass-card p-6 rounded-2xl flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                    {ad.skill}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-1 text-white">{ad.userName}</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Is offering to teach <span className="text-indigo-300">{ad.skill}</span>.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={`/profile/${ad.userId}`} className="flex-1">
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:text-white text-gray-300">
                                    Profile
                                </Button>
                            </Link>
                            {ad.userId !== user.uid && (
                                <Button
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm"
                                    onClick={() => handleMessage(ad.userId, ad.userName)}
                                    disabled={startingChat === ad.userId}
                                >
                                    {startingChat === ad.userId ? "..." : "Message"}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {filteredSkills.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 glass-panel rounded-2xl border-dashed border-white/20">
                        <p className="text-gray-400 text-lg mb-4">No matching skills found.</p>
                        <Link href={`/profile/${user.uid}`}>
                            <Button className="bg-indigo-600 hover:bg-indigo-500">Offer a Skill</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
