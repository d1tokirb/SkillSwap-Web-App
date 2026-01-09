"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Star, CheckCircle, Sparkles, MessageCircle } from "lucide-react";
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
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0c1121] to-[#0c1121]" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <motion.div variants={item} className="flex justify-center">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-sm font-medium border border-blue-500/20 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> The #1 Student Skill Exchange
                </span>
              </motion.div>

              <motion.h1
                variants={item}
                className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white/60 bg-clip-text text-transparent pb-2"
              >
                Master New Skills through <span className="text-blue-600 block sm:inline">Peer Exchange</span>
              </motion.h1>

              <motion.p
                variants={item}
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
              >
                Connect with students, share your expertise, and learn something new today. Breakdown the barriers to learning—free, fun, and fast.
              </motion.p>

              <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="h-12 px-8 w-full sm:w-auto text-base group bg-blue-600 hover:bg-blue-500 border-0" onClick={() => router.push(user ? "/dashboard" : "/register")}>
                  {user ? "Go to Dashboard" : "Start Learning Now"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button variant="outline" size="lg" className="h-12 px-8 w-full sm:w-auto text-base border-white/10 hover:bg-white/5" onClick={() => router.push("/explore")}>
                  Explore Skills
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>



        {/* Feature Grid */}
        <section id="features" className="py-24 bg-[#0c1121]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose SkillSwap?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">We provide a safe, engaging platform designed specifically for peer-to-peer learning within the student community.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-blue-500" />}
                title="Diverse Skills"
                description="From coding to cooking, photography to physics—find an expert in whatever you want to learn next."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-sky-500" />}
                title="Community First"
                description="Built for students, by students. safe, friendly, and focused on mutual growth and connection."
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-cyan-500" />}
                title="Rated Quality"
                description="Trust our transparent rating system to find the best mentors and reliable peers every time."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-900/5 -skew-y-3 transform origin-top-left scale-110 pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <span className="text-blue-400 font-semibold tracking-wide uppercase text-sm">Simple Process</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">How It Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <StepItem
                step="01"
                title="Create Profile"
                desc="Sign up and list the skills you can share and the ones you want to learn."
              />
              <div className="hidden md:block absolute top-12 left-[30%] w-[10%] border-t-2 border-dashed border-white/10" />
              <StepItem
                step="02"
                title="Find a Match"
                desc="Browse the community feed or search for specific skills. Connect with peers instantly."
              />
              <div className="hidden md:block absolute top-12 right-[30%] w-[10%] border-t-2 border-dashed border-white/10" />
              <StepItem
                step="03"
                title="Learn & Review"
                desc="Schedule a session, master the skill, and leave a review to help the community."
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-[#0e1325]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Student Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TestimonialCard
                name="Sarah J."
                role="Computer Science Student"
                quote="I traded my guitar skills for Python lessons. It was amazing to learn from someone who actually understands the student struggle!"
              />
              <TestimonialCard
                name="Mike T."
                role="Culinary Art Student"
                quote="Found a graphic designer to help with my menu project. In exchange, I taught them how to make perfect pasta. Win-win!"
              />
              <TestimonialCard
                name="Emily R."
                role="Business Major"
                quote="SkillSwap helped me prepare for my Spanish finals. The peer tutors here are incredibly patient and helpful."
              />
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16" />

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10">Ready to Expand Your Horizon?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">Join thousands of students who are already sharing skills and building connections.</p>
              <div className="relative z-10">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 border-0 h-14 px-10 text-lg font-bold shadow-xl"
                  onClick={() => router.push("/register")}
                >
                  Get Started for Free
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-12 border-t border-white/10 bg-[#080b16]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">SkillSwap</h3>
              <p className="text-gray-400 max-w-sm">
                Empowering students to teach, learn, and grow together through a seamless peer-to-peer exchange platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/explore" className="hover:text-blue-400">Browse Skills</Link></li>
                <li><Link href="/about" className="hover:text-blue-400">About Us</Link></li>
                <li><Link href="/safety" className="hover:text-blue-400">Safety Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-500">
            <p>© 2025 SkillSwap. Built for BPA Virtual Events.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-2xl bg-[#13192b] border border-white/5 hover:border-blue-500/30 transition-all hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.15)]"
    >
      <div className="mb-6 p-4 rounded-xl bg-blue-500/10 w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}



function StepItem({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: parseInt(step) * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-6 rotate-3 hover:rotate-6 transition-transform">
        {step}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 max-w-xs">{desc}</p>
    </motion.div>
  )
}

function TestimonialCard({ name, role, quote }: { name: string, role: string, quote: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-[#13192b] border border-white/5"
    >
      <div className="flex gap-1 text-yellow-500 mb-4">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
      </div>
      <p className="text-gray-300 italic mb-6">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">{name}</h4>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}
