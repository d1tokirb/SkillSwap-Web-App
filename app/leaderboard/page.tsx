"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { UserProfile } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trophy, Medal, Crown } from "lucide-react";
import { calculateLevel } from "@/lib/gamification";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const q = query(
                    collection(db, "users"),
                    orderBy("xp", "desc"),
                    limit(50)
                );
                const snapshot = await getDocs(q);
                const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
                setUsers(fetchedUsers);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (rank: number) => {
        if (rank === 0) return <Crown className="h-6 w-6 text-yellow-400 fill-yellow-400" />;
        if (rank === 1) return <Medal className="h-6 w-6 text-gray-300 fill-gray-300" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-amber-600 fill-amber-600" />;
        return <span className="font-bold text-gray-500">#{rank + 1}</span>;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2">
                    Global Leaderboard
                </h1>
                <p className="text-muted-foreground">The most legendary SkillSwappers in the galaxy! 🚀</p>
            </div>

            <div className="bg-[#151a2d]/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {users.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center p-4 hover:bg-white/5 transition-colors ${index === 0 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""}`}
                            >
                                <div className="w-12 flex justify-center flex-shrink-0">
                                    {getRankIcon(index)}
                                </div>

                                <Link href={`/profile/${user.id}`} className="flex items-center gap-4 flex-1">
                                    <Avatar src={user.photoURL} alt={user.name} lastSeen={user.lastSeen} />
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                                            {user.name}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            Level {calculateLevel(user.xp || 0)}
                                        </p>
                                    </div>
                                </Link>

                                <div className="text-right">
                                    <span className="block font-mono font-bold text-xl text-blue-400">
                                        {(user.xp || 0).toLocaleString()} XP
                                    </span>
                                    {user.endorsements && (
                                        <div className="flex justify-end gap-1 mt-1">
                                            {Object.entries(user.endorsements).slice(0, 3).map(([skill, count]) => (
                                                <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                                                    {skill} {count > 1 ? `x${count}` : ''}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
