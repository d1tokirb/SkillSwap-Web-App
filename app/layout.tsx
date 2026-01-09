import { XPNotification } from "@/components/ui/XPNotification";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/context/NotificationContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ClientMotionWrapper } from "@/components/ClientMotionWrapper";
import { Navbar } from "@/components/ui/Navbar";
import BackgroundManager from "@/components/ui/BackgroundManager";
import { AuthProvider } from "@/context/AuthContext";
import { AchievementManager } from "@/components/AchievementManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSwap | Student Talent Exchange",
  description: "Connect, share skills, and learn together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative text-white bg-transparent`}
      >
        <AuthProvider>
          <SettingsProvider>
            <ClientMotionWrapper>
              <NotificationProvider>
                <BackgroundManager />
                <AchievementManager />
                <Navbar />
                <XPNotification />
                <div className="relative z-10 pt-24">
                  {children}
                </div>
              </NotificationProvider>
            </ClientMotionWrapper>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
