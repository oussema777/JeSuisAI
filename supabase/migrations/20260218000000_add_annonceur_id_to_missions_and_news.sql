-- Migration: Add multi-tenancy support via annonceur_id
-- Date: 2026-02-18

-- 1. Add annonceur_id to opportunites and actualites
ALTER TABLE public.opportunites ADD COLUMN IF NOT EXISTS annonceur_id uuid REFERENCES public.annonceur_profiles(id);
ALTER TABLE public.actualites ADD COLUMN IF NOT EXISTS annonceur_id uuid REFERENCES public.annonceur_profiles(id);

-- 2. Backfill existing data based on creator's profile
UPDATE public.opportunites o
SET annonceur_id = p.annonceur_id
FROM public.profiles p
WHERE o.created_by = p.id AND o.annonceur_id IS NULL;

UPDATE public.actualites a
SET annonceur_id = p.annonceur_id
FROM public.profiles p
WHERE a.created_by = p.id AND a.annonceur_id IS NULL;

-- 3. Update RLS Policies for ActualitÃ©s
DROP POLICY IF EXISTS "Admins can manage news" ON public.actualites;
CREATE POLICY "Admins can manage their city news" ON public.actualites
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'Superadmin' OR (role = 'Admin' AND annonceur_id = public.actualites.annonceur_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'Superadmin' OR (role = 'Admin' AND annonceur_id = public.actualites.annonceur_id))
  )
);

-- 4. Update RLS Policies for OpportunitÃ©s
DROP POLICY IF EXISTS "Owners and Admins can update missions" ON public.opportunites;
CREATE POLICY "Admins can update their city missions" ON public.opportunites
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'Superadmin' OR (role = 'Admin' AND annonceur_id = public.opportunites.annonceur_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'Superadmin' OR (role = 'Admin' AND annonceur_id = public.opportunites.annonceur_id))
  )
);

DROP POLICY IF EXISTS "Owners and Admins can delete missions" ON public.opportunites;
CREATE POLICY "Admins can delete their city missions" ON public.opportunites
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'Superadmin' OR (role = 'Admin' AND annonceur_id = public.opportunites.annonceur_id))
  )
);

-- Add SELECT policy for Admins to see their missions (even unpublished)
DROP POLICY IF EXISTS "Admins can view their city missions" ON public.opportunites;
CREATE POLICY "Admins can view their city missions" ON public.opportunites
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'Superadmin' OR (role = 'Admin' AND annonceur_id = public.opportunites.annonceur_id))
  )
);

-- 5. Update RLS Policies for Candidatures
DROP POLICY IF EXISTS "Organization owners and Admins can update candidatures" ON public.candidatures;
CREATE POLICY "Admins can manage candidatures for their city" ON public.candidatures
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.opportunites o
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE o.id = public.candidatures.opportunite_id
    AND (p.role = 'Superadmin' OR (p.role = 'Admin' AND o.annonceur_id = p.annonceur_id))
  )
);

-- 6. Update Dashboard Stats Function to support multi-tenancy
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json AS $$
DECLARE
  v_user_id uuid;
  v_role text;
  v_annonceur_id uuid;
  actives_count bigint;
  total_cand_count bigint;
  pending_count bigint;
  closed_count bigint;
  result json;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Get user profile info
  SELECT role, annonceur_id INTO v_role, v_annonceur_id 
  FROM public.profiles 
  WHERE id = v_user_id;

  IF v_role = 'Superadmin' THEN
    -- Superadmin sees everything
    SELECT count(*) INTO actives_count FROM public.opportunites WHERE statut_publication = 'publie';
    SELECT count(*) INTO total_cand_count FROM public.candidatures;
    SELECT count(*) INTO pending_count FROM public.candidatures WHERE statut = 'nouvelle';
    SELECT count(*) INTO closed_count FROM public.opportunites WHERE statut_publication = 'brouillon';
  ELSE
    -- Admin sees only their city's data
    SELECT count(*) INTO actives_count 
    FROM public.opportunites 
    WHERE statut_publication = 'publie' AND annonceur_id = v_annonceur_id;

    SELECT count(*) INTO total_cand_count 
    FROM public.candidatures c
    JOIN public.opportunites o ON c.opportunite_id = o.id
    WHERE o.annonceur_id = v_annonceur_id;

    SELECT count(*) INTO pending_count 
    FROM public.candidatures c
    JOIN public.opportunites o ON c.opportunite_id = o.id
    WHERE c.statut = 'nouvelle' AND o.annonceur_id = v_annonceur_id;

    SELECT count(*) INTO closed_count 
    FROM public.opportunites 
    WHERE statut_publication = 'brouillon' AND annonceur_id = v_annonceur_id;
  END IF;

  -- Build the JSON result
  result := json_build_object(
    'actives', actives_count,
    'totalCandidatures', total_cand_count,
    'enAttente', pending_count,
    'cloturees', closed_count
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
