"use client";

import LoadingIndicator from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from 'react-hot-toast';
import { createUser } from "@/lib/domain/server-functions/user";
import { User } from "@/lib/domain/classes/user";
import { setCookie } from "@/lib/domain/server-functions/cookies";

export default function SignUpPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter();

    async function handleEmailSignUp() {
        if (!email || !password || !confirmPassword) {
            toast.error("Please complete all fields!");
            return;
        }
        if (!email.includes("@")) {
            toast.error("Email is not correct!");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        setLoading(true);
        const { user } = await createUserWithEmailAndPassword(auth, email, password);

        if (!!user) {
            const { ok } = await createUser(User.fromJSON(user));
            if (!ok) {
                setLoading(false);
                toast.error("Something went wrong");
            } else {
                await setCookie("userId", user.uid);
                router.push("/");
            }
        } else {
            setLoading(false);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className="m-auto">
            <Card className="w-[450px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign up </CardTitle>
                    <CardDescription className="mr-20">
                        Welcome to our E-commerce
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Separator />
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" autoComplete="new-email" placeholder="name.surname@example.com" onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" autoComplete="new-password" placeholder="******" onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                document.getElementById('signUp')!.click();
                            }
                        }} autoComplete="new-password" placeholder="******" onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <Button id="signUp" className="w-full" onClick={handleEmailSignUp} disabled={loading || !email || !password || !confirmPassword}>
                        <LoadingIndicator loading={loading} />
                        Sign Up
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                HAVE AN ACCOUNT?
                            </span>
                        </div>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={() => router.push('sign-in')} disabled={loading}>Sign In</Button>
                </CardContent>
            </Card>
        </div>
    );
}