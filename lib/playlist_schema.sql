-- Create playlists table if it doesn't exist
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT, 
  description TEXT
);

-- Check and add columns if they are missing (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'playlists' AND column_name = 'image_url') THEN
        ALTER TABLE playlists ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'playlists' AND column_name = 'description') THEN
        ALTER TABLE playlists ADD COLUMN description TEXT;
    END IF;
END $$;

-- Create playlist_songs table if it doesn't exist
CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (playlist_id, song_id)
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts before recreating them
DROP POLICY IF EXISTS "Users can insert their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can view their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can insert songs to their playlists" ON playlist_songs;
DROP POLICY IF EXISTS "Users can delete songs from their playlists" ON playlist_songs;
DROP POLICY IF EXISTS "Users can view songs in their playlists" ON playlist_songs;

-- Re-create Policies for Playlists
CREATE POLICY "Users can insert their own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id);

-- Re-create Policies for Playlist Songs
CREATE POLICY "Users can insert songs to their playlists" ON playlist_songs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE id = playlist_songs.playlist_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete songs from their playlists" ON playlist_songs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE id = playlist_songs.playlist_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view songs in their playlists" ON playlist_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE id = playlist_songs.playlist_id 
      AND user_id = auth.uid()
    )
  );
