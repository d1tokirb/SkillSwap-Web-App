"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RatingModal } from "@/components/ui/RatingModal";

interface RequestWithId {
    id: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    skill: string;
    status: "pending" | "accepted" | "rejected" | "completed";
    createdAt: string;
    rating?: number;
    review?: string;
}

export default function LearningPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sentRequests, setSentRequests] = useState<RequestWithId[]>([]);
    const [fetching, setFetching] = useState(true);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RequestWithId | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchSentRequests();
        }
    }, [user, loading, router]);

    const fetchSentRequests = async () => {
        if (!user) return;
        try {
            const qSent = query(collection(db, "requests"), where("fromUserId", "==", user.uid));
            const snapSent = await getDocs(qSent);
            const sent: RequestWithId[] = [];
            snapSent.forEach(doc => sent.push({ id: doc.id, ...doc.data() } as RequestWithId));
            sent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setSentRequests(sent);
            setFetching(false);
        } catch (e) {
            console.error(e);
            setFetching(false);
        }
    };

    const openRatingModal = (req: RequestWithId) => {
        setSelectedRequest(req);
        setRatingModalOpen(true);
    };

    const handleRatingSubmit = async (rating: number, review: string) => {
        if (!selectedRequest) return;
        try {
            await updateDoc(doc(db, "requests", selectedRequest.id), {
                status: "completed",
                rating,
                review,
                completedAt: new Date().toISOString()
            });

            // Update local state
            setSentRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
                ...r,
                status: "completed",
                rating,
                review
            } : r));

        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    if (loading || !user || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-7xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
                <p className="text-muted-foreground">Track skills you are requesting to learn.</p>
            </div>

            {/* My Learning (Sent Requests) */}
            {/* Active Learning (In Progress) */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    In Progress <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{sentRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length}</span>
                </h2>
                {sentRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length === 0 ? (
                    <p className="text-muted-foreground italic">No active learning sessions.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sentRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').map((req) => (
                            <div key={req.id} className="glass-card p-5 rounded-xl flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                            {req.toUserName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-white">To: {req.toUserName}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full border capitalize ${req.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        req.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {req.status}
                                    </div>
                                </div>
                                <p className="text-sm mb-4 text-gray-300">
                                    Learning <span className="font-medium text-pink-300">{req.skill}</span>
                                </p>

                                <div className="mt-auto">
                                    <div className="text-center text-xs text-gray-400 py-2">
                                        {req.status === 'pending' ? 'Waiting for acceptance...' : 'Session in progress...'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Learning (History & Reviews) */}
            <div className="space-y-6 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    Learning History <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{sentRequests.filter(r => r.status === 'completed' || r.status === 'rejected').length}</span>
                </h2>
                {sentRequests.filter(r => r.status === 'completed' || r.status === 'rejected').length === 0 ? (
                    <p className="text-muted-foreground italic">No completed sessions yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75 hover:opacity-100 transition-opacity">
                        {sentRequests.filter(r => r.status === 'completed' || r.status === 'rejected').map((req) => (
                            <div key={req.id} className="glass-card p-5 rounded-xl opacity-80 hover:opacity-100 transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                            {req.toUserName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-white">To: {req.toUserName}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full border capitalize ${req.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {req.status}
                                    </div>
                                </div>
                                <p className="text-sm mb-4 text-gray-300">
                                    Learned <span className="font-medium text-pink-300">{req.skill}</span>
                                </p>

                                <div className="mt-auto">
                                    {req.status === "completed" && !req.rating ? (
                                        <Button size="sm" onClick={() => openRatingModal(req)} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-[0_0_15px_rgba(202,138,4,0.3)]">
                                            Rate Session
                                        </Button>
                                    ) : req.rating ? (
                                        <div className="bg-black/20 rounded-lg p-2 text-center border border-white/5">
                                            <div className="flex justify-center text-yellow-500 gap-1 text-sm">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < (req.rating || 0) ? "" : "text-white/20"}>★</span>
                                                ))}
                                            </div>
                                            {req.review && <p className="text-xs text-gray-400 mt-1 line-clamp-1">"{req.review}"</p>}
                                        </div>
                                    ) : (
                                        <div className="text-center text-xs text-gray-500 py-2">
                                            Session cancelled/rejected.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <RatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
                userName={selectedRequest?.toUserName || "User"}
            />
        </div>
    );
}
