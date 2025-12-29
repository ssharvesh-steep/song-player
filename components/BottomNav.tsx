"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Library, User, Radio } from "lucide-react";
import { twMerge } from "tailwind-merge";

const BottomNav = () => {
    const pathname = usePathname();

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
            icon: Radio,
            label: "Stream",
            active: pathname === "/stream",
            href: "/stream",
        },
        {
            icon: Library,
            label: "Library",
            active: pathname === "/library" || pathname === "/liked",
            href: "/library",
        },
        {
            icon: User,
            label: "Profile",
            active: pathname === "/profile",
            href: "/profile",
        },
    ];

    return (
        <div className="fixed bottom-0 w-full bg-white/95 backdrop-blur-lg border-t border-neutral-200 md:hidden z-40 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around h-16 w-full">
                {routes.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={twMerge(
                            "flex flex-col items-center justify-center w-full h-full text-neutral-400 hover:text-orange-500 transition",
                            item.active && "text-orange-500"
                        )}
                    >
                        <item.icon size={24} className={item.active ? "fill-orange-500/20" : ""} />
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
