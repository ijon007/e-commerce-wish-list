"use client"
import { User } from "@/lib/domain/classes/user";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";

interface AuthContextType {
    user: User;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
}

interface Properties {
    children: React.ReactNode,
}

export const AuthContextProvider = (props: Properties) => {
    const { children } = props;
    const [user, setUser] = useState<User>({
        name: null,
        email: null,
        uid: null,
    });
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser({
                    email: user.email,
                    uid: user.uid,
                    name: user.displayName,

                });
            } else {
                setUser({ email: null, uid: null, name: null });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pathname, router, user.uid]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};