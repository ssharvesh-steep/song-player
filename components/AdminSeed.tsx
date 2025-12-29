"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthContext";
import { seedSongs } from "@/lib/seed-data";
import { DownloadCloud } from "lucide-react";

export default function AdminSeed() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Simple check - in real app use proper admin guard
    if (!user) return null;

    const handleSeed = async () => {
        setLoading(true);
        try {
            for (const song of seedSongs) {
                await supabase.from('songs').insert({
                    user_id: user.id,
                    title: song.title,
                    artist: song.artist,
                    image_url: song.image_url,
                    audio_url: song.audio_url,
                    author: user.email?.split('@')[0] || 'Admin',
                    song_path: 'external', // Placeholder required by DB constraint?
                    image_path: 'external'
                });
            }
            alert("Added seed songs from external URLs!");
            window.location.reload();
        } catch (error) {
            console.error("Seed error:", error);
            alert("Failed to seed songs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSeed}
            disabled={loading}
            className="fixed bottom-4 right-4 bg-neutral-800 text-white p-3 rounded-full hover:bg-neutral-700 z-50 flex items-center gap-2"
        >
            <DownloadCloud size={20} />
            {loading ? "Seeding..." : "Load Demo Songs"}
        </button>
    );
}
