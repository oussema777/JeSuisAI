'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/app/components/ui/command';
import { 
  ClipboardList, 
  Newspaper, 
  Search,
  LayoutDashboard,
  User,
  HelpCircle,
  ArrowRight,
  Command as CommandIcon,
  Loader2,
  Calendar,
  Briefcase,
  Plus,
  Inbox
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface QuickSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearch({ open, onOpenChange }: QuickSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{
    missions: any[];
    news: any[];
    candidatures: any[];
    profiles: any[];
    projets: any[];
  }>({
    missions: [],
    news: [],
    candidatures: [],
    profiles: [],
    projets: [],
  });
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setResults({ missions: [], news: [], candidatures: [], profiles: [], projets: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        // 1. Search Missions (Title + Description)
        const { data: missions } = await supabase
          .from('opportunites')
          .select('id, intitule_action, timing_action, created_at')
          .or(`intitule_action.ilike.%${search}%,description_generale.ilike.%${search}%`)
          .limit(5);

        // 2. Search News (Title + Resume)
        const { data: news } = await supabase
          .from('actualites')
          .select('id, titre, date_publication')
          .or(`titre.ilike.%${search}%,resume.ilike.%${search}%`)
          .limit(5);

        // 3. Search Candidatures (Name + Email + Motivation)
        const { data: candidatures } = await supabase
          .from('candidatures')
          .select('id, nom_prenom, email, created_at')
          .or(`nom_prenom.ilike.%${search}%,email.ilike.%${search}%,motivation.ilike.%${search}%`)
          .limit(5);

        // 4. Search Profiles Soumis (Name + Email + Message)
        const { data: profiles } = await supabase
          .from('profils_soumis')
          .select('id, nom, prenom, email, created_at')
          .or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`)
          .limit(5);

        // 5. Search Projects Soumis (Name + Email + Message)
        const { data: projets } = await supabase
          .from('projets_soumis')
          .select('id, nom, prenom, email, created_at')
          .or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`)
          .limit(5);

        setResults({
          missions: missions || [],
          news: news || [],
          candidatures: candidatures || [],
          profiles: profiles || [],
          projets: projets || [],
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [search, supabase]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Rechercher partout : missions, actualités, candidats, profils, projets..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[450px]">
        <CommandEmpty className="py-12 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-neutral-500 font-medium text-sm">Recherche en cours...</p>
            </div>
          ) : search.length >= 2 ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
                <Search className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-900 font-bold">Aucun résultat pour "{search}"</p>
              <p className="text-neutral-500 text-xs">Vérifiez l'orthographe ou essayez d'autres termes.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                <CommandIcon className="h-6 w-6 text-primary/40" />
              </div>
              <p className="text-neutral-900 font-bold">Moteur de recherche global</p>
              <p className="text-neutral-500 text-xs text-center max-w-[280px]">Recherchez instantanément dans toutes les bases de données de la plateforme.</p>
            </div>
          )}
        </CommandEmpty>
        
        {/* Missions Results */}
        {results.missions.length > 0 && (
          <CommandGroup heading="Missions & Opportunités">
            {results.missions.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(`/admin/opportunites?id=${item.id}`))}
                className="flex items-center gap-3 p-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">{item.intitule_action}</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="capitalize px-1.5 py-0.5 bg-neutral-100 rounded-md font-bold">{item.timing_action}</span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* News Results */}
        {results.news.length > 0 && (
          <CommandGroup heading="Actualités Municipales">
            {results.news.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(`/admin/actualites?id=${item.id}`))}
                className="flex items-center gap-3 p-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <Newspaper className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">{item.titre}</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <Calendar className="h-3 w-3" />
                    <span>Publié le {new Date(item.date_publication).toLocaleDateString()}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Candidatures Results */}
        {results.candidatures.length > 0 && (
          <CommandGroup heading="Candidatures Directes">
            {results.candidatures.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(`/admin/candidatures/${item.id}`))}
                className="flex items-center gap-3 p-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Inbox className="h-5 w-5 text-accent" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">{item.nom_prenom}</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="truncate">{item.email}</span>
                    <span>•</span>
                    <span>Reçu le {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Profiles Results */}
        {results.profiles.length > 0 && (
          <CommandGroup heading="Profils de Contribution">
            {results.profiles.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push('/admin/profilesoumis'))}
                className="flex items-center gap-3 p-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">{item.prenom} {item.nom}</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="truncate">{item.email}</span>
                    <span>•</span>
                    <span>Profil diaspora</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Projets Results */}
        {results.projets.length > 0 && (
          <CommandGroup heading="Projets Soumis">
            {results.projets.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push('/admin/projetsoumis'))}
                className="flex items-center gap-3 p-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">{item.prenom} {item.nom}</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="truncate">{item.email}</span>
                    <span>•</span>
                    <span>Projet diaspora</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Quick Links */}
        <CommandGroup heading="Raccourcis Navigation">
          <div className="grid grid-cols-2 gap-2 p-2">
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/dashboard'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/opportunites/creer'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Créer une mission</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/actualites/creer'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Newspaper className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Publier une actu</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/admin/aide'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <HelpCircle className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Centre d'aide</span>
            </CommandItem>
          </div>
        </CommandGroup>
      </CommandList>

      <div className="flex items-center justify-between px-6 py-4 border-t bg-neutral-50/50 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded shadow-sm text-neutral-500 font-bold text-[9px]">ENTER</kbd>
            <span>Sélectionner</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded shadow-sm text-neutral-500 font-bold text-[9px]">↑↓</kbd>
            <span>Naviguer</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary/60">
          <CommandIcon className="h-3 w-3" />
          <span>Moteur iLab Search</span>
        </div>
      </div>
    </CommandDialog>
  );
}
