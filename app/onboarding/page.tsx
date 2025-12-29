"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { saveArtistPreferences } from "@/lib/playlist-utils"; // Import helper
import { useAuth } from "@/components/auth/AuthContext";

// Bubble layout sizing - purely visual randomness for "Cloud" effect
const ARTISTS = [
    { name: "The Weeknd", size: "w-32 h-32", color: "bg-orange-100", text: "text-orange-600" },
    { name: "Taylor Swift", size: "w-28 h-28", color: "bg-blue-100", text: "text-blue-600" },
    { name: "Drake", size: "w-24 h-24", color: "bg-purple-100", text: "text-purple-600" },
    { name: "Ariana Grande", size: "w-36 h-36", color: "bg-pink-100", text: "text-pink-600" },
    { name: "Justin Bieber", size: "w-20 h-20", color: "bg-yellow-100", text: "text-yellow-600" },
    { name: "Post Malone", size: "w-28 h-28", color: "bg-gray-100", text: "text-gray-600" },
    { name: "Ed Sheeran", size: "w-32 h-32", color: "bg-red-100", text: "text-red-600" },
    { name: "Dua Lipa", size: "w-24 h-24", color: "bg-indigo-100", text: "text-indigo-600" },
    { name: "Harry Styles", size: "w-30 h-30", color: "bg-green-100", text: "text-green-600" },
    { name: "Doja Cat", size: "w-26 h-26", color: "bg-rose-100", text: "text-rose-600" },
    { name: "Billie Eilish", size: "w-28 h-28", color: "bg-lime-100", text: "text-lime-600" },
    { name: "Bruno Mars", size: "w-22 h-22", color: "bg-orange-200", text: "text-orange-700" }
];

export default function Onboarding() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleArtist = (artist: string) => {
        if (selectedArtists.includes(artist)) {
            setSelectedArtists(selectedArtists.filter((a) => a !== artist));
        } else {
            setSelectedArtists([...selectedArtists, artist]);
        }
    };

    const handleContinue = async () => {
        setLoading(true);
        if (user) {
            await saveArtistPreferences(user.id, selectedArtists);
        }

        // Simulate processing
        setTimeout(() => {
            setLoading(false);
            router.push("/");
        }, 1500);
    };

    return (
        <div className="min-h-full w-full p-4 flex flex-col pt-10 bg-white items-center">
            <div className="w-full max-w-md text-center mb-8">
                <h1 className="text-2xl font-bold text-neutral-800 mb-2">Choose artists you like</h1>
                <p className="text-neutral-500 text-sm">Recommendations will improve the more you listen.</p>
            </div>

            {/* Bubble Layout - CSS Grid/Flex randomness */}
            <div className="flex flex-wrap justify-center gap-4 max-w-lg mb-24">
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
                            {/* Image Placeholder */}
                            <div className="absolute inset-2 rounded-full overflow-hidden opacity-80">
                                {/* <img src="..." className="w-full h-full object-cover" /> */}
                                {/* Using colored div as placeholder for image */}
                                {!isSelected && <div className={`w-full h-full opacity-20 bg-black`}></div>}
                            </div>

                            <span className={`
                            relative z-10 font-bold text-center text-sm px-2
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

            {/* Fixed Continue Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md md:static md:bg-transparent">
                <button
                    onClick={handleContinue}
                    disabled={selectedArtists.length < 3}
                    className={`w-full max-w-md mx-auto py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${selectedArtists.length >= 3
                            ? "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-xl shadow-orange-500/30"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                >
                    {loading ? "Creating Playlist..." : "DONE"}
                </button>
            </div>
        </div>
    );
}
