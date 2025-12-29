"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import usePlayer from "@/hooks/usePlayer";
import { Play } from "lucide-react";

export default function StreamPage() {
    const [songs, setSongs] = useState<any[]>([]);
    const player = usePlayer();

    useEffect(() => {
        // Fetch random songs or specific "feed" logic
        const fetchFeed = async () => {
            const { data } = await supabase
                .from('songs')
                .select('*')
                .limit(20);

            if (data) {
                // Process URLs same as home page
                const loadedSongs = data.map(song => {
                    const imagePublicUrl = supabase.storage.from('images').getPublicUrl(song.image_url).data.publicUrl;
                    const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(song.audio_url).data.publicUrl;
                    return { ...song, image_url: imagePublicUrl, audio_url: audioPublicUrl };
                });
                setSongs(loadedSongs);
            }
        };
        fetchFeed();
    }, []);

    return (
        <div className="h-full w-full overflow-y-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Stream</h1>
            <p className="text-neutral-400 mb-6">Non-stop music for you</p>

            <div className="space-y-4 max-w-3xl">
                {songs.map((song) => (
                    <div
                        key={song.id}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition group cursor-pointer border border-white/5 hover:border-white/10"
                        onClick={() => player.setSong(song)}
                    >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={song.image_url} alt={song.title} className="object-cover w-full h-full" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <Play className="fill-white text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate">{song.title}</h3>
                            <p className="text-neutral-400 truncate">{song.artist}</p>
                        </div>

                        <button className="p-3 rounded-full hover:bg-white/10 transition border border-white/10">
                            <Play size={20} className="fill-current" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
