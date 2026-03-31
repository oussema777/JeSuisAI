-- Migration: Fix RLS policies for annonceur_profiles
-- This fix allows Admins, Superadmins, and linked Annonceurs to manage the advertiser profiles.
-- The previous policy incorrectly assumed annonceur_profiles.id was the same as auth.uid().

-- 1. Anyone can view advertiser profiles (public information)
DROP POLICY IF EXISTS "Anyone can view advertiser profiles" ON public.annonceur_profiles;
CREATE POLICY "Anyone can view advertiser profiles" 
ON public.annonceur_profiles FOR SELECT 
USING (true);

-- 2. Allow insertion by Admins, Superadmins, and Annonceurs who don't have a profile yet
DROP POLICY IF EXISTS "Admins and Superadmins can create advertiser profiles" ON public.annonceur_profiles;
DROP POLICY IF EXISTS "Authenticated users can create annonceur profiles" ON public.annonceur_profiles;
CREATE POLICY "Authorized users can create advertiser profiles"
ON public.annonceur_profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('Admin', 'Superadmin', 'Annonceur')
  )
);

-- 3. Allow update by Admins, Superadmins, or the linked Annonceur
DROP POLICY IF EXISTS "Users can manage their own advertiser profile" ON public.annonceur_profiles;
DROP POLICY IF EXISTS "Admins and Superadmins can update advertiser profiles" ON public.annonceur_profiles;
CREATE POLICY "Authorized users can update advertiser profiles"
ON public.annonceur_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (
      role IN ('Admin', 'Superadmin') 
      OR (role = 'Annonceur' AND annonceur_id = public.annonceur_profiles.id)
    )
  )
);

-- 4. Allow delete only by Superadmins
DROP POLICY IF EXISTS "Admins and Superadmins can delete advertiser profiles" ON public.annonceur_profiles;
CREATE POLICY "Only Superadmins can delete advertiser profiles"
ON public.annonceur_profiles FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Superadmin')
);
