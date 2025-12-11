"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, Eye, Lock } from "lucide-react";

export default function SafetyPage() {
    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">Safety Guidelines</h1>
                    <p className="text-muted-foreground">Your safety is our top priority. Please review these guidelines before meeting others.</p>
                </motion.div>

                <div className="space-y-6">
                    <SafetyCard
                        icon={<Lock className="h-6 w-6 text-green-400" />}
                        title="Protect Personal Information"
                        description="Keep your personal contact details private until you feel comfortable. Use the in-app messaging system for all initial communication."
                    />
                    <SafetyCard
                        icon={<AlertTriangle className="h-6 w-6 text-yellow-400" />}
                        title="Trust Your Instincts"
                        description="If something feels off, it probably is. You are never obligated to continue a session. feel free to leave or end communication at any time."
                    />
                    <SafetyCard
                        icon={<Shield className="h-6 w-6 text-red-400" />}
                        title="Report Suspicious Behavior"
                        description="If you encounter harassment, inappropriate behavior, or suspicious activity, please report the user immediately using the report button on their profile."
                    />
                </div>
            </div>
        </div>
    );
}

function SafetyCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-4 p-6 glass-card rounded-xl border border-white/5"
        >
            <div className="shrink-0 mt-1 p-2 bg-white/5 rounded-lg h-fit">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{description}</p>
            </div>
        </motion.div>
    );
}
