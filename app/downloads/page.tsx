"use client";

import { useEffect, useState } from "react";
import { getDownloadedSongs, deleteDownload, type DownloadedSong } from "@/lib/downloads";
import usePlayer from "@/hooks/usePlayer";
import { Play, Trash2, Download as DownloadIcon } from "lucide-react";

export default function DownloadsPage() {
    const [downloads, setDownloads] = useState<DownloadedSong[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const player = usePlayer();

    useEffect(() => {
        loadDownloads();
    }, []);

    const loadDownloads = async () => {
        setLoading(true);
        const songs = await getDownloadedSongs();
        setDownloads(songs);
        setLoading(false);
    };

    const handleDelete = async (songId: string) => {
        if (!confirm("Remove this song from downloads?")) return;

        try {
            setDeleting(songId);
            await deleteDownload(songId);
            await loadDownloads();
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete download");
        } finally {
            setDeleting(null);
        }
    };

    const handlePlay = (song: DownloadedSong) => {
        // Create blob URLs for playback
        const audioUrl = URL.createObjectURL(song.audio_blob);
        const imageUrl = URL.createObjectURL(song.image_blob);

        player.setSong({
            id: song.id,
            title: song.title,
            artist: song.artist,
            image_url: imageUrl,
            audio_url: audioUrl,
        });
    };

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <DownloadIcon size={28} />
                            Downloads
                        </h1>
                        <p className="text-neutral-400 text-sm mt-1">
                            {downloads.length} {downloads.length === 1 ? 'song' : 'songs'} downloaded for offline playback
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-white">Loading downloads...</div>
                ) : downloads.length === 0 ? (
                    <div className="text-center py-12">
                        <DownloadIcon size={64} className="mx-auto text-neutral-600 mb-4" />
                        <p className="text-neutral-400 text-lg">No downloads yet</p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Download songs from the home page to play them offline
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {downloads.map((song) => (
                            <div
                                key={song.id}
                                className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 hover:bg-neutral-400/10 transition p-3"
                            >
                                <div
                                    className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4 cursor-pointer"
                                    onClick={() => handlePlay(song)}
                                >
                                    <img
                                        className="object-cover w-full h-full"
                                        src={URL.createObjectURL(song.image_blob)}
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
                                            handleDelete(song.id);
                                        }}
                                        disabled={deleting === song.id}
                                        title="Remove from downloads"
                                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition text-neutral-400 hover:text-red-500 hover:bg-neutral-700 disabled:opacity-50"
                                    >
                                        {deleting === song.id ? (
                                            <div className="animate-spin text-red-500">⏳</div>
                                        ) : (
                                            <Trash2 size={18} />
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
}
