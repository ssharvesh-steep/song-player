"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { Heart, ListMusic, Radio, History, PlayCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const LibraryItem = ({ icon: Icon, label, href, color }: any) => (
    <Link
        href={href}
        className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition group border border-neutral-100"
    >
        <div className={`p-3 rounded-full ${color} bg-opacity-10 group-hover:bg-opacity-20 transition`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="font-bold text-lg text-neutral-800">{label}</span>
    </Link>
);

export default function LibraryPage() {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('playlists')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setPlaylists(data);
        };
        fetchPlaylists();
    }, [user]);

    return (
        <div className="h-full w-full overflow-y-auto p-6 bg-gray-50">
            <h1 className="text-3xl font-bold text-neutral-800 mb-6">Your Library</h1>

            <div className="grid gap-4 max-w-2xl mb-8">
                <LibraryItem
                    icon={Heart}
                    label="Liked Songs"
                    href="/liked"
                    color="bg-green-500 text-green-600"
                />
                {/* <LibraryItem
                    icon={ListMusic}
                    label="Playlists"
                    href="/library/playlists"
                    color="bg-purple-500 text-purple-600"
                /> */}
                <LibraryItem
                    icon={Radio}
                    label="Your Station"
                    href="/stream"
                    color="bg-blue-500 text-blue-600"
                />
                <LibraryItem
                    icon={History}
                    label="History"
                    href="/history"
                    color="bg-orange-500 text-orange-600"
                />
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-neutral-800">Your Playlists</h2>
                    <Link
                        href="/create-playlist"
                        className="flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-1 rounded-full transition"
                    >
                        <Plus size={16} /> New Playlist
                    </Link>
                </div>

                {playlists.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-xl border-dashed border-2 border-neutral-200">
                        <div className="inline-block p-4 bg-orange-50 rounded-full mb-3">
                            <ListMusic size={32} className="text-orange-500" />
                        </div>
                        <p className="text-neutral-500 font-medium mb-4">No playlists created yet</p>
                        <Link
                            href="/create-playlist"
                            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-full font-bold hover:scale-105 transition shadow-lg shadow-orange-500/30"
                        >
                            Create Group Playlist
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {playlists.map((playlist) => (
                            <Link
                                key={playlist.id}
                                href={`/playlist?id=${playlist.id}`}
                                className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-neutral-100"
                            >
                                <div className="aspect-square bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg mb-3 flex items-center justify-center shadow-inner relative overflow-hidden">
                                    {/* Placeholder Album Art */}
                                    {playlist.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={playlist.image_url} alt={playlist.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ListMusic className="text-white/50 w-12 h-12" />
                                    )}

                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <PlayCircle size={32} className="text-white fill-white/20" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-neutral-800 truncate">{playlist.title}</h3>
                                <p className="text-xs text-neutral-400 truncate">
                                    {playlist.description || "Custom Playlist"}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
