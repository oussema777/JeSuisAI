# 🛠️ Database Migration Required

The registration system requires a new table in Supabase. Please follow these steps:

1. Log in to your **Supabase Dashboard**.
2. Go to the **SQL Editor** (left sidebar).
3. Click **New Query**.
4. Paste the SQL code below and click **Run**.

## SQL Script

```sql
-- 1. Create the pre_inscriptions table
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

-- 2. Enable Row Level Security
ALTER TABLE public.pre_inscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Allow anyone to register (Insert)
-- This is needed for the login/register page where users aren't logged in yet
CREATE POLICY "Enable insert for everyone" ON public.pre_inscriptions
    FOR INSERT WITH CHECK (true);

-- 4. Create Policy: Only Admins/Superadmins can view the entries
CREATE POLICY "Enable select for admins" ON public.pre_inscriptions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('Admin', 'Superadmin')
        )
    );

-- 5. Create Policy: Only Admins/Superadmins can update the entries (status)
CREATE POLICY "Enable update for admins" ON public.pre_inscriptions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('Admin', 'Superadmin')
        )
    );

-- 6. Add emails_rappel column to opportunites
ALTER TABLE public.opportunites 
ADD COLUMN IF NOT EXISTS emails_rappel TEXT;

-- 7. Secure opportunite_contacts (RLS)
ALTER TABLE public.opportunite_contacts ENABLE ROW LEVEL SECURITY;

-- Allow public viewing
DROP POLICY IF EXISTS "Contacts are viewable by everyone" ON public.opportunite_contacts;
CREATE POLICY "Contacts are viewable by everyone" 
ON public.opportunite_contacts FOR SELECT USING (true);

-- Allow creators to manage their own mission contacts
DROP POLICY IF EXISTS "Creators can manage their own mission contacts" ON public.opportunite_contacts;
CREATE POLICY "Creators can manage their own mission contacts" 
ON public.opportunite_contacts FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.opportunites 
    WHERE id = public.opportunite_contacts.opportunite_id 
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.opportunites 
    WHERE id = public.opportunite_contacts.opportunite_id 
    AND created_by = auth.uid()
  )
);

-- Allow Superadmins to manage all contacts
DROP POLICY IF EXISTS "Superadmins can manage all contacts" ON public.opportunite_contacts;
CREATE POLICY "Superadmins can manage all contacts" 
ON public.opportunite_contacts FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND LOWER(role) = 'superadmin'
  )
);

-- 8. Secure static_contents
ALTER TABLE public.static_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Static content is readable by everyone" ON public.static_contents;
CREATE POLICY "Static content is readable by everyone" 
ON public.static_contents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Superadmins can manage static content" ON public.static_contents;
CREATE POLICY "Superadmins can manage static content" 
ON public.static_contents FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND LOWER(role) = 'superadmin'
  )
);

-- 9. Security Hardening (Search Paths & Restrictive Policies)
-- This script is safer and won't crash if functions have different signatures
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_new_contribution') THEN ALTER FUNCTION public.notify_new_contribution() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN ALTER FUNCTION public.update_updated_at_column() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_dashboard_stats') THEN ALTER FUNCTION public.get_dashboard_stats() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_notification_read') THEN ALTER FUNCTION public.mark_notification_read(p_notification_id uuid) SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'mark_all_notifications_read') THEN ALTER FUNCTION public.mark_all_notifications_read() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_unread_notification_count') THEN ALTER FUNCTION public.get_unread_notification_count() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_candidature_submission') THEN ALTER FUNCTION public.notify_candidature_submission() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_candidature_status_change') THEN ALTER FUNCTION public.notify_candidature_status_change() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN ALTER FUNCTION public.handle_new_user() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_opportunites_table_if_not_exists') THEN ALTER FUNCTION public.create_opportunites_table_if_not_exists() SET search_path = public; END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_pending_candidatures_reminders') THEN ALTER FUNCTION public.check_pending_candidatures_reminders() SET search_path = public; END IF;
END $$;

-- Hardening Actualités
DROP POLICY IF EXISTS "allow_all_operations" ON public.actualites;
CREATE POLICY "Everyone can view news" ON public.actualites FOR SELECT USING (true);
CREATE POLICY "Admins can manage news" ON public.actualites FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND LOWER(role) IN ('admin', 'superadmin')));

-- Hardening Opportunités
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.opportunites;
CREATE POLICY "Owners and Admins can update missions" ON public.opportunites FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND LOWER(role) IN ('admin', 'superadmin')));

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.opportunites;
CREATE POLICY "Owners and Admins can delete missions" ON public.opportunites FOR DELETE TO authenticated
USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND LOWER(role) IN ('admin', 'superadmin')));

-- 10. Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    email TEXT NOT NULL UNIQUE,
    whatsapp TEXT,
    ville TEXT,
    domaine TEXT,
    type_contribution TEXT
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone" ON public.newsletter_subscriptions;
CREATE POLICY "Enable insert for everyone" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for admins" ON public.newsletter_subscriptions;
CREATE POLICY "Enable select for admins" ON public.newsletter_subscriptions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND LOWER(role) IN ('admin', 'superadmin')));

```

## 🔄 After running the script
Once the script is executed, all critical security warnings will be resolved, your functions are protected from hijacking, and the **Newsletter** management system will be fully functional.

---

# 🏢 Multi-Tenancy & City Isolation (NEW)

To isolate missions, news, and candidatures by city (for different admin accounts), please run this second script:

## SQL Script (Multi-Tenancy)

```sql
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

-- 3. Update RLS Policies for Actualités
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

-- 4. Update RLS Policies for Opportunités
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
```

