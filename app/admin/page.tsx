"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, TrendingUp, Users, Calendar, Shield, ShieldOff, MessageSquare, FileText, ChevronDown, ChevronRight, ChevronUp, Clock, Search, Edit } from "lucide-react";
import { query, orderBy, limit } from "firebase/firestore";

import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useNotification } from "@/context/NotificationContext";
import { EditProfileModal } from "@/components/EditProfileModal";

export default function AdminPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const { addNotification } = useNotification();

    const [users, setUsers] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSessions: 0,
        totalPosts: 0,
        topSkills: [] as { name: string; count: number }[]
    });
    const [view, setView] = useState<"users" | "posts" | "messages" | "reports">("users");
    const [searchTerm, setSearchTerm] = useState("");

    // Expansion State
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [expandedConvoId, setExpandedConvoId] = useState<string | null>(null);
    const [convoMessages, setConvoMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<any>(null);

    useEffect(() => {
        if (!loading) {
            if (!user || role !== "admin") {
                router.push("/");
            } else {
                fetchData();
            }
        }
    }, [user, role, loading, router]);

    const fetchData = async () => {
        try {
            // Fetch Users
            const userSnapshot = await getDocs(collection(db, "users"));
            const usersList: any[] = [];
            const skillCounts: Record<string, number> = {};

            userSnapshot.forEach(doc => {
                const data = doc.data();
                usersList.push({ id: doc.id, ...data });

                // Count skills
                if (data.skillsOffered && Array.isArray(data.skillsOffered)) {
                    data.skillsOffered.forEach((s: string) => {
                        skillCounts[s] = (skillCounts[s] || 0) + 1;
                    });
                }
            });
            setUsers(usersList);

            // Fetch Posts
            const postsSnapshot = await getDocs(collection(db, "posts"));
            const postsList: any[] = [];
            postsSnapshot.forEach(doc => postsList.push({ id: doc.id, ...doc.data() }));
            setPosts(postsList);

            // Fetch Conversations
            const convoSnapshot = await getDocs(collection(db, "conversations"));
            const convoList: any[] = [];
            convoSnapshot.forEach(doc => convoList.push({ id: doc.id, ...doc.data() }));
            setConversations(convoList);

            // Fetch Sessions
            const sessionSnapshot = await getDocs(collection(db, "requests"));

            // Calculate Top Skills
            const sortedSkills = Object.entries(skillCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setStats({
                totalUsers: usersList.length,
                totalSessions: sessionSnapshot.size,
                totalPosts: postsSnapshot.size,
                topSkills: sortedSkills
            });

        } catch (err) {
            console.error(err);
        }
    };

    const togglePostExpansion = (id: string) => {
        setExpandedPostId(expandedPostId === id ? null : id);
    };

    const toggleConvoExpansion = async (id: string) => {
        if (expandedConvoId === id) {
            setExpandedConvoId(null);
            setConvoMessages([]);
            return;
        }

        setExpandedConvoId(id);
        setLoadingMessages(true);
        setConvoMessages([]);

        try {
            const msgsQuery = query(
                collection(db, "conversations", id, "messages"),
                orderBy("createdAt", "desc"),
                limit(10)
            );
            const snaps = await getDocs(msgsQuery);
            const msgs = snaps.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
            setConvoMessages(msgs);
        } catch (error) {
            console.error("Error fetching messages", error);
            addNotification("Failed to load message history", "info");
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await deleteDoc(doc(db, "posts", postId));
            setPosts(posts.filter(p => p.id !== postId));
            addNotification("Post deleted", "success");
        } catch (err) {
            console.error(err);
            addNotification("Failed to delete post", "info");
        }
    };

    const handleDeleteConversation = async (convoId: string) => {
        if (!confirm("Permanently delete this conversation?")) return;
        try {
            await deleteDoc(doc(db, "conversations", convoId));
            setConversations(conversations.filter(c => c.id !== convoId));
            addNotification("Conversation deleted", "success");
        } catch (err) {
            console.error(err);
            addNotification("Failed to delete conversation", "info");
        }
    };

    const requestDeleteUser = (userId: string) => {
        setUserToDelete(userId);
        setConfirmOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await deleteDoc(doc(db, "users", userToDelete));
            setUsers(users.filter(u => u.id !== userToDelete));
            addNotification("User deleted successfully", "success");
        } catch (err) {
            console.error(err);
            addNotification("Failed to delete user document.", "info");
        }
    };

    const handleUpdateRole = async (userId: string, newRole: "user" | "admin") => {
        try {
            await updateDoc(doc(db, "users", userId), {
                role: newRole
            });
            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            addNotification(`User role updated to ${newRole}`, "success");
        } catch (err) {
            console.error(err);
            addNotification("Failed to update user role", "info");
        }
    };

    const handleEditUser = (user: any) => {
        setUserToEdit(user);
        setEditModalOpen(true);
    };

    const handleUserUpdated = (updatedUser: any) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    // Filtering Logic
    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPosts = posts.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredConversations = conversations.filter(c => {
        const names = Object.values(c.participantNames || {}).join(", ").toLowerCase();
        return names.includes(searchTerm.toLowerCase());
    });


    if (loading || role !== "admin") return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-lg sticky top-24">
                        <div className="p-4 border-b border-white/10 bg-[#151a2d]">
                            <h2 className="font-semibold text-gray-300">Admin Controls</h2>
                        </div>
                        <nav className="p-2 space-y-1">
                            <button
                                onClick={() => setView("users")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === "users" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Users className="h-5 w-5" />
                                <span className="font-medium">Manage Users</span>
                            </button>
                            <button
                                onClick={() => setView("posts")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === "posts" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <FileText className="h-5 w-5" />
                                <span className="font-medium">Manage Posts</span>
                            </button>
                            <button
                                onClick={() => setView("messages")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === "messages" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <MessageSquare className="h-5 w-5" />
                                <span className="font-medium">Messages</span>
                            </button>
                            <button
                                onClick={() => setView("reports")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === "reports" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <TrendingUp className="h-5 w-5" />
                                <span className="font-medium">Analytics</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold capitalize">{view === "reports" ? "Analytics Overview" : `${view}`}</h2>
                        {view !== "reports" && (
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={`Search ${view}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-[#0c1121] border-white/10 focus:bg-[#1a1f33]"
                                />
                            </div>
                        )}
                    </div>

                    {view === "posts" && (
                        <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#151a2d] border-b border-white/10">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-gray-300">Title</th>
                                        <th className="p-4 text-left font-semibold text-gray-300">Author</th>
                                        <th className="p-4 text-left font-semibold text-gray-300">Category</th>
                                        <th className="p-4 text-right font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredPosts.map((p) => (
                                        <React.Fragment key={p.id}>
                                            <tr className="hover:bg-[#1a1f33] transition-colors cursor-pointer" onClick={() => togglePostExpansion(p.id)}>
                                                <td className="p-4 font-medium flex items-center gap-2">
                                                    {expandedPostId === p.id ? <ChevronDown className="h-4 w-4 text-blue-400" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                                    {p.title}
                                                </td>
                                                <td className="p-4 text-muted-foreground">{p.authorName}</td>
                                                <td className="p-4 text-muted-foreground">{p.category || "Other"}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10 border-blue-500/20"
                                                            onClick={(e) => { e.stopPropagation(); router.push(`/posts/edit/${p.id}`); }}
                                                            title="Edit Post"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                                                            onClick={(e) => { e.stopPropagation(); handleDeletePost(p.id); }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedPostId === p.id && (
                                                <tr className="bg-[#151a2d]/50">
                                                    <td colSpan={4} className="p-4 text-gray-400 border-b border-white/5">
                                                        <div className="flex gap-4">
                                                            {p.authorPhoto && (
                                                                <img src={p.authorPhoto} alt="Author" className="w-16 h-16 rounded-lg object-cover bg-black" />
                                                            )}
                                                            <div>
                                                                <h4 className="text-sm font-bold text-gray-300 mb-1">Description:</h4>
                                                                <p className="text-sm">{p.description}</p>
                                                                {p.tags && p.tags.length > 0 && (
                                                                    <div className="flex gap-2 mt-2">
                                                                        {p.tags.map((t: string) => (
                                                                            <span key={t} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">#{t}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            {filteredPosts.length === 0 && <p className="p-8 text-center text-muted-foreground">No posts found.</p>}
                        </div>
                    )}

                    {view === "messages" && (
                        <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#151a2d] border-b border-white/10">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-gray-300">Participants</th>
                                        <th className="p-4 text-left font-semibold text-gray-300">Last Message</th>
                                        <th className="p-4 text-left font-semibold text-gray-300">Updated</th>
                                        <th className="p-4 text-right font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredConversations.map((c) => {
                                        const names = Object.values(c.participantNames || {}).join(", ");
                                        return (
                                            <React.Fragment key={c.id}>
                                                <tr className="hover:bg-[#1a1f33] transition-colors cursor-pointer" onClick={() => toggleConvoExpansion(c.id)}>
                                                    <td className="p-4 font-medium flex items-center gap-2">
                                                        {expandedConvoId === c.id ? <ChevronDown className="h-4 w-4 text-blue-400" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                                        {names}
                                                    </td>
                                                    <td className="p-4 text-muted-foreground max-w-xs truncate">{c.lastMessage}</td>
                                                    <td className="p-4 text-muted-foreground">
                                                        {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "N/A"}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteConversation(c.id); }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {expandedConvoId === c.id && (
                                                    <tr className="bg-[#151a2d]/50">
                                                        <td colSpan={4} className="p-4 border-b border-white/5">
                                                            <div className="bg-[#0b1120] rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Recent Message History</h4>
                                                                {loadingMessages ? (
                                                                    <div className="flex justify-center p-4">
                                                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                                                    </div>
                                                                ) : convoMessages.length === 0 ? (
                                                                    <p className="text-sm text-gray-500 italic">No messages found.</p>
                                                                ) : (
                                                                    convoMessages.map((msg: any) => (
                                                                        <div key={msg.id} className="flex flex-col gap-1">
                                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                                <span>{c.participantNames?.[msg.senderId] || "User"}</span>
                                                                                <span>{msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString() : ""}</span>
                                                                            </div>
                                                                            <div className="bg-[#1a1f33] p-2 rounded-md text-sm text-gray-200">
                                                                                {msg.text}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredConversations.length === 0 && <p className="p-8 text-center text-muted-foreground">No conversations found.</p>}
                        </div>
                    )}

                    {view === "reports" ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card border-white/10 p-6 rounded-xl">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-blue-600/10 rounded-lg">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Total Users</p>
                                        <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-card border-white/10 p-6 rounded-xl">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-sm">Total Sessions</p>
                                        <h3 className="text-2xl font-bold">{stats.totalSessions}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full md:col-span-3 glass-card border-white/10 p-6 rounded-xl">
                                <h3 className="text-xl font-bold mb-4">Top Offered Skills</h3>
                                <div className="space-y-4">
                                    {stats.topSkills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <span className="w-6 text-muted-foreground text-sm font-mono">#{idx + 1}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-medium">{skill.name}</span>
                                                    <span className="text-muted-foreground text-sm">{skill.count} users</span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500"
                                                        style={{ width: `${(skill.count / stats.totalUsers) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.topSkills.length === 0 && <p className="text-muted-foreground">No data available.</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        view === "users" && (
                            <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-[#151a2d] border-b border-white/10">
                                        <tr>
                                            <th className="p-4 text-left font-semibold text-gray-300">Name</th>
                                            <th className="p-4 text-left font-semibold text-gray-300">Email</th>
                                            <th className="p-4 text-left font-semibold text-gray-300">Role</th>
                                            <th className="p-4 text-left font-semibold text-gray-300">Joined</th>
                                            <th className="p-4 text-right font-semibold text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-[#1a1f33] transition-colors">
                                                <td className="p-4 font-medium">{u.name}</td>
                                                <td className="p-4 text-muted-foreground">{u.email}</td>
                                                <td className="p-4 capitalize">{u.role}</td>
                                                <td className="p-4 text-muted-foreground">
                                                    {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "N/A"}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-gray-400 hover:text-white hover:bg-white/10"
                                                            onClick={() => handleEditUser(u)}
                                                            title="Edit User"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        {u.id !== user?.uid && (
                                                            <div className="contents">
                                                                {u.role === "admin" ? (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-orange-400 hover:text-orange-500 hover:bg-orange-500/10 border-orange-500/20"
                                                                        onClick={() => handleUpdateRole(u.id, "user")}
                                                                        title="Revoke Admin Access"
                                                                    >
                                                                        <ShieldOff className="h-4 w-4" />
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10 border-blue-500/20"
                                                                        onClick={() => handleUpdateRole(u.id, "admin")}
                                                                        title="Promote to Admin"
                                                                    >
                                                                        <Shield className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                                                                    onClick={() => requestDeleteUser(u.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )
                    }
                </div >
            </div >

            <EditProfileModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={userToEdit}
                onUserUpdated={handleUserUpdated}
            />

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This cannot be undone."
            />
        </div >
    );
}
