"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Code, ChefHat, Languages, Calculator, Music, Palette, Dumbbell, PenTool, Rocket, Briefcase, Cpu, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ExploreGraphs } from "@/components/ExploreGraphs";

const categories = [
    {
        icon: <Code className="h-8 w-8 text-blue-400" />,
        title: "Coding",
        description: "Learn Python, React, JavaScript, or debug code with a peer. Share screens and solve problems together.",
    },
    {
        icon: <ChefHat className="h-8 w-8 text-orange-400" />,
        title: "Cooking",
        description: "Master new recipes from around the world. Swap family secrets and learn culinary techniques over video.",
    },
    {
        icon: <Languages className="h-8 w-8 text-green-400" />,
        title: "Languages",
        description: "Practice conversation. Connect with native speakers to improve your fluency in Spanish, French, Mandarin, and more.",
    },
    {
        icon: <Calculator className="h-8 w-8 text-red-400" />,
        title: "Mathematics",
        description: "Get help with calculus, algebra, or statistics. Understand complex theorems with a patient study buddy.",
    },
    {
        icon: <Music className="h-8 w-8 text-purple-400" />,
        title: "Music",
        description: "Learn guitar chords, piano basics, or music theory. Jam together and share feedback on your compositions.",
    },
    {
        icon: <Palette className="h-8 w-8 text-pink-400" />,
        title: "Design",
        description: "Get feedback on your portfolio. Learn tools like Figma, Photoshop, or Blender from experienced creative peers.",
    },
    {
        icon: <Dumbbell className="h-8 w-8 text-yellow-400" />,
        title: "Fitness",
        description: "Find a workout partner. Share routines, check form, and stay motivated for yoga, running, or lifting.",
    },
    {
        icon: <PenTool className="h-8 w-8 text-teal-400" />,
        title: "Writing",
        description: "Edit essays, brainstorm story ideas, or get critiques on your creative writing and poetry.",
    },
    {
        icon: <Rocket className="h-8 w-8 text-indigo-400" />,
        title: "Science",
        description: "Explore physics, chemistry, or biology. Discuss scientific concepts and work on lab reports together.",
    },
    {
        icon: <Briefcase className="h-8 w-8 text-amber-500" />,
        title: "Business",
        description: "Learn about entrepreneurship, marketing, or finance. Get advice on starting your own project or small business.",
    },
    {
        icon: <Cpu className="h-8 w-8 text-cyan-400" />,
        title: "Technology",
        description: "Dive into hardware, networking, or cybersecurity. Understand how computers work and build your own systems.",
    },
    {
        icon: <Camera className="h-8 w-8 text-rose-400" />,
        title: "Photography",
        description: "Learn about composition, lighting, and editing. Share your photos and get constructive feedback.",
    }
];

export default function ExplorePage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4"
                    >
                        Discover What's Possible
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        SkillSwap connects you with people who are passionate about sharing their knowledge. Here are just a few ways our community learns together.
                    </motion.p>
                </div>

                <ExploreGraphs />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((skill, idx) => (
                        <motion.div
                            key={skill.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 + 0.2 }}
                            className="glass-card p-6 rounded-2xl hover:border-blue-600/50 hover:bg-[#1a1f33] transition-all group"
                        >
                            <div className="mb-4 p-3 bg-[#0c1121] rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                                {skill.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                {skill.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {!user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-16 text-center bg-gradient-to-r from-blue-600/10 to-sky-500/10 border border-blue-600/20 rounded-2xl p-8 max-w-3xl mx-auto"
                    >
                        <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
                        <p className="text-muted-foreground mb-6">Join thousands of students exchanging skills today.</p>
                        <Link href="/register">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                                Create your Profile
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
