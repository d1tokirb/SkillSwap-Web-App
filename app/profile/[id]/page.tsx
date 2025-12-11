"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RequestModal } from "@/components/ui/RequestModal";
import { useNotification } from "@/context/NotificationContext";
import { motion } from "framer-motion";
import { User as UserIcon, BookOpen, GraduationCap, X, Plus } from "lucide-react";
import Image from "next/image";

interface UserProfile {
    name: string;
    email: string;
    role: string;
    photoURL?: string;
    skillsOffered: string[];
    skillsSought: string[];
    joinedAt: string;
}

export default function ProfilePage() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const { addNotification } = useNotification();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [newSkillOffered, setNewSkillOffered] = useState("");
    const [newSkillSought, setNewSkillSought] = useState("");
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [selectedSkillForRequest, setSelectedSkillForRequest] = useState("");
    const [stats, setStats] = useState({ rating: 0, reviews: 0 });
    const [reviewsList, setReviewsList] = useState<{ id: string, fromUserName: string, rating: number, review?: string, createdAt: string }[]>([]);

    const isOwnProfile = currentUser?.uid === id;

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch Profile
                const docRef = doc(db, "users", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data() as UserProfile);
                }

                // Fetch Stats
                const q = query(
                    collection(db, "requests"),
                    where("toUserId", "==", id),
                    where("status", "==", "completed")
                );
                const snapshot = await getDocs(q);
                let totalRating = 0;
                let count = 0;
                const reviewsData: any[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.rating) {
                        totalRating += data.rating;
                        count++;
                        reviewsData.push({
                            id: doc.id,
                            fromUserName: data.fromUserName,
                            rating: data.rating,
                            review: data.review,
                            createdAt: data.createdAt
                        });
                    }
                });

                // Sort reviews by newest first
                reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setReviewsList(reviewsData);
                setStats({
                    rating: count > 0 ? totalRating / count : 0,
                    reviews: count
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    const addSkill = async (type: "offered" | "sought") => {
        if (!currentUser || !id || !isOwnProfile) return;
        const skill = type === "offered" ? newSkillOffered : newSkillSought;
        if (!skill.trim()) return;

        try {
            const userRef = doc(db, "users", id as string);
            const field = type === "offered" ? "skillsOffered" : "skillsSought";

            await updateDoc(userRef, {
                [field]: arrayUnion(skill.trim())
            });

            setProfile(prev => prev ? ({
                ...prev,
                [type === "offered" ? "skillsOffered" : "skillsSought"]: [...(type === "offered" ? prev.skillsOffered : prev.skillsSought), skill.trim()]
            }) : null);

            if (type === "offered") setNewSkillOffered("");
            else setNewSkillSought("");
        } catch (err) {
            console.error("Error adding skill", err);
        }
    };

    const removeSkill = async (type: "offered" | "sought", skill: string) => {
        if (!currentUser || !id || !isOwnProfile) return;
        try {
            const userRef = doc(db, "users", id as string);
            const field = type === "offered" ? "skillsOffered" : "skillsSought";

            await updateDoc(userRef, {
                [field]: arrayRemove(skill)
            });

            setProfile(prev => prev ? ({
                ...prev,
                [type === "offered" ? "skillsOffered" : "skillsSought"]: (type === "offered" ? prev.skillsOffered : prev.skillsSought).filter(s => s !== skill)
            }) : null);
        } catch (err) {
            console.error(err);
        }
    }

    const openRequestModal = (skill: string) => {
        if (!currentUser || !profile) return;
        setSelectedSkillForRequest(skill);
        setRequestModalOpen(true);
    };

    const handleRequestSubmit = async (skill: string, note: string) => {
        if (!currentUser || !profile || !id) return;

        try {
            await addDoc(collection(db, "requests"), {
                fromUserId: currentUser.uid,
                fromUserName: currentUser.displayName,
                toUserId: id,
                toUserName: profile.name,
                skill: skill,
                status: "pending",
                createdAt: new Date().toISOString(),
                note: note
            });
            addNotification("Request sent successfully!", "success");
        } catch (err) {
            console.error("Error sending request", err);
            addNotification("Failed to send request.", "info");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;
    if (!profile) return <div className="p-20 text-center">User not found.</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl px-8 sm:px-10 pt-24 pb-8 sm:pb-10 shadow-[8px_8px_0px_0px_#ffffff]"
            >
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                    <div className="relative group">
                        <div
                            className={`h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-4xl font-bold text-white shadow-inner relative`}
                        >
                            {profile.photoURL ? (
                                <Image
                                    src={profile.photoURL}
                                    alt={profile.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                profile.name?.charAt(0)
                            )}
                        </div>
                    </div>

                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{profile.name}</h1>
                        <p className="text-blue-300 font-medium mb-3 flex items-center justify-center sm:justify-start gap-2 capitalize">
                            {profile.role || "Community Member"}
                        </p>

                        {errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-3 py-2 rounded-lg mb-3">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <div className="flex text-yellow-400 text-sm">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star}>
                                            {star <= Math.round(stats.rating) ? "★" : <span className="text-white/20">★</span>}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-400 font-medium ml-1">({stats.reviews} reviews)</span>
                            </div>
                            <span className="text-xs text-gray-500">Joined {new Date(profile.joinedAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills Offered */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-bold text-white">
                            <span className="p-2 bg-blue-600/10 rounded-lg text-blue-600"><GraduationCap className="h-5 w-5" /></span>
                            Skills Offered
                        </div>
                        <div className="glass-card rounded-2xl p-5 min-h-[220px]">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {profile.skillsOffered?.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-blue-600/10 text-blue-300 rounded-lg text-sm border border-blue-600/20 font-medium flex items-center gap-2 hover:bg-blue-600/20 transition-colors">
                                        {skill}
                                        {isOwnProfile ? (
                                            <button onClick={() => removeSkill("offered", skill)} className="text-blue-400/50 hover:text-blue-300"><X className="h-3 w-3" /></button>
                                        ) : (
                                            <button onClick={() => openRequestModal(skill)} className="text-xs bg-blue-600/30 hover:bg-blue-600 px-2 py-0.5 rounded text-white transition-colors">
                                                Request
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {profile.skillsOffered?.length === 0 && <span className="text-gray-500 italic text-sm">No skills added yet.</span>}
                            </div>
                            {isOwnProfile && (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill you can teach..."
                                        className="bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-600/50 h-9 text-sm"
                                        value={newSkillOffered}
                                        onChange={(e) => setNewSkillOffered(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addSkill("offered")}
                                    />
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-9 w-9 p-0" onClick={() => addSkill("offered")}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
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
                                {profile.skillsSought?.length === 0 && <span className="text-gray-500 italic text-sm">No skills added yet.</span>}
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
                    availableSkills={profile.skillsOffered}
                />
            </motion.div>
        </div>
    );
}
