# Quick Fix for Missing Profile

## Problem
You're getting a "Profile error" because your user account exists in `auth.users` but doesn't have a corresponding entry in the `profiles` table.

## Solution - Run this in Supabase SQL Editor

### Step 1: Check your user ID
```sql
SELECT id, email FROM auth.users WHERE email = 'ssharvesh616@gmail.com';
```
Copy the `id` value from the result.

### Step 2: Create your profile (Easy Method)
Run this query - it will automatically create profiles for all users who don't have one, and make you an admin:

```sql
INSERT INTO profiles (id, email, username, is_admin)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) as username,
  CASE WHEN email = 'ssharvesh616@gmail.com' THEN true ELSE false END as is_admin
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE 
SET is_admin = true
WHERE profiles.email = 'ssharvesh616@gmail.com';
```

### Step 3: Verify it worked
```sql
SELECT * FROM profiles WHERE email = 'ssharvesh616@gmail.com';
```

You should see:
- Your user ID
- Email: ssharvesh616@gmail.com
- Username: ssharvesh616
- is_admin: true ✅

### Step 4: Refresh your app
1. Go back to your app
2. Refresh the page (Cmd+R / Ctrl+R)
3. The "Admin Panel" link should now appear in the sidebar
4. Click it to access `/admin`

## Done! 🎉
You should now be able to access the admin panel and upload songs.
