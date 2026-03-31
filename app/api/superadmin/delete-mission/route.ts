import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Verify the caller is authenticated
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Check superadmin role (using admin client to bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'Superadmin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { missionId } = await req.json();
    if (!missionId) {
      return NextResponse.json({ error: 'ID de mission requis' }, { status: 400 });
    }

    // Delete related records first, then the mission (using service role to bypass RLS)
    const { error: contactsError } = await supabaseAdmin
      .from('opportunite_contacts')
      .delete()
      .eq('opportunite_id', missionId);
    if (contactsError) throw contactsError;

    const { error: candidaturesError } = await supabaseAdmin
      .from('candidatures')
      .delete()
      .eq('opportunite_id', missionId);
    if (candidaturesError) throw candidaturesError;

    const { error: deleteError } = await supabaseAdmin
      .from('opportunites')
      .delete()
      .eq('id', missionId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete mission error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
