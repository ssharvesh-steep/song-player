"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { User, Settings, LogOut, ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();
            setIsAdmin(data?.is_admin === true);
        };
        checkAdmin();
    }, [user]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <p>Please sign in to view your profile.</p>
                <Link href="/login" className="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-neutral-900/50 p-6">
            <div className="flex flex-col items-center mb-8 pt-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg">
                    {user.email?.[0].toUpperCase()}
                </div>
                <h1 className="text-2xl font-bold text-white">{user.email?.split('@')[0]}</h1>
                <p className="text-neutral-400">{user.email}</p>

                <button className="mt-4 px-4 py-1 rounded-full border border-neutral-600 text-sm font-medium hover:border-white transition">
                    Edit Profile
                </button>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                {isAdmin && (
                    <Link href="/admin" className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition group">
                        <div className="flex items-center gap-4">
                            <Shield className="text-green-500" />
                            <span className="font-medium">Admin Panel</span>
                        </div>
                        <ChevronRight className="text-neutral-500 group-hover:text-white" />
                    </Link>
                )}

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <Settings className="text-neutral-300" />
                        <span className="font-medium">Settings</span>
                    </div>
                    <ChevronRight className="text-neutral-500 group-hover:text-white" />
                </div>

                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition group mt-8"
                >
                    <div className="flex items-center gap-4">
                        <LogOut />
                        <span className="font-medium">Log Out</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
