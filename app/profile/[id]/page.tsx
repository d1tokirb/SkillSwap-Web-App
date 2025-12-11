"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, orderBy, addDoc, setDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RequestModal } from "@/components/ui/RequestModal";
import { ReportModal } from "@/components/ui/ReportModal";
import { useNotification } from "@/context/NotificationContext";
import { motion } from "framer-motion";
import { User as UserIcon, BookOpen, GraduationCap, X, Plus, Flag, Settings } from "lucide-react";
import Image from "next/image";

interface UserProfile {
    name: string;
    email: string;
    role: string;
    photoURL?: string;
    skillsOffered: string[];
    skillsSought: string[];
    joinedAt: string;
    blockedUsers?: string[];
}

interface Post {
    id: string;
    title: string;
    description: string;
    tags?: string[];
}

export default function ProfilePage() {
    const { user: currentUser } = useAuth(); // Renaming to currentUser to avoid confusion
    const { id } = useParams(); // Profile ID
    const router = useRouter();
    const { addNotification } = useNotification();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modals
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedSkillForRequest, setSelectedSkillForRequest] = useState("");

    // Editing skills (only for own profile)
    const [newSkillSought, setNewSkillSought] = useState("");

    const isOwnProfile = currentUser?.uid === id;

    useEffect(() => {
        if (!id) return;

        const fetchProfileData = async () => {
            try {
                // 1. Fetch User Profile
                const userDoc = await getDoc(doc(db, "users", id as string));
                if (userDoc.exists()) {
                    setProfile(userDoc.data() as UserProfile);
                } else {
                    addNotification("User not found", "info");
                    // router.push("/dashboard"); 
                }

                // 2. Fetch User Posts (Skills Offered)
                const q = query(
                    collection(db, "posts"),
                    where("userId", "==", id),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const fetchedPosts: Post[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
                });
                setPosts(fetchedPosts);

            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    // Check Block Status
    useEffect(() => {
        if (currentUser && id && !isOwnProfile) {
            const checkBlockStatus = async () => {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.blockedUsers?.includes(id)) {
                        setIsBlocked(true);
                    }
                }
            };
            checkBlockStatus();
        }
    }, [currentUser, id, isOwnProfile]);

    const handleBlock = async () => {
        if (!currentUser || !id) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                blockedUsers: arrayUnion(id)
            });
            setIsBlocked(true);
            addNotification("User blocked.", "success");
        } catch (error) {
            console.error("Error blocking user:", error);
            addNotification("Failed to block user.", "info");
        }
    };

    const handleUnblock = async () => {
        if (!currentUser || !id) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                blockedUsers: arrayRemove(id)
            });
            setIsBlocked(false);
            addNotification("User unblocked.", "success");
        } catch (error) {
            console.error("Error unblocking user:", error);
            addNotification("Failed to unblock user.", "info");
        }
    };

    const handleRequestSubmit = async (skill: string, note: string) => {
        // Logic handled in RequestModal usually, but if needed here:
        // The RequestModal component usually takes an onSubmit prop that handles the API call? 
        // Or does it handle it internally? 
        // Checking previous files: MessagesPage passed handleRequestSubmit.
        // Here we might need to implement it or let RequestModal handle it if it's self-contained?
        // Wait, RequestModal in MessagesPage DOES take onSubmit.

        if (!currentUser || !id) return;
        try {
            await addDoc(collection(db, "requests"), {
                fromUserId: currentUser.uid,
                fromUserName: currentUser.displayName,
                toUserId: id,
                toUserName: profile?.name,
                skill: skill,
                status: "pending",
                createdAt: new Date().toISOString(),
                note: note
            });
            addNotification("Request sent successfully!", "success");

            // Also message them?
            const participants = [currentUser.uid, id as string].sort();
            const convoId = participants.join("_");
            const convoRef = doc(db, "conversations", convoId);

            // Ensure conversation exists or update it
            await updateDoc(convoRef, {
                lastMessage: `Request to learn ${skill}`,
                updatedAt: new Date().toISOString(),
                participants: participants, // ensure these fields exist if creating
                participantNames: {
                    [currentUser.uid]: currentUser.displayName || "User",
                    [id as string]: profile?.name || "User"
                }
            }).catch(async (err) => {
                // If update fails, set (create)
                await setDoc(convoRef, {
                    participants: participants,
                    participantNames: {
                        [currentUser.uid]: currentUser.displayName || "User",
                        [id as string]: profile?.name || "User"
                    },
                    lastMessage: `Request to learn ${skill}`,
                    updatedAt: new Date().toISOString()
                });
            });

        } catch (err) {
            console.error(err);
            addNotification("Failed to send request", "info");
        }
    };

    const handleReportSubmit = async (reason: string, details: string) => {
        // Implement report logic
        addNotification("Report submitted. Thank you for keeping our community safe.", "success");
        // In real app, write to 'reports' collection
    };

    const openRequestModal = (skill: string) => {
        setSelectedSkillForRequest(skill);
        setRequestModalOpen(true);
    };

    // Skills Sought Management
    const addSkill = async (type: "sought") => {
        if (!newSkillSought.trim() || !currentUser) return;
        const updatedSkills = [...(profile?.skillsSought || []), newSkillSought.trim()];

        // Optimistic update
        setProfile(prev => prev ? ({ ...prev, skillsSought: updatedSkills }) : null);
        setNewSkillSought("");

        await updateDoc(doc(db, "users", currentUser.uid), {
            skillsSought: arrayUnion(newSkillSought.trim())
        });
    };

    const removeSkill = async (type: "sought", skill: string) => {
        if (!currentUser) return;
        const updatedSkills = (profile?.skillsSought || []).filter(s => s !== skill);

        setProfile(prev => prev ? ({ ...prev, skillsSought: updatedSkills }) : null);

        await updateDoc(doc(db, "users", currentUser.uid), {
            skillsSought: arrayRemove(skill)
        });
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) return <div className="p-20 text-center">User not found.</div>;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* Profile Header */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>

                    <div className="relative pt-12 flex flex-col sm:flex-row items-end sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                                <div className="h-full w-full rounded-full bg-[#0c1121] overflow-hidden flex items-center justify-center text-4xl font-bold text-white relative">
                                    {profile.photoURL ? (
                                        <Image
                                            src={profile.photoURL}
                                            alt={profile.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                                    Joined {new Date(profile.joinedAt).toLocaleDateString()}
                                </span>
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            {isOwnProfile ? null : (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 h-9"
                                        onClick={() => setReportModalOpen(true)}
                                    >
                                        <Flag className="mr-2 h-4 w-4" /> Report
                                    </Button>

                                    {isBlocked ? (
                                        <Button
                                            size="sm"
                                            className="bg-white/10 hover:bg-white/20 text-white h-9"
                                            onClick={handleUnblock}
                                        >
                                            Unblock
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9"
                                            onClick={handleBlock}
                                        >
                                            <X className="mr-2 h-4 w-4" /> Block
                                        </Button>
                                    )}

                                    <Button
                                        onClick={() => router.push(`/messages/${[currentUser?.uid, id].sort().join("_")}`)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white"
                                    >
                                        Message
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills Offered (Posts) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xl font-bold text-white">
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-blue-600/10 rounded-lg text-blue-600"><GraduationCap className="h-5 w-5" /></span>
                                Skills Offered
                            </div>
                            {isOwnProfile && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => router.push("/posts/create")}>
                                    <Plus className="h-4 w-4 mr-1" /> New Post
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {posts.map((post) => (
                                <div key={post.id} className="glass-card rounded-2xl p-5 border border-white/10 hover:border-blue-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{post.title}</h3>
                                        {/* {isOwnProfile && (
                                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )} */}
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{post.description}</p>
                                    <div className="flex gap-2">
                                        {post.tags?.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    {!isOwnProfile && (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <Button
                                                size="sm"
                                                className="w-full bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-300"
                                                onClick={() => openRequestModal(post.title)}
                                            >
                                                Request to Learn
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {posts.length === 0 && (
                                <div className="glass-card rounded-2xl p-8 text-center border-dashed border-white/10">
                                    <p className="text-gray-500 italic">No skills posted yet.</p>
                                    {isOwnProfile && (
                                        <Button variant="link" className="text-blue-400 mt-2" onClick={() => router.push("/posts/create")}>
                                            Create your first post
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills Sought */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-bold text-white">
                            <span className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><BookOpen className="h-5 w-5" /></span>
                            Skills Wanted
                        </div>
                        <div className="glass-card rounded-2xl p-5 min-h-[220px]">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {profile.skillsSought?.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-sky-500/10 text-sky-300 rounded-lg text-sm border border-sky-500/20 font-medium flex items-center gap-2 hover:bg-sky-500/20 transition-colors">
                                        {skill}
                                        {isOwnProfile && (
                                            <button onClick={() => removeSkill("sought", skill)} className="text-sky-400/50 hover:text-sky-300"><X className="h-3 w-3" /></button>
                                        )}
                                    </span>
                                ))}
                                {(!profile.skillsSought || profile.skillsSought.length === 0) && <span className="text-gray-500 italic text-sm">No skills added yet.</span>}
                            </div>
                            {isOwnProfile && (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill you want to learn..."
                                        className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-sky-500/50 h-9 text-sm"
                                        value={newSkillSought}
                                        onChange={(e) => setNewSkillSought(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addSkill("sought")}
                                    />
                                    <Button size="sm" className="bg-sky-600 hover:bg-sky-500 h-9 w-9 p-0" onClick={() => addSkill("sought")}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <RequestModal
                    isOpen={requestModalOpen}
                    onClose={() => setRequestModalOpen(false)}
                    onSubmit={handleRequestSubmit}
                    recipientName={profile.name}
                    initialSkill={selectedSkillForRequest}
                    availableSkills={profile.skillsOffered || []}
                />

                <ReportModal
                    isOpen={reportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    onSubmit={handleReportSubmit}
                    userName={profile.name}
                />
            </motion.div>
        </div>
    );
}

// Add simple Link shim if needed or import it
import Link from "next/link";
