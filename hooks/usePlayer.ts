import { create } from "zustand";

interface Song {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    audio_url: string;
}

interface PlayerStore {
    activeSong?: Song;
    isPlaying: boolean;
    volume: number;
    setSong: (song: Song) => void;
    reset: () => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
}

const usePlayer = create<PlayerStore>((set) => ({
    activeSong: undefined,
    isPlaying: false,
    volume: 1,
    setSong: (song: Song) => set({ activeSong: song, isPlaying: true }),
    reset: () => set({ activeSong: undefined, isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setVolume: (volume: number) => set({ volume }),
}));

export default usePlayer;
