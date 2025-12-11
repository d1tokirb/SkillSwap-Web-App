"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Search, Plus, Sparkles } from "lucide-react";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    interface Post {
        id: string;
        title: string;
        description: string;
        userId: string;
        authorName: string;
        authorPhoto: string;
        tags?: string[];
        category?: string;
    }

    const [posts, setPosts] = useState<Post[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [fetching, setFetching] = useState(true);
    const [startingChat, setStartingChat] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            // Fetch Blocked Users
            const fetchBlocked = async () => {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setBlockedUsers(userDoc.data().blockedUsers || []);
                }
            };
            fetchBlocked();
            fetchPosts();
        }
    }, [user, loading, router]);

    const fetchPosts = async () => {
        try {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedPosts: Post[] = [];
            querySnapshot.forEach((doc) => {
                fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
            });
            setPosts(fetchedPosts);
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    };

    const handleMessage = async (targetUserId: string, targetUserName: string) => {
        if (!user) return;
        setStartingChat(targetUserId);

        const participants = [user.uid, targetUserId].sort();
        const convoId = participants.join("_");

        try {
            const convoRef = doc(db, "conversations", convoId);
            const convoSnap = await getDoc(convoRef);

            if (!convoSnap.exists()) {
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
            console.error(error);
        } finally {
            setStartingChat("");
        }
    };




    const filteredPosts = posts.filter((post) => {
        if (blockedUsers.includes(post.userId)) return false;

        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.tags && post.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory || (selectedCategory === "Other" && !["Tech", "Art", "Music", "Language", "Lifestyle"].includes(post.category || ""));

        return matchesSearch && matchesCategory;
    });

    if (loading || !user || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl">
            {/* Hero & Search */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
                <div className="z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                        What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">learn</span> today?
                    </h1>
                    <p className="text-gray-400 text-lg">Discover skills, find teachers, and swap knowledge.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 rounded-lg pl-9 bg-[#0c1121]/50 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                        />
                    </div>
                    <Link href="/posts/create">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/20 w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Offer Skill
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "Tech", "Art", "Music", "Language", "Lifestyle", "Other"].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${selectedCategory === cat
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Masonry Feed */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {filteredPosts.map((post, idx) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="break-inside-avoid mb-6"
                    >
                        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(37,99,235,0.15)] hover:-translate-y-1">
                            {/* Author Header */}
                            <div className="flex items-center gap-3">
                                <Link href={`/profile/${post.userId}`} className="block relative group/avatar cursor-pointer">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden ring-2 ring-transparent group-hover/avatar:ring-blue-400 transition-all">
                                        {post.authorPhoto ? (
                                            <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                                        ) : (
                                            post.authorName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/profile/${post.userId}`} className="hover:underline hover:text-blue-300 transition-colors">
                                        <p className="text-sm font-medium text-white truncate">{post.authorName}</p>
                                    </Link>
                                    <p className="text-xs text-gray-500">Teacher</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 leading-tight">{post.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                                    {post.description}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {post.tags?.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Action */}
                            <div className="pt-2">
                                {post.userId !== user.uid ? (
                                    <Button
                                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 group-hover:border-blue-500/30 group-hover:text-blue-200 transition-colors"
                                        onClick={() => handleMessage(post.userId, post.authorName)}
                                        disabled={startingChat === post.userId}
                                    >
                                        {startingChat === post.userId ? "Starting Chat..." : "Message"}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/10 text-gray-400 cursor-default hover:bg-transparent"
                                    >
                                        Your Post
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-gray-500 text-lg mb-4">No skills found yet.</p>

                </div>
            )}
        </div>
    );
}
