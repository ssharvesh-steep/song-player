# Database Setup Guide

## Step 1: Reset Database Tables

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `lib/schema.sql`
4. Click **Run** to execute the script

This will:
- Drop all existing tables (profiles, songs)
- Recreate them with the correct schema including `is_admin` column
- Set up Row Level Security (RLS) policies
- Create performance indexes

## Step 2: Create Storage Buckets

### Create 'songs' bucket:
1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `songs`
4. Make it **Public** (check the public checkbox)
5. Click **Create bucket**

### Create 'images' bucket:
1. Click **New bucket** again
2. Name: `images`
3. Make it **Public** (check the public checkbox)
4. Click **Create bucket**

## Step 3: Set Storage Policies (Optional - if buckets aren't public)

If you didn't make the buckets public, run these SQL scripts:

### For songs bucket:
1. Go to **SQL Editor**
2. Copy and paste contents of `lib/storage-policies-songs.sql`
3. Click **Run**

### For images bucket:
1. Copy and paste contents of `lib/storage-policies-images.sql`
2. Click **Run**

## Step 4: Create Your Admin User

1. **Register a new account** in your app at `/register`
2. After registration, go to Supabase **SQL Editor**
3. Run this query (replace with your email):

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

4. Refresh your app and you should see the **Admin Panel** link in the sidebar

## Step 5: Verify Setup

1. **Login** to your app
2. Check if **Admin Panel** link appears in sidebar
3. Navigate to `/admin`
4. Try uploading a song with an image
5. Verify the song appears on the home page

## Troubleshooting

### "Bucket not found" error
- Make sure both `songs` and `images` buckets exist in Storage
- Make sure they are set to **Public**

### "Permission denied" on upload
- Verify you're logged in
- Verify your user has `is_admin = true` in the profiles table
- Check RLS policies are correctly set

### "Profile doesn't exist" error
- The profile should be created automatically on registration
- If not, manually create it:
```sql
INSERT INTO profiles (id, email, username, is_admin)
VALUES (
  'your-user-id-from-auth-users',
  'your-email@example.com',
  'your-username',
  true
);
```

### Check if tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check if is_admin column exists
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```
