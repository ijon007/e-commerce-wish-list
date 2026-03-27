"use server";
import { cookies } from "next/headers";

export async function setCookie(
    cookieName: string,
    cookieValue: string,
): Promise<{ ok: boolean }> {
    try {
        const cookieStore = await cookies();
        cookieStore.set({
            name: cookieName,
            value: cookieValue,
            httpOnly: true,
            path: "/",
        });
        return { ok: true };
    } catch (error) {
        console.log(error);
        return { ok: false };
    }
}

export async function getCookie(
    cookieName: string,
): Promise<{ ok: boolean; cookieValue: string | null }> {
    try {
        const cookieStore = await cookies();
        const cookieValue = cookieStore.get(cookieName)?.value;
        if (!cookieValue) {
            return { ok: false, cookieValue: null };
        }
        return { ok: true, cookieValue: cookieValue };
    } catch (error) {
        console.log(error);
        return { ok: false, cookieValue: null };
    }
}

export async function deleteCookie(
    cookieName: string,
): Promise<{ ok: boolean }> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(cookieName);
        return { ok: true };
    } catch (error) {
        console.log(error);
        return { ok: false };
    }
}
