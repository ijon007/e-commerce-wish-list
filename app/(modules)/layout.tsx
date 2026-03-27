import { checkCookieUser } from "@/lib/domain/server-functions/user";
import { redirect } from "next/navigation";
// import Navbar from "@/components/custom/navbar";
export default async function ModulesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { ok } = await checkCookieUser();
    if (!ok) redirect("/sign-in");
    return (
        <>
            {/* <Navbar /> */}
            {children}
        </>
    );
}