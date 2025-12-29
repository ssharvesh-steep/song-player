# Clear All Songs from Database

## ⚠️ WARNING: This will delete ALL songs permanently!

Run this SQL in **Supabase SQL Editor** to clear all songs:

```sql
-- Delete all songs from the database
DELETE FROM songs;

-- Optional: Clear all files from storage buckets
-- Note: This requires running in the Supabase dashboard Storage section
-- Go to Storage → songs bucket → Select all → Delete
-- Go to Storage → images bucket → Select all → Delete
```

## Alternative: Clear Storage via SQL (Advanced)

If you want to clear storage files via SQL as well:

```sql
-- Delete all songs from database
DELETE FROM songs;

-- Note: Storage files need to be deleted manually from the Supabase Dashboard
-- Or you can use the Supabase Storage API
```

## How to Clear Everything:

### Method 1: SQL Only (Database)
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run: `DELETE FROM songs;`
3. This removes all database records

### Method 2: Complete Cleanup (Database + Storage)
1. **Clear Database:**
   - Go to **SQL Editor**
   - Run: `DELETE FROM songs;`

2. **Clear Storage:**
   - Go to **Storage** → **songs** bucket
   - Select all files → Click **Delete**
   - Go to **images** bucket
   - Select all files → Click **Delete**

## Quick SQL Command

Just run this in Supabase SQL Editor:

```sql
DELETE FROM songs;
```

✅ Done! All songs are removed from the database.

---

## Verify It Worked

Check if songs table is empty:

```sql
SELECT COUNT(*) FROM songs;
```

Should return: `0`
