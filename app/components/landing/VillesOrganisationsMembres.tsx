import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const supabase = getSupabaseBrowserClient();

interface Membre {
  id: string;
  name: string;
  type: 'ville' | 'organisation';
}

interface VillesOrganisationsMembresProps {
  compact?: boolean;
}

export function VillesOrganisationsMembres({ compact = false }: VillesOrganisationsMembresProps) {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Villes et organisations membres");

  useEffect(() => {
    async function fetchMembres() {
      try {
        const { data } = await supabase
          .from('static_contents')
          .select('content')
          .eq('key', 'organisations-global')
          .maybeSingle();
        
        if (data?.content) {
          const content = data.content as any;
          setMembres(content.membres || []);
          if (content.title) setTitle(content.title);
        } else {
          // Fallback to defaults
          setMembres([
            { id: '1', name: 'Association des Maires de Villes du Cameroun', type: 'organisation' },
            { id: '2', name: 'Bafoussam', type: 'ville' },
            { id: '3', name: 'Bamenda', type: 'ville' },
            { id: '4', name: 'Bertoua', type: 'ville' },
            { id: '5', name: 'Douala', type: 'ville' },
            { id: '6', name: 'Ebolowa', type: 'ville' },
            { id: '7', name: 'Edéa', type: 'ville' },
            { id: '8', name: 'Garoua', type: 'ville' },
            { id: '9', name: 'Kribi', type: 'ville' },
            { id: '10', name: 'Kumba', type: 'ville' },
            { id: '11', name: 'Limbe', type: 'ville' },
            { id: '12', name: 'Maroua', type: 'ville' },
            { id: '13', name: 'Ngaoundéré', type: 'ville' },
            { id: '14', name: 'Nkongsamba', type: 'ville' },
            { id: '15', name: 'Yaoundé', type: 'ville' },
            { id: '16', name: 'Aéroport du Cameroun S.A', type: 'organisation' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembres();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
  }

  // If compact mode, show simplified version
  if (compact) {
    return (
      <div className="space-y-2">
        {membres.slice(0, 6).map((membre, index) => {
          const isOrganisation = membre.type === 'organisation';
          
          return (
            <div
              key={membre.id || index}
              className="flex items-start gap-2"
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isOrganisation ? (
                  <Building2 
                    className="text-accent-yellow" 
                    strokeWidth={2}
                    style={{ width: '16px', height: '16px' }}
                  />
                ) : (
                  <MapPin 
                    className="text-primary" 
                    strokeWidth={2}
                    style={{ width: '16px', height: '16px' }}
                  />
                )}
              </div>
              
              {/* Name */}
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: isOrganisation ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                  color: '#003A54',
                  lineHeight: '1.5'
                }}
              >
                {membre.name}
              </span>
            </div>
          );
        })}
        {membres.length > 6 && (
          <p className="text-neutral-500 pt-2" style={{ fontSize: '12px', fontWeight: 400 }}>
            +{membres.length - 6} autres membres
          </p>
        )}
      </div>
    );
  }
  
  // Full version
  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] border border-neutral-100 h-full flex flex-col">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 
          className="text-bg-base" 
          style={{ 
            fontSize: '24px', 
            lineHeight: '1.3', 
            fontWeight: 600,
            fontFamily: 'Poppins, sans-serif' 
          }}
        >
          {title}
        </h3>
      </div>
      
      {/* Grid Layout - No Scrolling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {membres.map((membre, index) => {
          const isOrganisation = membre.type === 'organisation';
          
          return (
            <div
              key={membre.id || index}
              className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg hover:bg-primary/5 transition-all duration-200 border border-neutral-100 hover:border-primary/20"
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isOrganisation ? (
                  <Building2 
                    className="text-accent-yellow" 
                    strokeWidth={2}
                    style={{ width: '18px', height: '18px' }}
                  />
                ) : (
                  <MapPin 
                    className="text-primary" 
                    strokeWidth={2}
                    style={{ width: '18px', height: '18px' }}
                  />
                )}
              </div>
              
              {/* Name */}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: isOrganisation ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                  color: '#003A54',
                  lineHeight: '1.5'
                }}
              >
                {membre.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}