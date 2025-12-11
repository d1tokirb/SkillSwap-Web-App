import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/ui/Navbar";
import BackgroundManager from "@/components/ui/BackgroundManager";
import { NotificationProvider } from "@/context/NotificationContext";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative text-white bg-transparent`}
      >
        <AuthProvider>
          <NotificationProvider>
            <BackgroundManager />
            <Navbar />
            <div className="relative z-10 pt-24">
              {children}
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
