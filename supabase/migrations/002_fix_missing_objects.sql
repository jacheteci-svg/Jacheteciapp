-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create sync_admin_profile RPC function
CREATE OR REPLACE FUNCTION sync_admin_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT
) RETURNS JSON AS $$
DECLARE
    v_pixel_exists BOOLEAN;
BEGIN
    -- Upsert the profile
    INSERT INTO profiles (id, email, full_name, role, updated_at)
    VALUES (p_user_id, p_email, p_full_name, 'admin', now())
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    -- Ensure pixel_config entry exists (initialized with empty values if new)
    SELECT EXISTS (SELECT 1 FROM pixel_config LIMIT 1) INTO v_pixel_exists;
    IF NOT v_pixel_exists THEN
        INSERT INTO pixel_config (pixel_id, capi_token, actif, mode_test)
        VALUES ('', '', false, false);
    END IF;

    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions (InsForge specific roles)
GRANT ALL ON TABLE profiles TO anon, authenticated;
GRANT ALL ON TABLE pixel_config TO anon, authenticated;
GRANT EXECUTE ON FUNCTION sync_admin_profile TO anon, authenticated;

-- 4. Enable RLS and add basic policies (Optional but recommended for production)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE pixel_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view pixel config" ON pixel_config FOR SELECT USING (true);
CREATE POLICY "Admin can update pixel config" ON pixel_config FOR UPDATE USING (true);
