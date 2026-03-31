-- Fix RLS policy role casing: 'superadmin' -> 'Superadmin'
-- The app stores roles as 'Superadmin' (capitalized), but some policies check for 'superadmin' (lowercase)

-- Fix opportunite_contacts: drop and recreate the superadmin policy
DROP POLICY IF EXISTS "Superadmins can manage all contacts" ON public.opportunite_contacts;
CREATE POLICY "Superadmins can manage all contacts"
ON public.opportunite_contacts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'Superadmin'
  )
);

-- Fix static_contents: drop and recreate the superadmin policy
DROP POLICY IF EXISTS "Superadmins can manage static content" ON public.static_contents;
CREATE POLICY "Superadmins can manage static content"
ON public.static_contents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'Superadmin'
  )
);

-- Fix newsletter_subscriptions: drop and recreate superadmin policies
DROP POLICY IF EXISTS "Superadmins can view all subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Superadmins can view all subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND profiles.role = 'Superadmin'
  )
);

DROP POLICY IF EXISTS "Superadmins can delete subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Superadmins can delete subscriptions"
ON public.newsletter_subscriptions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND profiles.role = 'Superadmin'
  )
);
