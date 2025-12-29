"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import usePlayer from "@/hooks/usePlayer";
import { Play, Download as DownloadIcon, Check, Search, Disc, ListMusic, Music } from "lucide-react";
import { downloadSong, isSongDownloaded } from "@/lib/downloads";
import { useAuth } from "@/components/auth/AuthContext";

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
  const { user } = useAuth();
  // const [user, setUser] = useState<any>(null); // Use useAuth instead

  useEffect(() => {
    // supabase.auth.getUser().then(({ data: { user } }) => setUser(user)); // Handled by useAuth
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
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const loadedSongs = data.map(song => {
        const imagePublicUrl = song.image_url.startsWith('http')
          ? song.image_url
          : supabase.storage.from('images').getPublicUrl(song.image_url).data.publicUrl;

        const audioPublicUrl = song.audio_url.startsWith('http')
          ? song.audio_url
          : supabase.storage.from('songs').getPublicUrl(song.audio_url).data.publicUrl;

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
    <div className="h-full w-full overflow-hidden overflow-y-auto bg-gray-50/50">
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {/* Search Icon pushed to side, maybe Search Bar? */}
            <h1 className="text-2xl font-bold text-neutral-800">
              Discover
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden border-2 border-white shadow-sm">
              {/* User Avatar Placeholder */}
              {user?.email ? (
                <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold">
                  {user.email[0].toUpperCase()}
                </div>
              ) : (
                <div className="w-full h-full bg-neutral-300"></div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Visual Only for now or link to search page */}
        <div className="relative mb-8 shadow-sm">
          <input
            type="text"
            placeholder="Search artists, songs..."
            className="w-full h-12 rounded-xl pl-12 pr-4 bg-white text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-medium"
            readOnly
            onClick={() => window.location.href = "/search"}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
        </div>


        {/* Categories */}
        {/* <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${i === 0
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div> */}

        {/* Featured / New Releases Banner Style */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-800">New Releases</h2>
          <button className="text-sm font-medium text-neutral-400 hover:text-orange-500">View All</button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {/* Mock Data for featured cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[140px] md:min-w-[180px] space-y-3 cursor-pointer group">
              <div className="aspect-square rounded-2xl bg-neutral-200 overflow-hidden relative shadow-md">
                {/* Placeholder Image */}
                <div className={`w-full h-full bg-gradient-to-br ${i === 1 ? 'from-orange-400 to-pink-500' : i === 2 ? 'from-blue-400 to-purple-500' : 'from-green-400 to-teal-500'}`}></div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                    <Play size={20} className="fill-white text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 truncate">Song Title {i}</h3>
                <p className="text-xs text-neutral-500 truncate">Artist Name</p>
              </div>
            </div>
          ))}
        </div>

        {/* Playlists / Quick Access */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-800 mb-4">For You</h2>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/30 cursor-pointer hover:scale-[1.02] transition">
            <div className="relative z-10">
              <p className="text-indigo-100 text-sm font-medium mb-1">Weekly Music</p>
              <h3 className="text-2xl font-bold mb-4">Your Weekly Mix</h3>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/10"></div>)}
                </div>
                <span className="text-xs text-indigo-100">+ 40 Tracks</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Popular List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">Popular Songs</h2>
          <button className="text-sm font-medium text-neutral-400 hover:text-orange-500 transition">Show all</button>
        </div>

        {loading ? (
          <div className="text-neutral-400 flex justify-center py-10">Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {songs.map((song) => (
              <div
                key={song.id}
                onClick={() => player.setSong(song)}
                className="group flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-orange-50 transition cursor-pointer shadow-sm border border-neutral-100 hover:border-orange-100"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm bg-neutral-100">
                    <img
                      className="object-cover w-full h-full group-hover:scale-110 transition duration-500"
                      src={song.image_url}
                      alt="Cover"
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 truncate">{song.title}</p>
                    <p className="text-neutral-500 text-xs font-medium">{song.artist}</p>
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
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition border border-transparent ${downloadedSongs.has(song.id)
                      ? 'text-orange-500 bg-orange-100'
                      : 'text-neutral-400 hover:text-orange-500 hover:bg-orange-50'
                      }`}
                  >
                    {downloading === song.id ? (
                      <div className="animate-spin text-orange-500 text-xs">⏳</div>
                    ) : downloadedSongs.has(song.id) ? (
                      <Check size={16} />
                    ) : (
                      <DownloadIcon size={16} />
                    )}
                  </button>

                  <button className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-orange-500 hover:bg-orange-50 transition">
                    <Play size={16} className="ml-0.5 fill-current" />
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
