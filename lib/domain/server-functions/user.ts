"use server";
import { firestore } from "@/lib/firebase/admin";
import { User } from "../classes/user";
import { getCookie } from "./cookies";

export async function createUser(user: User): Promise<{ ok: boolean }> {
    try {
        if (!user || !user.uid) return { ok: false };
        await firestore.collection("users").doc(user.uid).set(user);
        return { ok: true };
    } catch (error) {
        console.log(error);
        return { ok: false };
    }
}

export async function userExists(userUid: string): Promise<{ ok: boolean }> {
    try {
        if (!userUid) return { ok: false };
        const doc = await firestore.collection("users").doc(userUid).get();
        return { ok: doc.exists };
    } catch (error) {
        console.log(error);
        return { ok: false };
    }
}

export async function checkCookieUser(): Promise<{ ok: boolean }> {
    try {
        const response = await getCookie("userId");
        if (!response.ok || !response.cookieValue) return { ok: false };
        const doc = await firestore.collection("users").doc(response.cookieValue).get();
        return { ok: doc.exists }
    } catch (error) {
        console.log(error);
        return { ok: false }
    }
}