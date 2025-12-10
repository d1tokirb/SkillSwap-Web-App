"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";

export default function WorksCited() {
    const sources = [
        {
            title: "Next.js Documentation",
            url: "https://nextjs.org/docs",
            usage: "Framework setup, routing, and optimization.",
        },
        {
            title: "Tailwind CSS Documentation",
            url: "https://tailwindcss.com/docs",
            usage: "Styling and design system.",
        },
        {
            title: "Firebase Documentation",
            url: "https://firebase.google.com/docs",
            usage: "Authentication and Firestore database implementation.",
        },
        {
            title: "Framer Motion Documentation",
            url: "https://www.framer.com/motion/",
            usage: "Animation library for UI interactions.",
        },
        {
            title: "Lucide Icons",
            url: "https://lucide.dev/",
            usage: "Iconography used throughout the application.",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8">Works Cited</h1>
                <div className="space-y-6">
                    {sources.map((source, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 bg-card border border-white/10 rounded-xl"
                        >
                            <h2 className="text-xl font-semibold text-primary mb-2">
                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {source.title}
                                </a>
                            </h2>
                            <p className="text-muted-foreground">{source.usage}</p>
                            <p className="text-sm text-indigo-400 mt-2 truncate">{source.url}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
