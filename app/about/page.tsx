"use client";

import { motion } from "framer-motion";
import { Users, Target, Shield, Globe } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-400 to-white bg-clip-text text-transparent">About SkillSwap</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Empowering the next generation of learners through community connection. We believe that everyone has something to teach, and everyone has something to learn.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-colors">
                        <Target className="h-12 w-12 text-blue-500 mb-6 bg-blue-500/10 p-2.5 rounded-xl" />
                        <h2 className="text-2xl font-bold mb-4 text-white">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed">
                            To democratize learning within educational communities by creating a platform where every student can be both a teacher and a learner. We aim to break down the barriers of traditional tutoring by fostering a peer-to-peer exchange of knowledge that is accessible, inclusive, and rewarding.
                        </p>
                    </div>
                    <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-sky-500/30 transition-colors">
                        <Users className="h-12 w-12 text-sky-500 mb-6 bg-sky-500/10 p-2.5 rounded-xl" />
                        <h2 className="text-2xl font-bold mb-4 text-white">Who We Are</h2>
                        <p className="text-gray-400 leading-relaxed">
                            We are a passionate team of students and developers dedicated to transforming education technology. SkillSwap was born from the realization that valuable skills often go unshared within disconnected student bodies. Originally built for BPA Virtual Events, we are committed to solving the real-world problem of inaccessible mentorship.
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-10 rounded-3xl border border-white/10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-center text-white mb-2">Core Values</h2>
                        <p className="text-center text-gray-500 mb-8">The principles that guide our community.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                        <div className="text-center group">
                            <div className="w-16 h-16 mx-auto bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Globe className="h-8 w-8 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-white">Accessibility</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">Learning should be free and open to everyone, regardless of their background or resources.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 mx-auto bg-purple-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-8 w-8 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-white">Community</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">We grow faster when we help each other. Collaboration over competition is our motto.</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-16 h-16 mx-auto bg-green-600/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="h-8 w-8 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-white">Trust & Safety</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">Building a safe, respectful environment where members feel secure to share and learn.</p>
                        </div>
                    </div>
                </div>
                {/* BPA Chapter Information */}
                <div className="border-t border-white/10 pt-10 text-center">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-6">BPA Chapter Information</h2>
                    <div className="bg-[#0c1121] rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto space-y-4">
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Chapter Name</p>
                            <p className="text-white font-medium text-lg">[Insert Chapter Name]</p>
                        </div>

                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Theme</p>
                            <p className="text-white font-medium">SkillSwap: Student Talent Exchange Platform</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">School</p>
                                <p className="text-gray-300">Mahoning County Career and Technical Center</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Location</p>
                                <p className="text-gray-300">Canfield, OH</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Year</p>
                            <p className="text-gray-300">2026</p>
                        </div>

                        <div className="pt-4 border-t border-white/5 mt-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Team Members</p>
                            <ul className="text-blue-300 font-medium space-y-1">
                                <li>[Member Name 1]</li>
                                <li>[Member Name 2]</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
