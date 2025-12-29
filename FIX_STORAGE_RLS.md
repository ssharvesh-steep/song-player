# Fix Storage Policies - Add Missing Policies Only

## The "Public Access" policy already exists - that's good!

Now we just need to add the INSERT policy for authenticated users. Run this SQL:

```sql
-- Add INSERT policy for songs bucket (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload songs'
    ) THEN
        CREATE POLICY "Authenticated users can upload songs"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'songs');
    END IF;
END $$;

-- Add INSERT policy for images bucket (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload images'
    ) THEN
        CREATE POLICY "Authenticated users can upload images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'images');
    END IF;
END $$;

-- Add UPDATE policy for songs bucket (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can update songs'
    ) THEN
        CREATE POLICY "Authenticated users can update songs"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'songs');
    END IF;
END $$;

-- Add UPDATE policy for images bucket (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can update images'
    ) THEN
        CREATE POLICY "Authenticated users can update images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'images');
    END IF;
END $$;

-- Add DELETE policy for songs bucket (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can delete songs'
    ) THEN
        CREATE POLICY "Authenticated users can delete songs"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'songs');
    END IF;
END $$;

-- Add DELETE policy for images bucket (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can delete images'
    ) THEN
        CREATE POLICY "Authenticated users can delete images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'images');
    END IF;
END $$;
```

## Verify Policies After Running

Check what policies exist:

```sql
SELECT policyname, cmd, bucket_id 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY bucket_id, cmd;
```

You should see policies for:
- ✅ songs: SELECT, INSERT, UPDATE, DELETE
- ✅ images: SELECT, INSERT, UPDATE, DELETE

## Then Try Uploading Again!

After running the SQL above, refresh your app and try uploading a song. It should work now! 🎉
