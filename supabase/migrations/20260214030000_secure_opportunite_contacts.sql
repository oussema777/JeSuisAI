-- Enable RLS on opportunite_contacts
ALTER TABLE public.opportunite_contacts ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Anyone can view contacts (since missions are public)
CREATE POLICY "Contacts are viewable by everyone" 
ON public.opportunite_contacts 
FOR SELECT 
USING (true);

-- 2. Policy: Creators can manage their own mission contacts
CREATE POLICY "Creators can manage their own mission contacts" 
ON public.opportunite_contacts 
FOR ALL 
TO authenticated
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

-- 3. Policy: Superadmins can manage all contacts
CREATE POLICY "Superadmins can manage all contacts" 
ON public.opportunite_contacts 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
);

-- 4. Secure static_contents
ALTER TABLE public.static_contents ENABLE ROW LEVEL SECURITY;

-- Anyone can read static content
CREATE POLICY "Static content is readable by everyone" 
ON public.static_contents 
FOR SELECT 
USING (true);

-- Only Superadmins can manage static content
CREATE POLICY "Superadmins can manage static content" 
ON public.static_contents 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  )
);
