import { Zap, Heart, Star, Users } from "lucide-react";
import { UserProfile } from "@/types";
import React from "react";

export interface Badge {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    condition: (profile: UserProfile) => boolean;
}

export const BADGES: Badge[] = [
    {
        id: "early-adopter",
        label: "Early Adopter",
        description: "Joined in the first month!",
        icon: Star,
        color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        condition: (_) => true // Everyone gets it for now as it's beta
    },
    {
        id: "helpful-hand",
        label: "Helpful Hand",
        description: "Received 5 Endorsements",
        icon: Heart,
        color: "text-pink-400 bg-pink-400/10 border-pink-400/20",
        condition: (p) => {
            if (!p.endorsements) return false;
            const total = Object.values(p.endorsements).reduce((a: number, b: number) => a + b, 0);
            return total >= 5;
        }
    },
    {
        id: "skill-master",
        label: "Skill Master",
        description: "Reached Level 10",
        icon: Zap,
        color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        condition: (p) => (p.xp || 0) >= 1000 // approx level 10
    },
    {
        id: "friendly-neighbor",
        label: "Friendly",
        description: "Endorsed for being Friendly",
        icon: Users,
        color: "text-green-400 bg-green-400/10 border-green-400/20",
        condition: (p) => (p.endorsements?.["Friendly"] || 0) > 0
    }
];
