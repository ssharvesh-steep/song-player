"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import usePlayer from "@/hooks/usePlayer";
import SearchInput from "@/components/SearchInput";
import { Play, Download as DownloadIcon, Check } from "lucide-react";
import { downloadSong, isSongDownloaded } from "@/lib/downloads";

interface Song {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    audio_url: string;
}

const SearchContent = () => {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');

    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [downloadedSongs, setDownloadedSongs] = useState<Set<string>>(new Set());
    const player = usePlayer();

    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true);

            let query = supabase
                .from('songs')
                .select('*')
                .order('created_at', { ascending: false });

            if (title) {
                query = query.ilike('title', `%${title}%`);
            }

            const { data, error } = await query;

            if (!error && data) {
                const loadedSongs = data.map(song => {
                    const imagePublicUrl = supabase.storage.from('images').getPublicUrl(song.image_url).data.publicUrl;
                    const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(song.audio_url).data.publicUrl;
                    return { ...song, image_url: imagePublicUrl, audio_url: audioPublicUrl };
                });
                setSongs(loadedSongs);

                // Check which songs are downloaded
                const downloaded = new Set<string>();
                for (const song of loadedSongs) {
                    if (await isSongDownloaded(song.id)) {
                        downloaded.add(song.id);
                    }
                }
                setDownloadedSongs(downloaded);
            } else {
                setSongs([]);
            }
            setLoading(false);
        };

        fetchSongs();
    }, [title]);

    const handleDownload = async (song: Song) => {
        try {
            setDownloading(song.id);
            await downloadSong(song);
            setDownloadedSongs(prev => new Set(prev).add(song.id));
            // Don't show alert for icon button, just visual change is enough
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download song');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="flex flex-col gap-y-6 p-6">
            <h1 className="text-white text-3xl font-semibold">
                Search
            </h1>

            <SearchInput />

            <div className="flex flex-col gap-y-2 w-full">
                {loading ? (
                    <div className="text-neutral-400">Loading...</div>
                ) : songs.length === 0 ? (
                    <div className="text-neutral-400">
                        No songs found.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {songs.map((song) => (
                            <div
                                key={song.id}
                                className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 hover:bg-neutral-400/10 transition p-3"
                            >
                                <div
                                    className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4 cursor-pointer"
                                    onClick={() => player.setSong(song)}
                                >
                                    <img
                                        className="object-cover w-full h-full"
                                        src={song.image_url}
                                        alt="Cover"
                                    />
                                    <div className="absolute transition opacity-0 rounded-full flex items-center justify-center bg-green-500 p-4 drop-shadow-md right-2 bottom-2 group-hover:opacity-100 hover:scale-110">
                                        <Play className="text-black fill-black" />
                                    </div>
                                </div>
                                <div className="flex flex-row items-center w-full pt-2 gap-x-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!downloadedSongs.has(song.id)) {
                                                handleDownload(song);
                                            }
                                        }}
                                        disabled={downloading === song.id || downloadedSongs.has(song.id)}
                                        title={downloadedSongs.has(song.id) ? 'Downloaded' : 'Download for offline'}
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition ${downloadedSongs.has(song.id)
                                            ? 'text-green-500 cursor-default'
                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                                            }`}
                                    >
                                        {downloading === song.id ? (
                                            <div className="animate-spin text-green-500">⏳</div>
                                        ) : downloadedSongs.has(song.id) ? (
                                            <Check size={18} />
                                        ) : (
                                            <DownloadIcon size={20} />
                                        )}
                                    </button>
                                    <div className="flex flex-col items-start min-w-0 flex-1">
                                        <p className="font-semibold truncate w-full text-white text-sm">{song.title}</p>
                                        <p className="text-neutral-400 text-xs w-full truncate">{song.artist}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SearchPage = () => {
    return (
        <div
            className="
                bg-neutral-900 
                rounded-lg 
                h-full 
                w-full 
                overflow-hidden 
                overflow-y-auto
            "
        >
            <Suspense fallback={<div className="text-white p-6">Loading search...</div>}>
                <SearchContent />
            </Suspense>
        </div>
    );
};

export default SearchPage;
