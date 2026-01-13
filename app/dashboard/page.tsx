"use client";

import { useAuth } from "@/context/AuthContext";
import { ReportButton } from "@/components/ui/ReportButton";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc, query, orderBy, limit, startAfter, where, DocumentData, QueryDocumentSnapshot, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Search, Plus, Sparkles, Inbox, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserProfile, FirestoreTimestamp, Post } from "@/types";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Local Post interface removed in favor of @/types

    type EnrichedPost = Post & { authorLastSeen?: FirestoreTimestamp };

    const [posts, setPosts] = useState<EnrichedPost[]>([]);
    const [foundUsers, setFoundUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchMode, setSearchMode] = useState<"posts" | "users">("posts");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Auth Data
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [skillsSought, setSkillsSought] = useState<string[]>([]);

    // Pagination
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [fetching, setFetching] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [startingChat, setStartingChat] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            // Fetch Blocked Users
            const fetchBlocked = async () => {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setBlockedUsers(data.blockedUsers || []);
                    setSkillsSought(data.skillsSought || []);
                }
            };
            fetchBlocked();
            fetchPosts(true); // Initial fetch
        }
    }, [user, loading, router]);

    // Handle Search Mode Switch
    useEffect(() => {
        if (searchMode === "users") {
            if (searchTerm) fetchUsers();
            else setFoundUsers([]);
        }
    }, [searchMode, searchTerm]);

    const fetchPosts = async (isInitial = false) => {
        try {
            if (isInitial) setFetching(true);
            else setLoadingMore(true);

            let q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100));

            if (!isInitial && lastVisible) {
                q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(100));
            }

            const querySnapshot = await getDocs(q);

            if (querySnapshot.docs.length < 100) setHasMore(false);
            else setHasMore(true);

            if (!querySnapshot.empty) {
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            } else {
                if (!isInitial) setHasMore(false); // No more docs
            }

            const fetchedPosts: EnrichedPost[] = [];

            // Collect Author IDs
            const userIds = new Set<string>();
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.userId) userIds.add(data.userId);
            });

            // Fetch Author Data
            const authorData: Record<string, DocumentData> = {};
            if (userIds.size > 0) {
                const chunks = Array.from(userIds);
                await Promise.all(chunks.map(async (uid) => {
                    try {
                        const uDoc = await getDoc(doc(db, "users", uid));
                        if (uDoc.exists()) authorData[uid] = uDoc.data();
                    } catch (err) { console.error(err); }
                }));
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedPosts.push({
                    id: doc.id,
                    ...data,
                    authorLastSeen: authorData[data.userId]?.lastSeen,
                    authorPhoto: authorData[data.userId]?.photoURL || data.authorPhoto,
                    authorName: authorData[data.userId]?.name || data.authorName
                } as unknown as EnrichedPost);
            });

            if (isInitial) setPosts(fetchedPosts);
            // Deduplicate if needed, though startAfter usually handles overlap
            else setPosts(prev => [...prev, ...fetchedPosts]);

        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
            setLoadingMore(false);
        }
    };

    const fetchUsers = async () => {
        if (!searchTerm.trim()) return;
        setFetching(true);
        try {
            // Case-insensitive search requires client-side filtering or a dedicated search service (e.g. Algolia).
            // For this app, we fetch a larger set of users and filter client-side.
            // Note: This is not scalable for millions of users but works for thousands.

            const q = query(collection(db, "users"), limit(200)); // Fetch up to 200 recent users
            const snapshot = await getDocs(q);

            const term = searchTerm.toLowerCase();
            const users: UserProfile[] = [];

            snapshot.forEach(doc => {
                if (doc.id !== user?.uid) {
                    const userData = doc.data();
                    const name = (userData.name || "").toLowerCase();
                    const bio = (userData.bio || "").toLowerCase();

                    if (name.includes(term) || bio.includes(term)) {
                        users.push({ id: doc.id, ...userData } as UserProfile);
                    }
                }
            });
            setFoundUsers(users);
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    const handleMessage = async (targetUserId: string, targetUserName: string) => {
        if (!user || !targetUserId) return;
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
                    updatedAt: serverTimestamp()
                });
            }

            router.push(`/messages/${convoId}`);
        } catch (error) {
            console.error(error);
        } finally {
            setStartingChat("");
        }
    };

    // Client-side filtering for Posts (Search & Category)
    // Note: SearchTerm only filters FETCHED posts in this demo version of pagination
    // A robust solution requires backend search.
    const filteredPosts = posts.filter((post) => {
        if (blockedUsers.includes(post.userId)) return false;

        // Only filter by search if in 'posts' mode and we have fetched posts
        // Ideally we would trigger backend search if searchTerm changes
        const matchesSearch = searchMode === 'users' ? true : (
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.tags && post.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase())))
        );

        let matchesCategory = true;
        if (selectedCategory === "Recommended") {
            const userWants = skillsSought.map(s => s.toLowerCase());
            if (userWants.length === 0) matchesCategory = false;
            else {
                matchesCategory = userWants.some(skill =>
                    post.title.toLowerCase().includes(skill) ||
                    post.description.toLowerCase().includes(skill) ||
                    post.tags?.some((t: string) => t.toLowerCase().includes(skill)) ||
                    post.category?.toLowerCase().includes(skill)
                );
            }
        } else if (selectedCategory === "All") {
            matchesCategory = true;
        } else if (selectedCategory === "Other") {
            matchesCategory = !["Tech", "Art", "Music", "Language", "Lifestyle"].includes(post.category || "");
        } else {
            matchesCategory = post.category === selectedCategory;
        }

        return matchesSearch && matchesCategory;
    });

    if (loading || !user) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>; // Simplified partial loading state
    }

    return (
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
            {/* Hero & Search */}
            <div className="glass-panel p-4 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
                <div className="z-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                        What do you want to <span className="text-aurora">learn</span> today?
                    </h1>
                    <p className="text-gray-400 text-lg">Discover skills, find teachers, and swap knowledge.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10 items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder={searchMode === 'posts' ? "Search skills..." : "Search people..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 rounded-lg pl-9 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                    </div>
                    {/* Search Mode Toggle */}
                    <div className="flex bg-[#0c1121]/50 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setSearchMode('posts')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${searchMode === 'posts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => setSearchMode('users')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${searchMode === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            People
                        </button>
                    </div>

                    <Link href="/posts/create">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/20 w-full sm:w-auto whitespace-nowrap">
                            <Plus className="mr-2 h-4 w-4" /> Offer Skill
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Chips (Only show if searching Posts) */}
            {searchMode === 'posts' && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {["All", "Recommended", "Tech", "Art", "Music", "Language", "Lifestyle", "Other"].map(cat => (
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
            )}

            {/* User Search Results */}
            {searchMode === 'users' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foundUsers.map(u => (
                        <div key={u.id} className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all duration-300 hover:scale-105 hover:bg-white/5 cursor-pointer">
                            <Link href={`/profile/${u.id}`}>
                                <Avatar src={u.photoURL} alt={u.name} lastSeen={u.lastSeen} size="lg" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/profile/${u.id}`} className="hover:underline text-white font-bold block truncate">
                                    {u.name}
                                </Link>
                                <p className="text-sm text-gray-400 truncate">{u.bio || "No bio yet"}</p>
                                <div className="mt-2 flex gap-2">
                                    <Button size="sm" className="h-8 text-xs bg-white/10 hover:bg-white/20" onClick={() => router.push(`/profile/${u.id}`)}>
                                        View Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {foundUsers.length === 0 && !fetching && searchTerm && (
                        <div className="col-span-full py-24 text-center">
                            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <UserIcon className="h-10 w-10 text-gray-400 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                            <p className="text-gray-400">We couldn't find anyone named "{searchTerm}".</p>
                        </div>
                    )}
                    {searchTerm === "" && (
                        <div className="col-span-full py-24 text-center">
                            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-blue-400 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Find People</h3>
                            <p className="text-gray-400">Search by name or bio to connect with others.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Masonry Feed (Posts) */}
            {searchMode === 'posts' && (
                <>
                    <div className="columns-1 md:columns-2 lg:columns-3 2xl:columns-4 gap-6 space-y-6">
                        {filteredPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="break-inside-avoid mb-6"
                            >
                                <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.2)] hover:scale-[1.02]">
                                    <div className="flex items-center gap-3">
                                        <Link href={`/profile/${post.userId}`} className="block relative group/avatar cursor-pointer">
                                            <Avatar
                                                src={post.authorPhoto}
                                                alt={post.authorName}
                                                lastSeen={post.authorLastSeen}
                                                size="md"
                                                className="ring-2 ring-transparent group-hover/avatar:ring-blue-400 transition-all"
                                            />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/profile/${post.userId}`} className="hover:underline hover:text-blue-300 transition-colors">
                                                <p className="text-sm font-medium text-white truncate">{post.authorName}</p>
                                            </Link>
                                            <p className="text-xs text-gray-500">Teacher</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{post.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                                            {post.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags?.map((tag: string) => (
                                            <span key={tag} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
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
                                            <Button variant="outline" className="w-full border-white/10 text-gray-400 cursor-default hover:bg-transparent">
                                                Your Post
                                            </Button>
                                        )}
                                        {post.userId !== user.uid && (
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ReportButton
                                                    userId={post.userId}
                                                    userName={post.authorName}
                                                    content={post.description}
                                                    contentId={post.id}
                                                    context="Post"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && !fetching && (

                        <div className="flex flex-col items-center justify-center py-24 text-center glass-card border-white/10 rounded-2xl bg-gradient-to-b from-white/5 to-transparent">
                            <div className="bg-blue-600/20 p-6 rounded-full mb-6 ring-4 ring-blue-600/10">
                                <Sparkles className="h-10 w-10 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {selectedCategory === "Recommended" ? "No matches found" : "No skills found yet"}
                            </h3>
                            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                                {selectedCategory === "Recommended"
                                    ? (skillsSought.length > 0 ? "We couldn't find any posts matching your wanted skills yet." : "Add some 'Skills You Want' to your profile to get recommendations!")
                                    : "Be the first to offer a skill in this category or adjust your search filters."}
                            </p>
                            <Link href={selectedCategory === "Recommended" && skillsSought.length === 0 ? `/profile/${user?.uid}` : "/posts/create"}>
                                <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                                    {selectedCategory === "Recommended" && skillsSought.length === 0 ? (
                                        <>Update Profile</>
                                    ) : (
                                        <><Plus className="mr-2 h-4 w-4" /> Offer a Skill</>
                                    )}
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasMore && filteredPosts.length > 0 && (
                        <div className="flex justify-center pt-8">
                            <Button
                                onClick={() => fetchPosts(false)}
                                disabled={loadingMore}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                            >
                                {loadingMore ? "Loading..." : "Load More Posts"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
