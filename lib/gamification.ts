import { db } from "./firebase";
import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";

export const XP_PER_LEVEL = 100;

export const XP_REWARDS = {
    CREATE_POST: 20,
    SEND_REQUEST: 5,
    COMPLETE_SESSION: 50,
    SEND_MESSAGE: 1,
};

export function calculateLevel(xp: number): number {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpProgress(xp: number): number {
    return xp % XP_PER_LEVEL;
}

export async function addXp(userId: string, amount: number) {
    if (!userId) return;

    const userRef = doc(db, "users", userId);

    try {
        await updateDoc(userRef, {
            xp: increment(amount)
        });
    } catch (error) {
        console.error("Error adding XP:", error);
        // If the blocking error is that the field doesn't exist, setDoc with merge might be safer for simpler apps,
        // but updateDoc is better for existing docs.
        // For new users, 'xp' might be undefined.
        // We can check and set default if needed, or rely on `xp` defaulting to 0 in calculations if missing.
        // Ideally, 'xp' should be initialized on user creation.
        // If updateDoc fails because field strictly doesn't exist (unlikely with increment?), let's try set with merge
        await setDoc(userRef, { xp: increment(amount) }, { merge: true });
    }
}
