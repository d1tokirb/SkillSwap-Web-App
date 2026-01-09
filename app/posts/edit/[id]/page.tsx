"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

export default function EditPostPage() {
    const { user, role } = useAuth();
    const { id } = useParams();
    const router = useRouter();
    const { addNotification } = useNotification();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [originalAuthorId, setOriginalAuthorId] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchPost = async () => {
            try {
                const docSnap = await getDoc(doc(db, "posts", id as string));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setDescription(data.description);
                    setOriginalAuthorId(data.userId);
                } else {
                    addNotification("Post not found", "error");
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error(err);
                addNotification("Error loading post", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    useEffect(() => {
        if (!loading && user && originalAuthorId) {
            // Check permissions: Owner or Admin
            if (user.uid !== originalAuthorId && role !== 'admin') {
                addNotification("You do not have permission to edit this post", "error");
                router.push("/dashboard");
            }
        }
    }, [loading, user, originalAuthorId, role]);

    const handleEnhance = async () => {
        if (!description.trim()) return;
        setIsEnhancing(true);
        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "enhance", content: description })
            });
            const data = await res.json();
            if (data.enhancedText) {
                setDescription(data.enhancedText);
                addNotification("Description enhanced!", "success");
            }
        } catch (error) {
            addNotification("Failed to enhance text.", "info");
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            // Update Post
            await updateDoc(doc(db, "posts", id as string), {
                title: title.trim(),
                description: description.trim(),
                tags: title.toLowerCase().split(" ").filter(t => t.length > 2)
                // Logic to re-categorize could be added here if needed, but skipping for simplicity
            });

            addNotification("Post updated successfully!", "success");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error updating post:", error);
            addNotification("Failed to update post.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent" /></div>;

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full space-y-8 glass-panel p-8 rounded-2xl border border-white/10"
            >
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-white/5 text-gray-400 p-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Edit Skill</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Skill Title
                        </label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                                Description
                            </label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleEnhance}
                                disabled={isEnhancing}
                                className="text-purple-400 hover:text-purple-300 text-xs h-7"
                            >
                                <Sparkles className={`mr-1.5 h-3 w-3 ${isEnhancing ? "animate-spin" : ""}`} />
                                {isEnhancing ? "Enhancing..." : "AI Enhance"}
                            </Button>
                        </div>
                        <textarea
                            id="description"
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-md bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
