export type FirestoreTimestamp = { seconds: number; nanoseconds: number } | Date | string;

export interface UserProfile {
    id: string;
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    role: "user" | "admin";
    bio?: string;
    skillsOffered: string[];
    skillsSought: string[];
    xp?: number;
    joinedAt: FirestoreTimestamp;
    lastSeen?: FirestoreTimestamp;
    endorsements?: Record<string, number>;
    achievements?: string[];
    visibility?: 'public' | 'private';
}

export interface Post {
    id: string;
    title: string;
    description: string;
    userId: string;
    authorName: string;
    authorPhoto?: string;
    category?: string;
    tags?: string[];
    createdAt: FirestoreTimestamp;
}

export interface ModerationLog {
    id: string;
    userId: string;
    userName: string;
    content: string;
    reason: string;
    context: string;
    status: "pending" | "resolved" | "dismissed";
    createdAt: any;
    source?: "ai" | "user_report";
}

export interface Conversation {
    id: string;
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage: string;
    lastMessageSenderId?: string;
    updatedAt: FirestoreTimestamp;
    hiddenBy?: string[];
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: FirestoreTimestamp;
}

export interface Request {
    id: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    skill: string;
    status: "pending" | "accepted" | "rejected" | "completed";
    note?: string;
    createdAt: FirestoreTimestamp;
    swapSkill?: string; // ID or Name of skill offered in return
}

export interface Review {
    id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserPhoto?: string;
    toUserId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: FirestoreTimestamp;
    requestId?: string; // Optional link to specific session
}
