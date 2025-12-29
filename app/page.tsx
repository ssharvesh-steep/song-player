"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import usePlayer from "@/hooks/usePlayer";
import { Play, Download as DownloadIcon, Check, Search } from "lucide-react";
import { downloadSong, isSongDownloaded } from "@/lib/downloads";

interface Song {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  audio_url: string;
  user_id: string;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadedSongs, setDownloadedSongs] = useState<Set<string>>(new Set());
  const player = usePlayer();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    fetchSongs();

    const channel = supabase
      .channel('songs-home-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'songs' },
        (payload) => fetchSongs()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchSongs = async () => {
    // ... existing fetch logic ...
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const loadedSongs = data.map(song => {
        const imagePublicUrl = supabase.storage.from('images').getPublicUrl(song.image_url).data.publicUrl;
        const audioPublicUrl = supabase.storage.from('songs').getPublicUrl(song.audio_url).data.publicUrl;
        return { ...song, image_url: imagePublicUrl, audio_url: audioPublicUrl };
      });
      setSongs(loadedSongs);

      const downloaded = new Set<string>();
      for (const song of loadedSongs) {
        if (await isSongDownloaded(song.id)) {
          downloaded.add(song.id);
        }
      }
      setDownloadedSongs(downloaded);
    }
    setLoading(false);
  };

  const handleDownload = async (song: Song) => {
    // ... existing download logic ...
    try {
      setDownloading(song.id);
      await downloadSong(song);
      setDownloadedSongs(prev => new Set(prev).add(song.id));
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download song');
    } finally {
      setDownloading(null);
    }
  };

  const categories = ["All", "New Artists", "Hot Tracks", "Editor's Picks"];

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Hello, {user?.email?.split('@')[0] || 'Guest'}
            </h1>
            <p className="text-neutral-400 text-sm">Welcome back!</p>
          </div>
          <div className="flex gap-3">
            <button className="p-2 rounded-full glass hover:bg-white/10 transition">
              <Search size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${i === 0
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'glass text-neutral-300 hover:bg-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Banner */}
        <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-8 group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-pink-600 opacity-90 transition group-hover:scale-105 duration-700"></div>
          <div className="absolute inset-0 p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-2">Feel the Beat</h2>
            <p className="text-purple-100 text-sm max-w-xs mb-4">Explore trending tracks and hidden gems curated just for you.</p>
            <button className="w-fit px-6 py-2 bg-white text-purple-900 rounded-full font-bold text-sm hover:scale-105 transition shadow-lg">
              Start Listening
            </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute right-20 top-10 w-20 h-20 bg-purple-400 rounded-full blur-2xl opacity-30"></div>
        </div>

        {/* Popular Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Popular</h2>
          <button className="text-sm text-neutral-400 hover:text-white transition">Show all</button>
        </div>

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {songs.map((song) => (
              <div
                key={song.id}
                onClick={() => player.setSong(song)}
                className="group flex items-center justify-between p-3 rounded-2xl glass hover:bg-white/10 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                    <img
                      className="object-cover w-full h-full group-hover:scale-110 transition duration-500"
                      src={song.image_url}
                      alt="Cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white truncate">{song.title}</p>
                    <p className="text-neutral-400 text-xs">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!downloadedSongs.has(song.id)) handleDownload(song);
                    }}
                    disabled={downloading === song.id || downloadedSongs.has(song.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition border border-white/10 ${downloadedSongs.has(song.id)
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {downloading === song.id ? (
                      <div className="animate-spin text-green-500">⏳</div>
                    ) : downloadedSongs.has(song.id) ? (
                      <Check size={16} />
                    ) : (
                      <DownloadIcon size={16} />
                    )}
                  </button>

                  <button className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition border border-white/10">
                    <Play size={16} className="ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
