import { Song } from "../types";
import usePlayer from "./usePlayer";
import { useAuth } from "@/components/auth/AuthContext";

const useOnPlay = (songs: Song[]) => {
    const player = usePlayer();
    const { user } = useAuth();

    const onPlay = (id: string) => {
        if (!user) {
            // Add logic to open auth modal if needed
            return;
        }

        const song = songs.find((s) => s.id === id);

        if (song) {
            player.setSong({
                id: song.id,
                title: song.title,
                artist: song.artist || "",
                image_url: song.image_url || "",
                audio_url: song.audio_url || ""
            });
        }
    };

    return onPlay;
};

export default useOnPlay;
