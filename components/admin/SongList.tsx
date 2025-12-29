"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import usePlayer from "@/hooks/usePlayer";
import { Play, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Song {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    audio_url: string;
    user_id: string;
}

const SongList = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const player = usePlayer();
    const router = useRouter();

    const fetchSongs = async () => {
        try {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error(error);
            } else {
                // Get Public URLs for Storage items
                const loadedSongs = data?.map(song => {
                    const imagePublicUrl = supabase.storage.from('images').getPublicUrl(song.image_url).data.publicUrl;
                    const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(song.audio_url).data.publicUrl;

                    return {
                        ...song,
                        image_url: imagePublicUrl,
                        audio_url: audioPublicUrl
                    }
                }) || [];

                setSongs(loadedSongs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (song: Song, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent playing the song when clicking delete

        const confirmed = window.confirm(
            `Are you sure you want to delete "${song.title}" by ${song.artist}?`
        );

        if (!confirmed) return;

        try {
            setDeleting(song.id);

            // First, delete from database
            const { error: dbError } = await supabase
                .from('songs')
                .delete()
                .eq('id', song.id);

            if (dbError) {
                console.error('Database delete error:', dbError);
                throw new Error(`Failed to delete from database: ${dbError.message}`);
            }

            // Then delete storage files (even if this fails, song is gone from DB)
            // Extract the storage paths - need to get original paths from database
            const { data: songData } = await supabase
                .from('songs')
                .select('audio_url, image_url')
                .eq('id', song.id)
                .single();

            // Since we already deleted from DB, use the paths we have
            const audioPath = song.audio_url.split('/songs/')[1]?.split('?')[0];
            const imagePath = song.image_url.split('/images/')[1]?.split('?')[0];

            // Delete audio file
            if (audioPath) {
                const { error: audioError } = await supabase.storage
                    .from('songs')
                    .remove([audioPath]);

                if (audioError) {
                    console.error('Error deleting audio:', audioError);
                }
            }

            // Delete image file
            if (imagePath) {
                const { error: imageError } = await supabase.storage
                    .from('images')
                    .remove([imagePath]);

                if (imageError) {
                    console.error('Error deleting image:', imageError);
                }
            }

            // Immediately update local state to remove the song from UI
            setSongs(prevSongs => prevSongs.filter(s => s.id !== song.id));

            // Also refresh from server to be sure
            await fetchSongs();
            router.refresh();

        } catch (error: any) {
            console.error('Delete error:', error);
            alert(`Failed to delete song: ${error.message}`);
            // Refresh to show current state
            await fetchSongs();
        } finally {
            setDeleting(null);
        }
    };

    useEffect(() => {
        fetchSongs();

        // Subscribe to real-time changes in the songs table
        const channel = supabase
            .channel('songs-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'songs'
                },
                (payload) => {
                    console.log('Database change detected:', payload);
                    // Refresh the song list when any change occurs
                    fetchSongs();
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return <div className="text-neutral-400">Loading songs...</div>;
    }

    if (songs.length === 0) {
        return <div className="text-neutral-400">No songs found. Upload some!</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">
                    Total Songs: <span className="text-green-500">{songs.length}</span>
                </h3>
                <button
                    onClick={() => fetchSongs()}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            <div className="flex flex-col gap-y-2 w-full p-2 max-h-96 overflow-y-auto">
                {songs.map((song) => (
                    <div
                        key={song.id}
                        className="flex items-center gap-x-3 w-full p-2 hover:bg-neutral-800/50 rounded-md group"
                    >
                        <div
                            className="flex items-center gap-x-3 flex-1 cursor-pointer"
                            onClick={() => player.setSong(song)}
                        >
                            <div className="relative min-h-[48px] min-w-[48px] overflow-hidden rounded-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={song.image_url}
                                    alt="Cover"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex flex-col gap-y-1 overflow-hidden flex-1">
                                <p className="text-white truncate">{song.title}</p>
                                <p className="text-neutral-400 text-sm truncate">{song.artist}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => handleDelete(song, e)}
                            disabled={deleting === song.id}
                            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                            title="Delete song"
                        >
                            {deleting === song.id ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Trash2 size={20} />
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SongList;
