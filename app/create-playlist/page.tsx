"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Music } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { generatePlaylistFromArtists } from "@/lib/playlist-utils";
import { Input } from "@/components/ui/Input";

// Re-using the artist list for consistency, ideally this should be fetched or shared constant
const ARTISTS = [
    { name: "The Weeknd", size: "w-24 h-24", color: "bg-orange-100", text: "text-orange-600" },
    { name: "Taylor Swift", size: "w-20 h-20", color: "bg-blue-100", text: "text-blue-600" },
    { name: "Drake", size: "w-20 h-20", color: "bg-purple-100", text: "text-purple-600" },
    { name: "Ariana Grande", size: "w-28 h-28", color: "bg-pink-100", text: "text-pink-600" },
    { name: "Justin Bieber", size: "w-16 h-16", color: "bg-yellow-100", text: "text-yellow-600" },
    { name: "Post Malone", size: "w-20 h-20", color: "bg-gray-100", text: "text-gray-600" },
    { name: "Ed Sheeran", size: "w-24 h-24", color: "bg-red-100", text: "text-red-600" },
    { name: "Dua Lipa", size: "w-20 h-20", color: "bg-indigo-100", text: "text-indigo-600" },
    { name: "Harry Styles", size: "w-22 h-22", color: "bg-green-100", text: "text-green-600" },
    { name: "Doja Cat", size: "w-20 h-20", color: "bg-rose-100", text: "text-rose-600" },
    { name: "Billie Eilish", size: "w-20 h-20", color: "bg-lime-100", text: "text-lime-600" },
    { name: "Bruno Mars", size: "w-16 h-16", color: "bg-orange-200", text: "text-orange-700" }
];

export default function CreatePlaylistPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [playlistName, setPlaylistName] = useState("");
    const [loading, setLoading] = useState(false);

    const toggleArtist = (artist: string) => {
        if (selectedArtists.includes(artist)) {
            setSelectedArtists(selectedArtists.filter((a) => a !== artist));
        } else {
            setSelectedArtists([...selectedArtists, artist]);
        }
    };

    const handleCreate = async () => {
        if (!user || !playlistName.trim()) return;

        setLoading(true);
        try {
            await generatePlaylistFromArtists(user.id, selectedArtists, playlistName);
            router.push("/library");
            router.refresh(); // Ensure library updates
        } catch (error) {
            console.error("Failed to create playlist", error);
            alert("Failed to create playlist");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50 p-6 pb-24">
            <div className="max-w-2xl mx-auto flex flex-col items-center">
                <h1 className="text-3xl font-bold text-neutral-800 mb-2">Create New Playlist</h1>
                <p className="text-neutral-500 text-center mb-8">
                    Name your playlist and pick artists to automatically add their songs.
                </p>

                <div className="w-full mb-8">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Playlist Name</label>
                    <Input
                        placeholder="e.g. Morning Vibe, Workout Mix"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        className="bg-white border-neutral-200 text-lg h-14 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                    />
                </div>

                <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-4">Select Artists to Group</label>
                    <div className="flex flex-wrap justify-center gap-4">
                        {ARTISTS.map((artist) => {
                            const isSelected = selectedArtists.includes(artist.name);
                            return (
                                <button
                                    key={artist.name}
                                    onClick={() => toggleArtist(artist.name)}
                                    className={`
                                    rounded-full flex items-center justify-center transition-all duration-300 relative
                                    ${artist.size}
                                    ${isSelected ? 'bg-orange-500 scale-110 shadow-lg shadow-orange-500/40' : artist.color}
                                `}
                                >
                                    <span className={`
                                    relative z-10 font-bold text-center text-xs px-1
                                    ${isSelected ? 'text-white' : artist.text}
                                `}>
                                        {artist.name}
                                    </span>

                                    {isSelected && (
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                                            <Check size={12} className="text-orange-500" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={loading || !playlistName.trim() || selectedArtists.length === 0}
                    className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg mt-8 ${!loading && playlistName.trim() && selectedArtists.length > 0
                            ? "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-orange-500/30"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                >
                    {loading ? (
                        "Creating..."
                    ) : (
                        <>
                            Create Playlist <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
