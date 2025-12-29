"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { Song } from "@/types";
import { Play, Download as DownloadIcon, Check } from "lucide-react";
import usePlayer from "@/hooks/usePlayer";
import LikeButton from "@/components/LikeButton";
import { downloadSong, isSongDownloaded } from "@/lib/downloads";

export default function LikedSongs() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [likedSongs, setLikedSongs] = useState<Song[]>([]);
    const [isLoadingSongs, setIsLoadingSongs] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [downloadedSongs, setDownloadedSongs] = useState<Set<string>>(new Set());
    const player = usePlayer();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [loading, user, router]);

    const fetchLikedSongs = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('liked_songs')
            .select('*, songs(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const songs = data.map((item: any) => {
                const song = item.songs;
                // Ensure public URLs are generated
                const imagePublicUrl = supabase.storage.from('images').getPublicUrl(song.image_url).data.publicUrl;
                const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(song.audio_url).data.publicUrl;

                return {
                    ...song,
                    image_url: imagePublicUrl,
                    audio_url: audioPublicUrl
                };
            });
            setLikedSongs(songs);

            // Check which songs are downloaded
            const downloaded = new Set<string>();
            for (const song of songs) {
                if (await isSongDownloaded(song.id)) {
                    downloaded.add(song.id);
                }
            }
            setDownloadedSongs(downloaded);
        }
        setIsLoadingSongs(false);
    };

    useEffect(() => {
        fetchLikedSongs();
    }, [user]);

    const handleDownload = async (song: any) => {
        try {
            setDownloading(song.id);
            await downloadSong(song);
            setDownloadedSongs(prev => new Set(prev).add(song.id));
            //   alert(`"${song.title}" downloaded!`);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download song');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-neutral-900 rounded-lg">
                <div className="text-neutral-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-end gap-x-5 mb-8">
                    <div className="relative h-32 w-32 lg:h-44 lg:w-44">
                        <div className="w-full h-full rounded-md bg-gradient-to-br from-purple-700 to-blue-500 flex items-center justify-center shadow-xl">
                            {/* <img // Using a heart image or icon here would be nice
                                className="object-cover"
                                src="/images/liked.png" 
                                alt="Playlist"
                            /> */}
                            <span className="text-6xl">❤️</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
                        <p className="hidden md:block font-semibold text-sm text-white">Playlist</p>
                        <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">Liked Songs</h1>
                    </div>
                </div>

                {isLoadingSongs ? (
                    <div className="text-neutral-400">Loading songs...</div>
                ) : likedSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-y-2 w-full text-neutral-400 mt-10">
                        <p>No liked songs yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-y-2 w-full p-2">
                        {likedSongs.map((song) => (
                            <div
                                key={song.id}
                                onClick={() => player.setSong(song as any)}
                                className="group flex items-center gap-x-4 w-full p-2 hover:bg-neutral-800/50 rounded-md cursor-pointer transition"
                            >
                                <div className="relative min-h-[48px] min-w-[48px] overflow-hidden rounded-md">
                                    <img
                                        className="object-cover w-full h-full"
                                        src={song.image_url}
                                        alt="Image"
                                    />
                                    <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                                        <Play size={20} className="text-white fill-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-1 overflow-hidden flex-1">
                                    <p className="text-white truncate">{song.title}</p>
                                    <p className="text-neutral-400 text-sm truncate">{song.artist}</p>
                                </div>

                                <LikeButton songId={song.id} />

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!downloadedSongs.has(song.id)) handleDownload(song);
                                    }}
                                    disabled={downloading === song.id || downloadedSongs.has(song.id)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition ${downloadedSongs.has(song.id)
                                            ? 'text-green-500 cursor-default'
                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                                        }`}
                                >
                                    {downloading === song.id ? (
                                        <div className="animate-spin text-green-500 text-xs">⏳</div>
                                    ) : downloadedSongs.has(song.id) ? (
                                        <Check size={18} />
                                    ) : (
                                        <DownloadIcon size={18} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
