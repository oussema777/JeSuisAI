-- Migration: Optimized Dashboard Stats
-- Reduces multiple count queries into a single efficient RPC call

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json AS $$
DECLARE
  actives_count bigint;
  total_cand_count bigint;
  pending_count bigint;
  closed_count bigint;
  result json;
BEGIN
  -- Count active published missions
  SELECT count(*) INTO actives_count 
  FROM public.opportunites 
  WHERE statut_publication = 'publie';

  -- Count total candidatures
  SELECT count(*) INTO total_cand_count 
  FROM public.candidatures;

  -- Count pending (new) candidatures
  SELECT count(*) INTO pending_count 
  FROM public.candidatures 
  WHERE statut = 'nouvelle';

  -- Count draft/archived missions
  SELECT count(*) INTO closed_count 
  FROM public.opportunites 
  WHERE statut_publication = 'brouillon';

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
