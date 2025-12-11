"use client";

import { motion } from "framer-motion";
import { Users, Target, Shield, Globe } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">About SkillSwap</h1>
                    <p className="text-xl text-muted-foreground">Empowering the next generation of learners through community connection.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8 rounded-2xl border border-white/10">
                        <Target className="h-10 w-10 text-blue-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed">
                            To democratize learning within educational communities by creating a platform where every student can be both a teacher and a learner. We believe everyone has something valuable to share.
                        </p>
                    </div>
                    <div className="glass-card p-8 rounded-2xl border border-white/10">
                        <Users className="h-10 w-10 text-sky-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
                        <p className="text-gray-400 leading-relaxed">
                            We are a team of students passionate about education technology. SkillSwap was built for BPA Virtual Events to solve the real problem of inaccessible tutoring and disconnected student bodies.
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
                    <h2 className="text-3xl font-bold text-center">Core Values</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-blue-600/10 rounded-full flex items-center justify-center mb-3">
                                <Globe className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="font-semibold mb-2">Accessibility</h3>
                            <p className="text-sm text-gray-500">Learning should be free and open to everyone.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-purple-600/10 rounded-full flex items-center justify-center mb-3">
                                <Users className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="font-semibold mb-2">Community</h3>
                            <p className="text-sm text-gray-500">We grow faster when we help each other.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto bg-green-600/10 rounded-full flex items-center justify-center mb-3">
                                <Shield className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="font-semibold mb-2">Trust</h3>
                            <p className="text-sm text-gray-500">Building a safe environment for collaboration.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
