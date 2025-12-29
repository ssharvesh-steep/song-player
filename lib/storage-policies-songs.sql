-- Storage bucket policies for 'songs' bucket
-- Run this in Supabase SQL Editor after creating the 'songs' bucket

-- Allow public read access to songs
CREATE POLICY "Public Read Songs Storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'songs');

-- Allow authenticated users to upload songs
CREATE POLICY "Authenticated Upload Songs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'songs' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to delete songs
CREATE POLICY "Admin Delete Songs Storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'songs'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);
