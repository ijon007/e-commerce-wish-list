"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import LoadingIndicator from "@/components/custom/loading";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Separator } from "@/components/ui/separator";
import { setCookie } from "@/lib/domain/server-functions/cookies";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    async function handleEmailAuth() {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }
        setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            if (!!user) {
                await setCookie("userId", user.uid);
                router.push("/");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log("error: ", error)
            toast.error("Something went wrong");
        }
        setLoading(false);
    }

    return (
        <div className="col-span-2 m-auto col-start-2">
            <Card className="w-[450px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription className="mr-20">
                        Welcome to our E-commerce
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Separator />
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name.surname@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    document.getElementById('signIn')!.click();
                                }
                            }}
                        />

                    </div>
                    <Button
                    id="signIn"
                        disabled={loading || !email || !password}
                        className="w-full"
                        onClick={handleEmailAuth}
                    >
                        <LoadingIndicator loading={loading} />
                        Sign In
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                DON'T HAVE AN ACCOUNT?
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        disabled={loading}
                        className="w-full"
                        onClick={() => router.push("/sign-up")}
                    >
                        Sign Up
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}