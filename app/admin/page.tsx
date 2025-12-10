"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, TrendingUp, Users, Calendar } from "lucide-react";

export default function AdminPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSessions: 0,
        topSkills: [] as { name: string; count: number }[]
    });
    const [view, setView] = useState<"users" | "reports">("users");

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
                topSkills: sortedSkills
            });

        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(users.filter(u => u.id !== userId));
            // In a real app, also delete Auth user via Admin SDK/Edge Function
        } catch (err) {
            console.error(err);
            alert("Failed to delete user document.");
        }
    };

    if (loading || role !== "admin") return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="flex gap-4 mb-8">
                <Button
                    variant={view === "users" ? "primary" : "outline"}
                    onClick={() => setView("users")}
                >
                    <Users className="mr-2 h-4 w-4" /> Manage Users
                </Button>
                <Button
                    variant={view === "reports" ? "primary" : "outline"}
                    onClick={() => setView("reports")}
                >
                    <TrendingUp className="mr-2 h-4 w-4" /> Reports & Analytics
                </Button>
            </div>

            {view === "reports" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Total Users</p>
                                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-white/10 p-6 rounded-xl">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Total Sessions</p>
                                <h3 className="text-2xl font-bold">{stats.totalSessions}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full md:col-span-3 bg-card border border-white/10 p-6 rounded-xl">
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
                                                className="h-full bg-indigo-500"
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
                <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/5">
                                    <td className="p-4 font-medium">{u.name}</td>
                                    <td className="p-4 text-muted-foreground">{u.email}</td>
                                    <td className="p-4 capitalize">{u.role}</td>
                                    <td className="p-4 text-muted-foreground">
                                        {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="p-4 text-right">
                                        {u.id !== user?.uid && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                                                onClick={() => handleDeleteUser(u.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
