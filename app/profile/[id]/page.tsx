"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp, query, where, orderBy, limit, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { UserProfile, Post, Request, Review } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageSquare, MapPin, Calendar, Clock, BookOpen, Share2, MoreVertical, Flag, Shield, Mail, Edit3, Star, User as UserIcon, GraduationCap, X, Plus, Settings, Zap, ThumbsUp, Award, ShieldOff } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { motion } from "framer-motion";
import { ReviewModal } from "@/components/ReviewModal";
import { Avatar } from "@/components/ui/Avatar";
import { EditProfileModal } from "@/components/EditProfileModal";
import { EndorsementModal } from "@/components/EndorsementModal";
import { RequestModal } from "@/components/ui/RequestModal";
import { ReportModal } from "@/components/ui/ReportModal";
import { calculateLevel, getXpProgress, XP_PER_LEVEL } from "@/lib/gamification";
import { BADGES } from "@/lib/badges";
import { reportViolation } from "@/lib/moderation";

export default function ProfilePage() {
    const { user: currentUser, userData: currentUserProfile, role: userRole } = useAuth(); // Renaming to currentUser to avoid confusion
    const { id } = useParams(); // Profile ID
    const router = useRouter();
    const { addNotification } = useNotification();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentUserPosts, setCurrentUserPosts] = useState<Post[]>([]); // Posts for the logged-in user
    const [reviews, setReviews] = useState<Review[]>([]); // Reviews specific to this user profile
    const [averageRating, setAverageRating] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modals
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false); // Review Modal State
    const [endorseModalOpen, setEndorseModalOpen] = useState(false);
    const [selectedSkillForRequest, setSelectedSkillForRequest] = useState("");

    // Editing skills (only for own profile)
    const [newSkillSought, setNewSkillSought] = useState("");

    const isOwnProfile = currentUser?.uid === id;
    const canEdit = isOwnProfile || userRole === 'admin';

    // Fetch Current User's Skills (for Swap)
    useEffect(() => {
        if (!currentUser) return;
        const fetchMyPosts = async () => {
            const q = query(
                collection(db, "posts"),
                where("userId", "==", currentUser.uid),
            );
            const querySnapshot = await getDocs(q);
            const myPosts: Post[] = [];
            querySnapshot.forEach((doc) => {
                myPosts.push({ id: doc.id, ...doc.data() } as Post);
            });
            setCurrentUserPosts(myPosts);
        }
        fetchMyPosts();
    }, [currentUser]);

    useEffect(() => {
        if (!id) return;

        const fetchProfileData = async () => {
            try {
                // 1. Fetch User Profile
                const userDoc = await getDoc(doc(db, "users", id as string));
                if (userDoc.exists()) {
                    setProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
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

                // 3. Fetch Reviews
                const reviewsQuery = query(
                    collection(db, "reviews"),
                    where("toUserId", "==", id),
                    orderBy("createdAt", "desc")
                );
                const reviewsSnap = await getDocs(reviewsQuery);
                const fetchedReviews: Review[] = [];
                let totalRating = 0;
                reviewsSnap.forEach((doc) => {
                    const data = doc.data();
                    fetchedReviews.push({ id: doc.id, ...data } as Review);
                    totalRating += data.rating || 0;
                });
                setReviews(fetchedReviews);
                if (fetchedReviews.length > 0) {
                    setAverageRating(Math.round((totalRating / fetchedReviews.length) * 10) / 10);
                }

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

    const handleRequestSubmit = async (skill: string, note: string, swapSkill?: string) => {
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
                note: note,
                swapSkill: swapSkill // Save the offered skill
            });

            addNotification(swapSkill ? "Swap proposal sent!" : "Request sent!", "success");

            // Persistent Notification to Recipient
            try {
                // Construct message
                const notifMessage = swapSkill
                    ? `${currentUser.displayName || "User"} wants to swap: teaches you ${swapSkill} for ${skill}`
                    : `${currentUser.displayName || "User"} requested to learn ${skill}`;

                await addDoc(collection(db, "users", id as string, "notifications"), {
                    type: "request",
                    message: notifMessage,
                    read: false,
                    createdAt: serverTimestamp(),
                    data: { fromUserId: currentUser.uid }
                });
            } catch (notifyError) {
                console.error("Failed to create notification:", notifyError);
            }

            // Also message them?
            const participants = [currentUser.uid, id as string].sort();
            const convoId = participants.join("_");
            const convoRef = doc(db, "conversations", convoId);

            // Construct chat message
            const chatMessage = swapSkill
                ? `Proposed a swap: I teach you ${swapSkill}, you teach me ${skill}.`
                : `Request to learn ${skill}`;

            // Ensure conversation exists or update it
            await updateDoc(convoRef, {
                lastMessage: chatMessage,
                updatedAt: new Date().toISOString(),
                participants: participants,
                participantNames: {
                    [currentUser.uid]: currentUser.displayName || "User",
                    [id as string]: profile?.name || "User"
                }
            }).catch(async (err) => {
                await setDoc(convoRef, {
                    participants: participants,
                    participantNames: {
                        [currentUser.uid]: currentUser.displayName || "User",
                        [id as string]: profile?.name || "User"
                    },
                    lastMessage: chatMessage,
                    updatedAt: new Date().toISOString()
                });
            });

        } catch (err) {
            console.error(err);
            addNotification("Failed to send request", "info");
        }
    };

    const handleReportSubmit = async (reason: string, details: string) => {
        if (!currentUser || !id) return;
        try {
            await reportViolation(
                id as string, // Target User ID
                profile?.name || "Unknown", // Target User Name
                "Profile Report", // Content (Not applicable really, so just title)
                `User Report: ${reason}`,
                `Profile Report (Details: ${details})`
            );
            addNotification("Report submitted. Thank you for helping keep our community safe.", "success");
        } catch (error) {
            console.error("Report failed", error);
            addNotification("Report submitted (offline mode).", "success");
        }
    };

    const openRequestModal = (skill: string) => {
        setSelectedSkillForRequest(skill);
        setRequestModalOpen(true);
    };

    const handleReviewSubmitted = () => {
        // Optimistic Refresh
        window.location.reload(); // Simple reload to show new review
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
        <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* Profile Header */}
                <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>

                    <div className="relative pt-12 flex flex-col sm:flex-row items-center sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative mx-auto sm:mx-0">
                            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[3px]">
                                <Avatar
                                    src={profile.photoURL}
                                    alt={profile.name}
                                    lastSeen={profile.lastSeen}
                                    className="h-full w-full bg-[#0c1121]"
                                    size="xl"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center">
                                <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                                    {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                                </span>
                                {reviews.length > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
                                        <Star className="h-3 w-3 fill-yellow-400" />
                                        <span>{averageRating}</span>
                                        <span className="text-muted-foreground font-normal ml-1">({reviews.length})</span>
                                    </div>
                                )}
                            </div>

                            {/* Gamification Stats */}
                            <div className="flex flex-col gap-2 max-w-[200px] mx-auto sm:mx-0 mt-3 pt-2">
                                <div className="flex items-center justify-between text-xs font-medium text-blue-300 w-full">
                                    <div className="flex items-center gap-1">
                                        <Zap className="h-3 w-3 fill-blue-300" />
                                        <span>Level {calculateLevel(profile.xp || 0)}</span>
                                    </div>
                                    <span className="text-blue-300/60 ml-4">{getXpProgress(profile.xp || 0)} / {XP_PER_LEVEL} XP</span>
                                </div>
                                <div className="h-1.5 w-full bg-blue-950 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${(getXpProgress(profile.xp || 0) / XP_PER_LEVEL) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {canEdit && (
                                <div className="mt-4 flex justify-center sm:justify-start w-full max-w-[200px] mx-auto sm:mx-0">
                                    <Button
                                        size="sm"
                                        className="bg-white/10 hover:bg-white/20 text-white h-9 w-full"
                                        onClick={() => setEditModalOpen(true)}
                                    >
                                        <Settings className="mr-2 h-4 w-4" /> Edit Profile
                                    </Button>
                                </div>
                            )}

                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">


                            {isOwnProfile ? null : (
                                <>
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-500 text-white"
                                        onClick={() => openRequestModal("")}
                                    >
                                        <Zap className="mr-2 h-4 w-4" /> Swap Skill
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-white border-white/20 hover:bg-white/10"
                                        onClick={async () => {
                                            if (!currentUser) return;
                                            const participants = [currentUser.uid, id as string].sort();
                                            const convoId = participants.join("_");
                                            try {
                                                const convoRef = doc(db, "conversations", convoId);
                                                const convoSnap = await getDoc(convoRef);
                                                if (!convoSnap.exists()) {
                                                    await setDoc(convoRef, {
                                                        participants: participants,
                                                        participantNames: {
                                                            [currentUser.uid]: currentUser.displayName || "User",
                                                            [id as string]: profile.name
                                                        },
                                                        lastMessage: "",
                                                        updatedAt: new Date().toISOString()
                                                    });
                                                }
                                                router.push(`/messages/${convoId}`);
                                            } catch (e) { console.error(e); }
                                        }}
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4" /> Message
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/10"
                                        onClick={() => setReviewModalOpen(true)}
                                    >
                                        <Star className="mr-2 h-4 w-4" /> Rate
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-orange-400 border-orange-400/20 hover:bg-orange-400/10"
                                        onClick={() => setReportModalOpen(true)}
                                    >
                                        <Flag className="mr-2 h-4 w-4" /> Report
                                    </Button>

                                    {isBlocked ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-400 border-green-400/20 hover:bg-green-400/10"
                                            onClick={handleUnblock}
                                        >
                                            <Shield className="mr-2 h-4 w-4" /> Unblock
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                                            onClick={handleBlock}
                                        >
                                            <ShieldOff className="mr-2 h-4 w-4" /> Block
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>


                {/* Privacy Check */}
                {(isOwnProfile || profile.visibility !== 'private' || userRole === 'admin') ? (
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
                                            className="bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-sky-500/50 focus:ring-sky-500/20 h-9 text-sm transition-all"
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

                        {/* Reviews Section */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 text-xl font-bold text-white">
                                <span className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Star className="h-5 w-5" /></span>
                                Reviews
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="glass-card border border-white/10 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar src={review.fromUserPhoto} alt={review.fromUserName} size="sm" />
                                                <div>
                                                    <p className="text-sm font-bold">{review.fromUserName}</p>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} className={`h-3 w-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.createdAt && (
                                                <span className="text-xs text-gray-500">
                                                    {typeof review.createdAt === 'object' && 'seconds' in review.createdAt
                                                        ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                                                        : new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-300 italic">"{review.comment}"</p>
                                    </div>
                                ))}
                                {reviews.length === 0 && (
                                    <div className="col-span-full text-center p-8 glass-card border-dashed border-white/10 rounded-xl">
                                        <p className="text-gray-500 italic">No reviews yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Achievements Section */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 text-xl font-bold text-white">
                                <span className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Award className="h-5 w-5" /></span>
                                Achievements
                            </div>
                            <div className="glass-card rounded-2xl p-6 border border-white/10">
                                <div className="flex flex-wrap gap-4">
                                    {BADGES.map(badge => {
                                        const isUnlocked = badge.condition(profile);
                                        if (!isUnlocked) return null;
                                        const Icon = badge.icon;
                                        return (
                                            <div key={badge.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${badge.color} hover:bg-opacity-20 transition-all cursor-help`} title={badge.description}>
                                                <Icon className="h-5 w-5" />
                                                <div>
                                                    <p className="font-bold text-sm">{badge.label}</p>
                                                    <p className="text-[10px] opacity-80 uppercase tracking-wider">Unlocked</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!BADGES.some(b => b.condition(profile)) && (
                                        <p className="text-gray-500 italic">No achievements yet. Keep swapping skills!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 text-center">
                        <div className="bg-white/10 p-4 rounded-full mb-4">
                            <Shield className="h-8 w-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">This account is private</h2>
                        <p className="text-gray-400 max-w-sm">
                            Follow this user to see their posts and skills.
                        </p>
                    </div>
                )}

                <EndorsementModal
                    // ... rest of modals
                    isOpen={endorseModalOpen}
                    onClose={() => setEndorseModalOpen(false)}
                    targetUserId={id as string}
                    targetUserName={profile.name}
                    skills={profile.skillsOffered || []}
                />

                <RequestModal
                    isOpen={requestModalOpen}
                    onClose={() => setRequestModalOpen(false)}
                    onSubmit={handleRequestSubmit}
                    recipientName={profile.name}
                    initialSkill={selectedSkillForRequest}
                    availableSkills={profile.skillsOffered || []}
                    myOfferedSkills={currentUserPosts.map(p => p.title)}
                    recipientWantedSkills={profile.skillsSought || []}
                />

                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    toUserId={id as string}
                    toUserName={profile.name}
                    onReviewSubmitted={handleReviewSubmitted}
                />

                <ReportModal
                    isOpen={reportModalOpen}
                    onClose={() => setReportModalOpen(false)}
                    onSubmit={handleReportSubmit}
                    userName={profile.name}
                />

                {
                    profile && (
                        <EditProfileModal
                            isOpen={editModalOpen}
                            onClose={() => setEditModalOpen(false)}
                            user={profile}
                            onUserUpdated={(updatedUser) => setProfile({ ...profile, ...updatedUser })}
                        />
                    )
                }
            </motion.div >
        </div >
    );
}

// Add simple Link shim if needed or import it
import Link from "next/link";
