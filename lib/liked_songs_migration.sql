-- Create liked_songs table
CREATE TABLE liked_songs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, song_id)
);

-- Enable RLS
ALTER TABLE liked_songs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own likes" ON liked_songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON liked_songs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own likes" ON liked_songs
  FOR SELECT USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_liked_songs_user_id ON liked_songs(user_id);
CREATE INDEX idx_liked_songs_song_id ON liked_songs(song_id);
