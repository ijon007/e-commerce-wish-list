"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import defaultProfileImage from "@/public/defaultProfilePicture.webp"
import { deleteCookie } from "@/lib/domain/server-functions/cookies";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "../providers/authProvider";

export default function Navbar() {
    const { user } = useAuth()

    return (
        <div className="h-[50px] bg-card flex items-center justify-between px-10">
            <span>Store Name</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                    <Avatar>
                        <AvatarImage className="rounded-full" alt="Profile picture" src={defaultProfileImage.src} />
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={logOut}>Log Out</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}
async function logOut() {
    await deleteCookie("userId");
    await signOut(auth);
    location.reload();
} 