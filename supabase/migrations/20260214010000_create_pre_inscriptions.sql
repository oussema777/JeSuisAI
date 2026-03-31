-- Migration: Create pre_inscriptions table for registration management
CREATE TABLE IF NOT EXISTS public.pre_inscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    organisation_type TEXT NOT NULL,
    organisation_name TEXT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    fonction TEXT NOT NULL,
    pays TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    message TEXT,
    statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete', 'archive'))
);

-- RLS Policies
ALTER TABLE public.pre_inscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for the registration form
CREATE POLICY "Enable insert for everyone" ON public.pre_inscriptions
    FOR INSERT WITH CHECK (true);

-- Only Superadmins and Admins can view/manage
CREATE POLICY "Enable select for admins" ON public.pre_inscriptions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('Admin', 'Superadmin')
        )
    );

CREATE POLICY "Enable update for admins" ON public.pre_inscriptions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('Admin', 'Superadmin')
        )
    );
