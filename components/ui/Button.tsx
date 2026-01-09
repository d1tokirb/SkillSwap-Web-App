"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-900/20 active:scale-[0.98] transition-all duration-200 border border-transparent",
        secondary: "bg-white/5 text-white hover:bg-white/10 shadow-sm active:scale-[0.98] transition-all duration-200 border border-white/10",
        outline: "bg-transparent text-white border border-white/20 hover:bg-white/5 active:scale-[0.98] transition-all duration-200",
        ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5 active:scale-[0.98] transition-all duration-200",
        link: "bg-transparent text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline shadow-none border-0 p-0 h-auto",
    };

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-8 text-base",
        lg: "h-14 px-10 text-lg",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </motion.button>
    );
}
