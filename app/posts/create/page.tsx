"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

export default function CreatePostPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { addNotification } = useNotification();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleEnhance = async () => {
        if (!description.trim()) {
            addNotification("Please enter text and try again", "info");
            return;
        }

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
            } else {
                addNotification("Could not enhance text.", "info");
            }
        } catch (error) {
            console.error("Enhance error:", error);
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
            // Auto-Tagging
            let category = "Other";
            try {
                const res = await fetch("/api/ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "tag", content: `${title} - ${description}` })
                });
                const data = await res.json();
                if (data.category) category = data.category;
            } catch (ignore) {
                console.warn("Auto-tagging failed, defaulting to Other");
            }

            await addDoc(collection(db, "posts"), {
                title: title.trim(),
                description: description.trim(),
                userId: user.uid,
                authorName: user.displayName || "Anonymous",
                authorPhoto: user.photoURL || "",
                createdAt: serverTimestamp(),
                tags: title.toLowerCase().split(" ").filter(t => t.length > 2),
                category: category
            });

            addNotification("Skill posted successfully!", "success");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error creating post:", error);
            addNotification("Failed to create post.", "info");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full space-y-8 glass-panel p-8 rounded-2xl border border-white/10"
            >
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-white/5 text-gray-400 p-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Offer a Skill</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Skill Title
                        </label>
                        <Input
                            id="title"
                            placeholder="e.g. Advanced Jazz Guitar or React JS Basics"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500"
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
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs h-7"
                            >
                                <Sparkles className={`mr-1.5 h-3 w-3 ${isEnhancing ? "animate-spin" : ""}`} />
                                {isEnhancing ? "Enhancing..." : "AI Enhance"}
                            </Button>
                        </div>
                        <textarea
                            id="description"
                            rows={6}
                            placeholder="Describe what you know, your teaching style, or what students will learn..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-md bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3"
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Posting..." : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Post Skill
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
