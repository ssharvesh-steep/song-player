"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Show splash for 2 seconds
        const timer = setTimeout(() => {
            setOpacity(0);
            setTimeout(() => {
                setIsVisible(false);
                onFinish();
            }, 500); // Fade out duration
        }, 2000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500"
            style={{ opacity }}
        >
            <div className="flex flex-col items-center animate-pulse">
                <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-4 rounded-full mb-4 shadow-lg shadow-purple-500/50">
                    <Music size={48} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transform scale-100 animate-bounce">
                    Song Player
                </h1>
                <p className="text-neutral-500 mt-2 text-sm">Feel the beat</p>
            </div>
        </div>
    );
}
