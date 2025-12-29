"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
    songId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
    const router = useRouter();
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const fetchData = async () => {
            const { data, error } = await supabase
                .from("liked_songs")
                .select("*")
                .eq("user_id", user.id)
                .eq("song_id", songId)
                .single();

            if (!error && data) {
                setIsLiked(true);
            }
        };

        fetchData();
    }, [songId, user?.id]);

    const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent row click

        if (!user) {
            router.push("/login");
            return;
        }

        if (isLiked) {
            const { error } = await supabase
                .from("liked_songs")
                .delete()
                .eq("user_id", user.id)
                .eq("song_id", songId);

            if (error) {
                console.error(error);
            } else {
                setIsLiked(false);
            }
        } else {
            const { error } = await supabase
                .from("liked_songs")
                .insert({
                    song_id: songId,
                    user_id: user.id
                });

            if (error) {
                console.error(error);
            } else {
                setIsLiked(true);
            }
        }

        router.refresh();
    };

    return (
        <button
            onClick={handleLike}
            className="hover:opacity-75 transition"
        >
            <Heart
                size={25}
                color={isLiked ? "#22c55e" : "white"}
                fill={isLiked ? "#22c55e" : "none"}
            />
        </button>
    );
};

export default LikeButton;
