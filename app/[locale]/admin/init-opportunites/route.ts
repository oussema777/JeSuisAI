import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase env variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Auth check: require Superadmin role
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'Superadmin') {
      return Response.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.rpc('create_opportunites_table_if_not_exists');

    if (error) {
      console.error('Error creating table:', error);
      return Response.json(
        { success: false, message: 'Erreur lors de l\'initialisation' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Actions table ready (created or already exists)',
    });
  } catch (err: unknown) {
    console.error('Init error:', err);
    return Response.json(
      { success: false, message: 'Erreur interne' },
      { status: 500 }
    );
  }
}
