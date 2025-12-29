-- Quick fix: Create profile for existing user
-- Run this in Supabase SQL Editor

-- First, check if your user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'ssharvesh616@gmail.com';

-- Then create the profile (replace 'USER_ID_FROM_ABOVE' with the actual ID)
-- If you see your user ID from the query above, use it in the INSERT below

-- Option 1: If you know your user ID
INSERT INTO profiles (id, email, username, is_admin)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID from auth.users
  'ssharvesh616@gmail.com',
  'sharvesh',
  true
)
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, 
    email = 'ssharvesh616@gmail.com',
    username = 'sharvesh';

-- Option 2: Automatic - creates profile for all users without one
INSERT INTO profiles (id, email, username, is_admin)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) as username,
  CASE WHEN email = 'ssharvesh616@gmail.com' THEN true ELSE false END as is_admin
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE 
SET is_admin = CASE WHEN profiles.id IN (
  SELECT id FROM auth.users WHERE email = 'ssharvesh616@gmail.com'
) THEN true ELSE profiles.is_admin END;

-- Verify the profile was created
SELECT * FROM profiles WHERE email = 'ssharvesh616@gmail.com';
