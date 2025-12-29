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
    }, [player.isPlaying, songUrl]);

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
        // ... (Logic remains same, just ensuring correct fetching)
        const { data: allSongs } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!allSongs || allSongs.length === 0) {
            player.reset();
            return;
        }

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
    };

    const onPlayNext = async () => {
        if (!player.activeSong) return;
        const { data: allSongs } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
        if (!allSongs || allSongs.length === 0) return;
        const currentIndex = allSongs.findIndex((s: any) => s.id === player.activeSong?.id);
        const nextIndex = (currentIndex + 1) % allSongs.length;
        const nextSong = allSongs[nextIndex];
        const imagePublicUrl = nextSong.image_url.startsWith('http') ? nextSong.image_url : supabase.storage.from('images').getPublicUrl(nextSong.image_url).data.publicUrl;
        const audioPublicUrl = nextSong.audio_url.startsWith('http') ? nextSong.audio_url : supabase.storage.from('songs').getPublicUrl(nextSong.audio_url).data.publicUrl;
        player.setSong({ ...nextSong, image_url: imagePublicUrl, audio_url: audioPublicUrl });
    }

    const onPlayPrevious = async () => {
        if (!player.activeSong) return;
        const { data: allSongs } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
        if (!allSongs || allSongs.length === 0) return;
        const currentIndex = allSongs.findIndex((s: any) => s.id === player.activeSong?.id);
        const prevIndex = currentIndex === 0 ? allSongs.length - 1 : currentIndex - 1;
        const prevSong = allSongs[prevIndex];
        const imagePublicUrl = prevSong.image_url.startsWith('http') ? prevSong.image_url : supabase.storage.from('images').getPublicUrl(prevSong.image_url).data.publicUrl;
        const audioPublicUrl = prevSong.audio_url.startsWith('http') ? prevSong.audio_url : supabase.storage.from('songs').getPublicUrl(prevSong.audio_url).data.publicUrl;
        player.setSong({ ...prevSong, image_url: imagePublicUrl, audio_url: audioPublicUrl });
    }

    if (!player.activeSong) return null;

    return (
        <div className="flex justify-between items-center h-full w-full bg-white/95 backdrop-blur-xl border-t border-neutral-100 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <audio
                ref={audioRef}
                src={songUrl || player.activeSong.audio_url}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={handleSongEnd}
            />

            {/* Song Info */}
            <div className="flex w-1/3 justify-start items-center gap-x-4">
                <div className="relative h-14 w-14 bg-neutral-100 rounded-lg overflow-hidden shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="object-cover w-full h-full"
                        src={player.activeSong.image_url}
                        alt="Cover"
                    />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-neutral-800 truncate font-bold">{player.activeSong.title}</p>
                    <p className="text-neutral-500 text-sm truncate">{player.activeSong.artist}</p>
                </div>
                {/* Like Button needs Light Mode upgrade too, handled separately or inherent */}
                <LikeButton songId={player.activeSong.id} />
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center w-1/3 gap-y-2">
                <div className="flex items-center gap-x-6">
                    <SkipBack
                        onClick={onPlayPrevious}
                        size={24}
                        className="text-neutral-400 hover:text-orange-500 cursor-pointer transition"
                    />
                    <div
                        onClick={handlePlay}
                        className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-500 shadow-lg shadow-orange-500/30 cursor-pointer hover:scale-105 transition"
                    >
                        <Icon size={24} className="text-white fill-white ml-0.5" />
                    </div>
                    <SkipForward
                        onClick={onPlayNext}
                        size={24}
                        className="text-neutral-400 hover:text-orange-500 cursor-pointer transition"
                    />
                </div>
                <div className="hidden md:flex w-full items-center gap-x-2">
                    <span className="text-xs text-neutral-400 font-medium">{formatTime(currentTime)}</span>
                    <Slider.Root
                        className="relative flex items-center select-none touch-none w-full h-10 group"
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
                        <Slider.Track className="bg-neutral-200 relative grow rounded-full h-[4px]">
                            <Slider.Range className="absolute bg-orange-500 rounded-full h-full group-hover:bg-orange-600" />
                        </Slider.Track>
                        <Slider.Thumb className="block w-2 h-2 bg-orange-500 rounded-[10px] opacity-0 group-hover:opacity-100 transition shadow-md" />
                    </Slider.Root>
                    <span className="text-xs text-neutral-400 font-medium">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume */}
            <div className="flex w-1/3 justify-end items-center gap-x-2">
                <Volume2 size={20} className="text-neutral-400" />
                <Slider.Root
                    className="relative flex items-center select-none touch-none w-[100px] h-10 group"
                    defaultValue={[1]}
                    value={[player.volume]}
                    max={1}
                    step={0.1}
                    aria-label="Volume"
                    onValueChange={(val) => player.setVolume(val[0])}
                >
                    <Slider.Track className="bg-neutral-200 relative grow rounded-full h-[4px]">
                        <Slider.Range className="absolute bg-orange-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-3 h-3 bg-white border border-neutral-200 shadow-sm rounded-[10px] opacity-0 group-hover:opacity-100 transition" />
                </Slider.Root>
                {/* <Maximize2 size={16} className="text-neutral-400 ml-2" /> */}
            </div>
        </div>
    );
};

export default Player;
