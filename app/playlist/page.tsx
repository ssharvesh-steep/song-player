"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import usePlayer from "@/hooks/usePlayer";
import { Play, Clock, MoreHorizontal, Download as DownloadIcon, Check } from "lucide-react";
import { downloadSong, isSongDownloaded } from "@/lib/downloads";

function PlaylistContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [playlist, setPlaylist] = useState<any>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [downloadedSongs, setDownloadedSongs] = useState<Set<string>>(new Set());
    const player = usePlayer();

    useEffect(() => {
        const fetchPlaylist = async () => {
            // 1. Fetch Playlist Details
            const { data: playlistData, error } = await supabase
                .from('playlists')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching playlist:", error);
                setLoading(false);
                return;
            }
            setPlaylist(playlistData);

            // 2. Fetch Playlist Songs
            const { data: songsData, error: songsError } = await supabase
                .from('playlist_songs')
                .select('songs(*)') // Nested select
                .eq('playlist_id', id)
                .order('added_at', { ascending: true });

            if (songsData) {
                const loadedSongs = songsData.map((item: any) => {
                    const song = item.songs;
                    // Ensure public URLs are generated
                    const imagePublicUrl = song.image_url.startsWith('http') ? song.image_url : supabase.storage.from('images').getPublicUrl(song.image_url).data.publicUrl;
                    const audioPublicUrl = song.audio_url.startsWith('http') ? song.audio_url : supabase.storage.from('songs').getPublicUrl(song.audio_url).data.publicUrl;
                    return { ...song, image_url: imagePublicUrl, audio_url: audioPublicUrl };
                });
                setSongs(loadedSongs);

                // Check downloads
                const downloaded = new Set<string>();
                for (const song of loadedSongs) {
                    if (await isSongDownloaded(song.id)) {
                        downloaded.add(song.id);
                    }
                }
                setDownloadedSongs(downloaded);
            }
            setLoading(false);
        };

        if (id) fetchPlaylist();
    }, [id]);

    const handleDownload = async (song: any) => {
        try {
            setDownloading(song.id);
            await downloadSong(song);
            setDownloadedSongs(prev => new Set(prev).add(song.id));
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download song');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-neutral-400">Loading playlist...</div>;
    }

    if (!playlist) {
        return <div className="p-8 text-center text-neutral-400">Playlist not found.</div>
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-b from-orange-200 to-gray-50 p-6 pt-10">
                <div className="flex flex-col md:flex-row items-end gap-6">
                    <div className="w-48 h-48 bg-gradient-to-br from-orange-400 to-pink-500 shadow-2xl rounded-lg flex items-center justify-center flex-shrink-0">
                        {/* Placeholder art if no image_url */}
                        <span className="text-6xl font-bold text-white opacity-50">#</span>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Playlist</span>
                        <h1 className="text-4xl md:text-6xl font-black text-neutral-800">{playlist.title}</h1>
                        <p className="text-neutral-500 font-medium mt-2 line-clamp-2">{playlist.description}</p>

                        <div className="flex items-center gap-2 mt-4 text-sm font-medium text-neutral-600">
                            {/* User name would require fetching author profile, assuming "Me" for now */}
                            <span>Created by You</span>
                            <span>• {songs.length} songs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => songs.length > 0 && player.setSong(songs[0])}
                    className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center hover:scale-105 transition shadow-lg shadow-orange-500/30"
                >
                    <Play size={28} className="text-white fill-white ml-1" />
                </button>
                <button className="text-neutral-400 hover:text-neutral-800 transition">
                    <MoreHorizontal size={32} />
                </button>
            </div>

            {/* Songs List */}
            <div className="px-6 pb-24">
                <div className="grid grid-cols-[16px_4fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-2 text-sm font-medium text-neutral-500 border-b border-neutral-200 mb-2">
                    <span>#</span>
                    <span>Title</span>
                    <span className="hidden md:block">Date Added</span>
                    <span className="text-right"><Clock size={16} /></span>
                </div>

                <div className="flex flex-col">
                    {songs.map((song, index) => (
                        <div
                            key={song.id}
                            onClick={() => player.setSong(song)}
                            className="group grid grid-cols-[16px_4fr_2fr_minmax(120px,1fr)] gap-4 px-4 py-3 rounded-md hover:bg-neutral-100 transition items-center cursor-pointer text-sm font-medium text-neutral-600 border border-transparent hover:border-neutral-200"
                        >
                            <span className="group-hover:text-orange-500">{index + 1}</span>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded bg-neutral-200 flex-shrink-0 overflow-hidden">
                                    <img src={song.image_url} className="w-full h-full object-cover" alt="Art" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-neutral-800 truncate font-bold group-hover:text-orange-600 transition">{song.title}</span>
                                    <span className="text-neutral-400 truncate">{song.artist}</span>
                                </div>
                            </div>
                            <span className="hidden md:block text-neutral-400">Just now</span>
                            <div className="flex items-center justify-end gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!downloadedSongs.has(song.id)) handleDownload(song);
                                    }}
                                    disabled={downloading === song.id || downloadedSongs.has(song.id)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${downloadedSongs.has(song.id)
                                        ? 'text-orange-500'
                                        : 'text-neutral-300 hover:text-orange-500 opacity-0 group-hover:opacity-100'
                                        }`}
                                >
                                    {downloading === song.id ? (
                                        <div className="animate-spin text-orange-500 text-xs">⏳</div>
                                    ) : downloadedSongs.has(song.id) ? (
                                        <Check size={16} />
                                    ) : (
                                        <DownloadIcon size={16} />
                                    )}
                                </button>
                                <span>3:45</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function PlaylistPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading...</div>}>
            <PlaylistContent />
        </Suspense>
    );
}
