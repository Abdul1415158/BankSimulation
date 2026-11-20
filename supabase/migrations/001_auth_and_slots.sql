-- ============================================================
-- BANKVERSE Database Migration 001: Auth and Bank Slots
-- ============================================================

-- User profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.user_profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Bank Slots (exactly 3 per user)
CREATE TABLE IF NOT EXISTS public.bank_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slot_number SMALLINT NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
    bank_id UUID,  -- Will reference banks table, added later
    is_occupied BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, slot_number)
);

ALTER TABLE public.bank_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own slots"
    ON public.bank_slots FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own slots"
    ON public.bank_slots FOR UPDATE
    USING (user_id = auth.uid());

-- Auto-create 3 slots when a user profile is created
CREATE OR REPLACE FUNCTION public.create_bank_slots_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.bank_slots (user_id, slot_number, is_occupied)
    VALUES
        (NEW.id, 1, false),
        (NEW.id, 2, false),
        (NEW.id, 3, false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_bank_slots_for_user();

-- Auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
