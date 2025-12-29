"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Library, PlusSquare, LogIn, UserPlus, LogOut, Shield, Heart } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/components/auth/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import InstallPrompt from "./InstallPrompt";

const Sidebar = () => {
    const pathname = usePathname();
    const { user, loading, signOut } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                setIsAdmin(false);
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            setIsAdmin(data?.is_admin === true);
        };

        checkAdmin();
    }, [user]);

    const routes = [
        {
            icon: Home,
            label: "Home",
            active: pathname === "/",
            href: "/",
        },
        {
            icon: Search,
            label: "Search",
            active: pathname === "/search",
            href: "/search",
        },
        {
            icon: require("lucide-react").Download,
            label: "Downloads",
            active: pathname === "/downloads",
            href: "/downloads",
        },
    ];

    return (
        <div className="hidden md:flex flex-col gap-y-2 bg-black h-full w-[300px] p-2">
            <div className="bg-neutral-900 rounded-lg h-fit w-full">
                <div className="flex flex-col gap-y-4 px-5 py-4">
                    {routes.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={twMerge(
                                "flex flex-row h-auto items-center w-full gap-x-4 text-md font-medium cursor-pointer hover:text-white transition text-neutral-400 py-1",
                                item.active && "text-white"
                            )}
                        >
                            <item.icon size={26} />
                            <p className="truncate w-100">{item.label}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-neutral-900 rounded-lg h-full w-full overflow-y-auto">
                <div className="flex flex-col gap-y-2 px-5 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/liked" className="inline-flex items-center gap-x-2 text-neutral-400 font-medium hover:text-white transition cursor-pointer">
                            <Library size={26} />
                            <p>Your Library</p>
                        </Link>
                        <PlusSquare
                            size={20}
                            className="text-neutral-400 cursor-pointer hover:text-white transition"
                        />
                    </div>

                    <div className="flex flex-col gap-y-2 mt-4 px-3">
                        <Link
                            href="/liked"
                            className="flex items-center gap-x-4 w-full hover:bg-neutral-800/50 p-2 rounded-md transition group"
                        >
                            <div className="relative min-h-[48px] min-w-[48px] overflow-hidden rounded-md bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center group-hover:scale-105 transition shadow-md">
                                <Heart className="text-white fill-white" size={24} />
                            </div>
                            <div className="flex flex-col gap-y-1 overflow-hidden">
                                <p className="text-white truncate font-medium group-hover:text-green-400 transition">Liked Songs</p>
                                <p className="text-neutral-400 text-xs truncate">Auto Playlist</p>
                            </div>
                        </Link>
                    </div>

                    <div className="px-3 mt-4">
                        <InstallPrompt />
                    </div>

                    {/* Authentication Section */}
                    <div className="border-t border-neutral-800 pt-4 mt-4">
                        {loading ? (
                            <p className="text-neutral-400 text-sm">Loading...</p>
                        ) : user ? (
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <p className="text-neutral-400">Signed in as</p>
                                    <p className="text-white font-medium truncate">{user.email}</p>
                                </div>

                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className={twMerge(
                                            "flex items-center gap-x-3 text-neutral-400 hover:text-white transition py-2",
                                            pathname === "/admin" && "text-green-500"
                                        )}
                                    >
                                        <Shield size={20} />
                                        <span className="font-medium">Admin Panel</span>
                                    </Link>
                                )}

                                <button
                                    onClick={signOut}
                                    className="flex items-center gap-x-3 text-neutral-400 hover:text-red-400 transition py-2 w-full"
                                >
                                    <LogOut size={20} />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    className="flex items-center gap-x-3 text-neutral-400 hover:text-white transition py-2"
                                >
                                    <LogIn size={20} />
                                    <span className="font-medium">Sign In</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center gap-x-3 text-neutral-400 hover:text-green-400 transition py-2"
                                >
                                    <UserPlus size={20} />
                                    <span className="font-medium">Sign Up</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
