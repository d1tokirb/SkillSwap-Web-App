"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

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
    note?: string;
}

export default function RequestsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [incomingRequests, setIncomingRequests] = useState<RequestWithId[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchIncomingRequests();
        }
    }, [user, loading, router]);

    const fetchIncomingRequests = async () => {
        if (!user) return;
        try {
            const qIncoming = query(collection(db, "requests"), where("toUserId", "==", user.uid));
            const snapIncoming = await getDocs(qIncoming);
            const inc: RequestWithId[] = [];
            snapIncoming.forEach(doc => inc.push({ id: doc.id, ...doc.data() } as RequestWithId));
            inc.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setIncomingRequests(inc);
            setFetching(false);
        } catch (e) {
            console.error(e);
            setFetching(false);
        }
    };

    const handleRequestAction = async (requestId: string, status: "accepted" | "rejected" | "completed") => {
        try {
            await updateDoc(doc(db, "requests", requestId), { status });
            setIncomingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
        } catch (e) {
            console.error(e);
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
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Teaching Requests</h1>
                <p className="text-muted-foreground">Manage requests from students who want to learn from you.</p>
            </div>

            {/* Active Requests Section (Incoming) */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    Active Tasks <span className="text-sm font-normal text-muted-foreground bg-[#151a2d] border border-white/5 px-2 py-0.5 rounded-full">{incomingRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length}</span>
                </h2>

                {incomingRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length === 0 ? (
                    <p className="text-muted-foreground italic">No active requests.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {incomingRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').map((req) => (
                            <div key={req.id} className="glass-card p-5 rounded-xl flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                            {req.fromUserName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-white">{req.fromUserName}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full border capitalize ${req.status === 'completed' ? 'bg-blue-600/10 text-blue-600 border-blue-600/20' :
                                        req.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {req.status}
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                            {req.fromUserName?.charAt(0)}
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full border capitalize ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                            {req.status}
                                        </div>
                                    </div>
                                    <p className="text-sm mb-1 text-gray-400">Request from <span className="font-semibold text-white">{req.fromUserName}</span></p>
                                    <p className="text-lg font-bold text-white mb-2">{req.skill}</p>
                                    {req.note && (
                                        <div className="bg-[#0c1121] p-3 rounded-lg text-sm text-gray-300 italic mb-4 border border-white/5">
                                            "{req.note}"
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-auto">
                                    {req.status === 'pending' ? (
                                        <>
                                            <Button size="sm" onClick={() => handleRequestAction(req.id, "accepted")} className="flex-1 bg-blue-600 hover:bg-blue-500">Accept</Button>
                                            <Button size="sm" onClick={() => handleRequestAction(req.id, "rejected")} variant="outline" className="flex-1 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50">Reject</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" onClick={() => router.push(`/messages`)} className="w-full bg-white/5 hover:bg-white/10">Message</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History Section */}
            <div className="space-y-6 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    History <span className="text-sm font-normal text-muted-foreground bg-[#151a2d] border border-white/5 px-2 py-0.5 rounded-full">{incomingRequests.filter(r => r.status === 'completed' || r.status === 'rejected').length}</span>
                </h2>
                {incomingRequests.filter(r => r.status === 'completed' || r.status === 'rejected').length === 0 ? (
                    <p className="text-muted-foreground italic">No history yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {incomingRequests.filter(r => r.status === 'completed' || r.status === 'rejected').map((req) => (
                            <div key={req.id} className="glass-card p-5 rounded-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                        {req.fromUserName?.charAt(0)}
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full border capitalize ${req.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {req.status}
                                    </div>
                                </div>
                                <p className="text-sm mb-1 text-gray-400">Request from <span className="font-semibold text-white">{req.fromUserName}</span></p>
                                <p className="text-sm mb-4 text-gray-300">
                                    Requested help learning <span className="font-medium text-blue-300">{req.skill}</span>.
                                </p>
                                {req.status === 'completed' && req.rating && (
                                    <div className="bg-black/20 rounded-lg p-2 text-center border border-white/5 mt-auto">
                                        <div className="flex justify-center text-yellow-500 gap-1 text-sm">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < (req.rating || 0) ? "" : "text-white/20"}>★</span>
                                            ))}
                                        </div>
                                        {req.review && <p className="text-xs text-gray-400 mt-1 line-clamp-1">"{req.review}"</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
