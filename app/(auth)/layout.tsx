import { checkCookieUser } from "@/lib/domain/server-functions/user";
import { redirect } from "next/navigation";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { ok } = await checkCookieUser();
    if (ok) redirect("/");
    return (
        <>{children}</>
    );
}