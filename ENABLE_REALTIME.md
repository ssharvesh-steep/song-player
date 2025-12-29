# Enable Supabase Realtime for Instant Database Sync

## Step 1: Enable Realtime in Supabase

1. Go to **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Replication**
4. Find the **songs** table
5. Toggle **Enable Realtime** to ON ✅
6. Click **Save**

## Step 2: Clear All Songs from Database

Run this in **Supabase SQL Editor**:

```sql
-- Delete all songs
DELETE FROM songs;

-- Verify it's empty
SELECT COUNT(*) FROM songs;
-- Should return: 0
```

## Step 3: Clear Browser Cache

### Option A: Hard Refresh
- **Mac:** `Cmd + Shift + R`
- **Windows:** `Ctrl + Shift + R`

### Option B: Clear Cache Completely
1. Open DevTools: `F12`
2. Right-click the refresh button
3. Select **"Empty Cache and Hard Reload"**

### Option C: Use Incognito/Private Window
- **Chrome:** `Cmd/Ctrl + Shift + N`
- **Firefox:** `Cmd/Ctrl + Shift + P`
- Go to `http://localhost:3000`

## Step 4: Restart Dev Server

In your terminal:
```bash
# Stop the server
Ctrl + C

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

## Step 5: Test Real-Time Sync

1. Open your app: `http://localhost:3000/admin`
2. Open Supabase Dashboard in another tab
3. Go to **Table Editor** → **songs**
4. Upload a song in the app
5. Watch it appear in Supabase instantly ✅
6. Delete it in Supabase
7. Watch it disappear from the app instantly ✅

## Verification Checklist

- [ ] Realtime enabled for songs table in Supabase
- [ ] Database shows 0 songs
- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] App shows 0 songs
- [ ] Upload a song → appears in both app and database
- [ ] Delete in database → disappears from app immediately

## If Still Not Working

Check browser console (F12) for errors:
- Look for "Realtime" or "subscription" errors
- Check Network tab for failed requests
- Verify environment variables are correct

The app already has real-time code implemented - you just need to enable it in Supabase and clear the cache!
