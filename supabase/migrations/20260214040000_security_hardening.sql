-- 1. SAFER FIX: Function Search Path Security
-- This script checks if the function exists before attempting to alter it.

DO $$ 
BEGIN
    -- notify_new_contribution
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_new_contribution') THEN
        ALTER FUNCTION public.notify_new_contribution() SET search_path = public;
    END IF;

    -- update_updated_at_column
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
    END IF;

    -- get_dashboard_stats
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_dashboard_stats') THEN
        ALTER FUNCTION public.get_dashboard_stats() SET search_path = public;
    END IF;

    -- mark_notification_read
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_notification_read') THEN
        ALTER FUNCTION public.mark_notification_read(p_notification_id uuid) SET search_path = public;
    END IF;

    -- mark_all_notifications_read
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_all_notifications_read') THEN
        ALTER FUNCTION public.mark_all_notifications_read() SET search_path = public;
    END IF;

    -- get_unread_notification_count
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_unread_notification_count') THEN
        ALTER FUNCTION public.get_unread_notification_count() SET search_path = public;
    END IF;

    -- notify_candidature_submission
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_candidature_submission') THEN
        ALTER FUNCTION public.notify_candidature_submission() SET search_path = public;
    END IF;

    -- notify_candidature_status_change
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_candidature_status_change') THEN
        ALTER FUNCTION public.notify_candidature_status_change() SET search_path = public;
    END IF;

    -- handle_new_user
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    END IF;

    -- create_opportunites_table_if_not_exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_opportunites_table_if_not_exists') THEN
        ALTER FUNCTION public.create_opportunites_table_if_not_exists() SET search_path = public;
    END IF;

    -- check_pending_candidatures_reminders
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_pending_candidatures_reminders') THEN
        ALTER FUNCTION public.check_pending_candidatures_reminders() SET search_path = public;
    END IF;

    -- Note: is_superadmin and can_user_see_projet are excluded here to avoid signature mismatches
    -- Users should check their Dashboard > Database > Functions for the exact signature if warnings persist.
END $$;

-- 2. FIX: Permissive RLS Policies (Hardening) - These are safe to run

-- Hardening Actualités
DROP POLICY IF EXISTS "allow_all_operations" ON public.actualites;
CREATE POLICY "Everyone can view news" ON public.actualites FOR SELECT USING (true);
CREATE POLICY "Admins can manage news" ON public.actualites 
FOR ALL TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Superadmin'))
);

-- Hardening Opportunités
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.opportunites;
CREATE POLICY "Owners and Admins can update missions" ON public.opportunites
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Superadmin'))
);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.opportunites;
CREATE POLICY "Owners and Admins can delete missions" ON public.opportunites
FOR DELETE TO authenticated
USING (
  created_by = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Superadmin'))
);

-- Hardening Candidatures
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.candidatures;
CREATE POLICY "Organization owners and Admins can update candidatures" ON public.candidatures
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.opportunites 
    WHERE id = public.candidatures.opportunite_id 
    AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Superadmin')))
  )
);

-- Hardening Annonceur Profiles
DROP POLICY IF EXISTS "Authenticated users can create annonceur profiles" ON public.annonceur_profiles;
CREATE POLICY "Users can manage their own advertiser profile" ON public.annonceur_profiles
FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
