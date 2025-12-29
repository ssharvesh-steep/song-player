"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import Player from "@/components/player/Player";
import AdminSeed from "@/components/AdminSeed";

export default function ClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showSplash, setShowSplash] = useState(true);

    // You might want to persist splash state so it doesn't show on every refresh,
    // but for a "native app" feel, showing it briefly on load is fine.
    // We can add logic here to check if it's the first visit if needed.

    return (
        <>
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

            <div className="flex h-screen overflow-hidden bg-black text-white">
                {/* Sidebar - Desktop Only */}
                <aside className="hidden md:block w-[300px] h-full p-2">
                    <Sidebar />
                </aside>

                {/* Main Content */}
                <main className="flex-1 h-full overflow-hidden relative">
                    <div className="h-full w-full overflow-y-auto pb-[90px] md:pb-[90px] pb-safe rounded-2xl glass border-none">
                        {children}
                        <AdminSeed />
                    </div>
                </main>

                {/* Bottom Nav - Mobile Only */}
                <BottomNav />
            </div>

            {/* Persistent Player */}
            <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 h-[80px] md:h-[90px] z-30">
                <Player />
            </div>
        </>
    );
}
