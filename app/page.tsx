"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background" />

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-3xl mx-auto space-y-8"
            >
              <motion.h1
                variants={item}
                className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
              >
                Master New Skills through <span className="text-indigo-500">Peer Exchange</span>
              </motion.h1>

              <motion.p
                variants={item}
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
              >
                Connect with students, share your expertise, and learn something new today. The best way to grow is together.
              </motion.p>

              <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto group" onClick={() => router.push(user ? "/dashboard" : "/register")}>
                  {user ? "Go to Dashboard" : "Start Learning"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => router.push("/explore")}>
                  Explore Skills
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-white/5 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-indigo-500" />}
                title="Diverse Skills"
                description="From coding to cooking, find an expert in whatever you want to learn."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-violet-500" />}
                title="Community First"
                description="Built for students, by students. safe, friendly, and focused on growth."
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-pink-500" />}
                title="Rated Quality"
                description="Trust our rating system to find the best mentors and reliable peers."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-white/10 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© 2025 SkillSwap. Built for BPA Virtual Events.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="mb-4 p-3 rounded-lg bg-white/5 w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
