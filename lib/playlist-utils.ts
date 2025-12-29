"use client";

import { supabase } from "@/lib/supabase";

export const generatePlaylistFromArtists = async (userId: string, artistNames: string[], playlistName?: string) => {
    const name = playlistName || "My Group Mix";

    console.log(`Creating playlist '${name}' for user ${userId} with artists: ${artistNames.join(', ')}`);

    // 1. Create a new playlist
    const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .insert({
            title: name,
            user_id: userId,
            description: `Created from artists: ${artistNames.join(', ')}`
        })
        .select()
        .single();

    if (playlistError) {
        console.error("Error creating playlist - Full Object:", JSON.stringify(playlistError, null, 2));
        console.error("Error Message:", playlistError.message);
        console.error("Error Code:", playlistError.code);
        console.error("Error Details:", playlistError.details);
        throw playlistError;
    }

    if (!playlist) {
        console.error("No playlist returned after insert.");
        return [];
    }

    console.log("Playlist created:", playlist.id);

    // 2. Fetch songs by these artists
    // Using .or() with ilike for flexible matching or .in() if names are exact.
    // We'll try .in() first as it's cleaner.
    const { data: songs, error: songsError } = await supabase
        .from('songs')
        .select('id')
        .in('artist', artistNames);

    if (songsError) {
        console.error("Error fetching songs:", songsError);
        return [];
    }

    console.log(`Found ${songs?.length || 0} songs for these artists.`);

    if (songs && songs.length > 0) {
        // 3. Add songs to playlist_songs junction table
        const playlistSongs = songs.map(song => ({
            playlist_id: playlist.id,
            song_id: song.id,
        }));

        const { error: insertError } = await supabase
            .from('playlist_songs')
            .insert(playlistSongs);

        if (insertError) {
            console.error("Error adding songs to playlist:", insertError);
        } else {
            console.log(`Added ${songs.length} songs to playlist.`);
        }
    }

    return playlist;
};

export const saveArtistPreferences = async (userId: string, artists: string[]) => {
    return generatePlaylistFromArtists(userId, artists, "Your Weekly Mix");
}
