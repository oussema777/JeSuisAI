-- 1. Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    email TEXT NOT NULL UNIQUE,
    whatsapp TEXT,
    ville TEXT,
    domaine TEXT,
    type_contribution TEXT
);

-- 2. Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone can subscribe (Insert)
CREATE POLICY "Enable insert for everyone" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- 4. Policy: Only Superadmins can view/manage subscribers
CREATE POLICY "Enable select for admins" ON public.newsletter_subscriptions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'superadmin'
        )
    );

CREATE POLICY "Enable delete for admins" ON public.newsletter_subscriptions
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'superadmin'
        )
    );
