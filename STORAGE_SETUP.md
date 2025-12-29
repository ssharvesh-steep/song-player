# Quick Setup Guide - Create Storage Buckets

## Error: "Bucket not found"

This error occurs because the Supabase storage buckets don't exist yet. Follow these steps to fix it:

## Step 1: Create Storage Buckets in Supabase

### Create 'songs' bucket:
1. Open your **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **New bucket**
5. Enter name: `songs`
6. ✅ Check **Public bucket** (important!)
7. Click **Create bucket**

### Create 'images' bucket:
1. Click **New bucket** again
2. Enter name: `images`
3. ✅ Check **Public bucket** (important!)
4. Click **Create bucket**

## Step 2: Verify Buckets

You should now see two buckets in your Storage:
- ✅ songs (public)
- ✅ images (public)

## Step 3: Try Uploading Again

1. Go back to your app at http://localhost:3000
2. Navigate to Admin Panel
3. Select a song file
4. Click Upload
5. It should work now! ✨

---

## Alternative: Create Buckets via SQL (Advanced)

If you prefer SQL, you can also create buckets using the Supabase SQL Editor:

```sql
-- Create songs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('songs', 'songs', true);

-- Create images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```

---

## Troubleshooting

### Still getting "Bucket not found"?
- Make sure the bucket names are exactly `songs` and `images` (lowercase)
- Verify both buckets are marked as **Public**
- Refresh your app page

### Permission denied?
- Ensure you're logged in as an admin user
- Check that `is_admin = true` in your profiles table
- See `QUICK_FIX.md` for admin setup instructions
