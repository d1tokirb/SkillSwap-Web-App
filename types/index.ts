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
}

export interface Post {
    id: string;
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    authorPhoto?: string;
    category?: string;
    tags?: string[];
    createdAt: FirestoreTimestamp;
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
    swapSkill?: string; // The skill offered in return
}
