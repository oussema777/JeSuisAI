-- Migration: Refine isolation logic for Admins without assigned cities
-- Date: 2026-02-18

-- 1. Update RLS Policies for OpportunitÃ©s
DROP POLICY IF EXISTS "Admins can view their city missions" ON public.opportunites;
CREATE POLICY "Admins can view missions" ON public.opportunites
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role = 'Superadmin' 
      OR (p.role = 'Admin' AND (
        (p.annonceur_id IS NOT NULL AND p.annonceur_id = public.opportunites.annonceur_id)
        OR (p.annonceur_id IS NULL AND public.opportunites.created_by = auth.uid())
      ))
      OR (p.role = 'Annonceur' AND public.opportunites.created_by = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Admins can update their city missions" ON public.opportunites;
CREATE POLICY "Admins can update missions" ON public.opportunites
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role = 'Superadmin' 
      OR (p.role = 'Admin' AND (
        (p.annonceur_id IS NOT NULL AND p.annonceur_id = public.opportunites.annonceur_id)
        OR (p.annonceur_id IS NULL AND public.opportunites.created_by = auth.uid())
      ))
      OR (p.role = 'Annonceur' AND public.opportunites.created_by = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Admins can delete their city missions" ON public.opportunites;
CREATE POLICY "Admins can delete missions" ON public.opportunites
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role = 'Superadmin' 
      OR (p.role = 'Admin' AND (
        (p.annonceur_id IS NOT NULL AND p.annonceur_id = public.opportunites.annonceur_id)
        OR (p.annonceur_id IS NULL AND public.opportunites.created_by = auth.uid())
      ))
      OR (p.role = 'Annonceur' AND public.opportunites.created_by = auth.uid())
    )
  )
);

-- 2. Update RLS Policies for ActualitÃ©s
DROP POLICY IF EXISTS "Admins can manage their city news" ON public.actualites;
CREATE POLICY "Admins can manage news" ON public.actualites
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND (
      p.role = 'Superadmin' 
      OR (p.role = 'Admin' AND (
        (p.annonceur_id IS NOT NULL AND p.annonceur_id = public.actualites.annonceur_id)
        OR (p.annonceur_id IS NULL AND public.actualites.created_by = auth.uid())
      ))
      OR (p.role = 'Annonceur' AND public.actualites.created_by = auth.uid())
    )
  )
);

-- 3. Update RLS Policies for Candidatures
DROP POLICY IF EXISTS "Admins can manage candidatures for their city" ON public.candidatures;
CREATE POLICY "Admins can manage candidatures" ON public.candidatures
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.opportunites o
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE o.id = public.candidatures.opportunite_id
    AND (
      p.role = 'Superadmin' 
      OR (p.role = 'Admin' AND (
        (p.annonceur_id IS NOT NULL AND p.annonceur_id = o.annonceur_id)
        OR (p.annonceur_id IS NULL AND o.created_by = auth.uid())
      ))
      OR (p.role = 'Annonceur' AND o.created_by = auth.uid())
    )
  )
);

-- 4. Update get_dashboard_stats function
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
  v_user_id := auth.uid();
  SELECT role, annonceur_id INTO v_role, v_annonceur_id FROM public.profiles WHERE id = v_user_id;

  IF v_role = 'Superadmin' THEN
    SELECT count(*) INTO actives_count FROM public.opportunites WHERE statut_publication = 'publie';
    SELECT count(*) INTO total_cand_count FROM public.candidatures;
    SELECT count(*) INTO pending_count FROM public.candidatures WHERE statut = 'nouvelle';
    SELECT count(*) INTO closed_count FROM public.opportunites WHERE statut_publication = 'brouillon';
  ELSE
    -- Shared city space OR individual space
    SELECT count(*) INTO actives_count 
    FROM public.opportunites 
    WHERE statut_publication = 'publie' 
    AND (
      (v_annonceur_id IS NOT NULL AND annonceur_id = v_annonceur_id)
      OR (v_annonceur_id IS NULL AND created_by = v_user_id)
    );

    SELECT count(*) INTO total_cand_count 
    FROM public.candidatures c
    JOIN public.opportunites o ON c.opportunite_id = o.id
    WHERE (
      (v_annonceur_id IS NOT NULL AND o.annonceur_id = v_annonceur_id)
      OR (v_annonceur_id IS NULL AND o.created_by = v_user_id)
    );

    SELECT count(*) INTO pending_count 
    FROM public.candidatures c
    JOIN public.opportunites o ON c.opportunite_id = o.id
    WHERE c.statut = 'nouvelle' AND (
      (v_annonceur_id IS NOT NULL AND o.annonceur_id = v_annonceur_id)
      OR (v_annonceur_id IS NULL AND o.created_by = v_user_id)
    );

    SELECT count(*) INTO closed_count 
    FROM public.opportunites 
    WHERE statut_publication = 'brouillon' AND (
      (v_annonceur_id IS NOT NULL AND annonceur_id = v_annonceur_id)
      OR (v_annonceur_id IS NULL AND created_by = v_user_id)
    );
  END IF;

  result := json_build_object(
    'actives', actives_count,
    'totalCandidatures', total_cand_count,
    'enAttente', pending_count,
    'cloturees', closed_count
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
