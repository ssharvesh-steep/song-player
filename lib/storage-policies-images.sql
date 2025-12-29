-- Storage bucket policies for 'images' bucket
-- Run this in Supabase SQL Editor after creating the 'images' bucket

-- Allow public read access to images
CREATE POLICY "Public Read Images Storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Upload Images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to delete images
CREATE POLICY "Admin Delete Images Storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);
