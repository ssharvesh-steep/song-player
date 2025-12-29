"use client";

import { useEffect, useRef, useState } from "react";
import usePlayer from "@/hooks/usePlayer";
import useOfflineSong from "@/hooks/useOfflineSong";
import { supabase } from "@/lib/supabase";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import LikeButton from "../LikeButton";

const Player = () => {
    const player = usePlayer();
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const songUrl = useOfflineSong(player.activeSong?.audio_url);

    const Icon = player.isPlaying ? Pause : Play;

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = player.volume;
        }
    }, [player.volume]);

    useEffect(() => {
        if (audioRef.current) {
            if (player.isPlaying) {
                audioRef.current.play().catch(() => { });
            } else {
                audioRef.current.pause();
            }
        }
    }, [player.isPlaying, songUrl]); // Add songUrl dependency to trigger play when loaded

    const handlePlay = () => {
        player.togglePlay();
    };

    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    }

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    const handleSongEnd = async () => {
        // Get all songs from database
        const { data: allSongs } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!allSongs || allSongs.length === 0) {
            player.reset();
            return;
        }

        // Find current song index
        const currentIndex = allSongs.findIndex((s: any) => s.id === player.activeSong?.id);

        // Get next song (loop back to first if at end)
        const nextIndex = (currentIndex + 1) % allSongs.length;
        const nextSong = allSongs[nextIndex];

        // Convert paths to public URLs
        const imagePublicUrl = supabase.storage.from('images').getPublicUrl(nextSong.image_url).data.publicUrl;
        const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(nextSong.audio_url).data.publicUrl;

        // Play next song
        player.setSong({
            ...nextSong,
            image_url: imagePublicUrl,
            audio_url: audioPublicUrl
        });
    };

    const onPlayNext = async () => {
        if (!player.activeSong) return;

        const { data: allSongs } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!allSongs || allSongs.length === 0) return;

        const currentIndex = allSongs.findIndex((s: any) => s.id === player.activeSong?.id);
        const nextIndex = (currentIndex + 1) % allSongs.length;
        const nextSong = allSongs[nextIndex];

        const imagePublicUrl = supabase.storage.from('images').getPublicUrl(nextSong.image_url).data.publicUrl;
        const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(nextSong.audio_url).data.publicUrl;

        player.setSong({
            ...nextSong,
            image_url: imagePublicUrl,
            audio_url: audioPublicUrl
        });
    }

    const onPlayPrevious = async () => {
        if (!player.activeSong) return;

        const { data: allSongs } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!allSongs || allSongs.length === 0) return;

        const currentIndex = allSongs.findIndex((s: any) => s.id === player.activeSong?.id);
        const prevIndex = currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1;
        const prevSong = allSongs[prevIndex];

        const imagePublicUrl = supabase.storage.from('images').getPublicUrl(prevSong.image_url).data.publicUrl;
        const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(prevSong.audio_url).data.publicUrl;

        player.setSong({
            ...prevSong,
            image_url: imagePublicUrl,
            audio_url: audioPublicUrl
        });
    }

    if (!player.activeSong) return null;

    return (
        <div className="flex justify-between items-center h-full w-full">
            <audio
                ref={audioRef}
                src={songUrl || player.activeSong.audio_url}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={handleSongEnd}
            />

            {/* Song Info */}
            <div className="flex w-1/3 justify-start items-center gap-x-4">
                <div className="relative h-14 w-14 bg-neutral-800 rounded-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="object-cover w-full h-full"
                        src={player.activeSong.image_url}
                        alt="Cover"
                    />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-white truncate font-medium">{player.activeSong.title}</p>
                    <p className="text-neutral-400 text-sm truncate">{player.activeSong.artist}</p>
                </div>
                <LikeButton songId={player.activeSong.id} />
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center w-1/3 gap-y-2">
                <div className="flex items-center gap-x-6">
                    <SkipBack
                        onClick={onPlayPrevious}
                        size={20}
                        className="text-neutral-400 hover:text-white cursor-pointer transition"
                    />
                    <div
                        onClick={handlePlay}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-white p-1 cursor-pointer hover:scale-110 transition text-black"
                    >
                        <Icon size={20} className="text-black fill-black ml-0.5" />
                    </div>
                    <SkipForward
                        onClick={onPlayNext}
                        size={20}
                        className="text-neutral-400 hover:text-white cursor-pointer transition"
                    />
                </div>
                <div className="w-full flex items-center gap-x-2">
                    <span className="text-xs text-neutral-400">{formatTime(currentTime)}</span>
                    <Slider.Root
                        className="relative flex items-center select-none touch-none w-full h-10"
                        defaultValue={[0]}
                        value={[currentTime]}
                        max={duration}
                        step={0.1}
                        aria-label="Volume"
                        onValueChange={(val) => {
                            if (audioRef.current) {
                                audioRef.current.currentTime = val[0];
                            }
                        }}
                    >
                        <Slider.Track className="bg-neutral-600 relative grow rounded-full h-[3px]">
                            <Slider.Range className="absolute bg-white rounded-full h-full" />
                        </Slider.Track>
                    </Slider.Root>
                    <span className="text-xs text-neutral-400">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume */}
            <div className="flex w-1/3 justify-end items-center gap-x-2">
                <Volume2 size={20} className="text-neutral-400" />
                <Slider.Root
                    className="relative flex items-center select-none touch-none w-[100px] h-10"
                    defaultValue={[1]}
                    value={[player.volume]}
                    max={1}
                    step={0.1}
                    aria-label="Volume"
                    onValueChange={(val) => player.setVolume(val[0])}
                >
                    <Slider.Track className="bg-neutral-600 relative grow rounded-full h-[3px]">
                        <Slider.Range className="absolute bg-white rounded-full h-full" />
                    </Slider.Track>
                </Slider.Root>
                <Maximize2 size={16} className="text-neutral-400 ml-2" />
            </div>
        </div>
    );
};

export default Player;
