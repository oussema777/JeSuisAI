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
  Users, 
  Building2, 
  Search,
  LayoutDashboard,
  HelpCircle,
  Mail,
  UserPlus,
  ArrowRight,
  Command as CommandIcon,
  Loader2,
  Shield,
  FileText
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface QuickSearchSuperadminProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearchSuperadmin({ open, onOpenChange }: QuickSearchSuperadminProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{
    users: any[];
    inscriptions: any[];
  }>({
    users: [],
    inscriptions: [],
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
      setResults({ users: [], inscriptions: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        // 1. Search Users (Name, Email, Role)
        const { data: users } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role')
          .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,role.ilike.%${search}%`)
          .limit(10);

        // 2. Search Inscriptions (Org Name, Person Name, Email, Type)
        const { data: inscriptions } = await supabase
          .from('pre_inscriptions')
          .select('id, organisation_name, nom, prenom, email, organisation_type')
          .or(`organisation_name.ilike.%${search}%,nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%,organisation_type.ilike.%${search}%`)
          .limit(10);

        setResults({
          users: users || [],
          inscriptions: inscriptions || [],
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
        placeholder="Rechercher un utilisateur, une organisation, un email..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[450px]">
        <CommandEmpty className="py-12 text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-neutral-500 font-medium text-sm">Recherche Superadmin en cours...</p>
            </div>
          ) : search.length >= 2 ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
                <Search className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-neutral-900 font-bold">Aucun résultat trouvé</p>
              <p className="text-neutral-500 text-xs">Vérifiez les critères ou essayez un email complet.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                <CommandIcon className="h-6 w-6 text-primary/40" />
              </div>
              <p className="text-neutral-900 font-bold">Contrôle Global Superadmin</p>
              <p className="text-neutral-500 text-xs text-center max-w-[280px]">Recherche transversale sur les utilisateurs et les inscriptions.</p>
            </div>
          )}
        </CommandEmpty>
        
        {/* Users Results */}
        {results.users.length > 0 && (
          <CommandGroup heading="Utilisateurs de la Plateforme">
            {results.users.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(`/superadmin/utilisateurs?id=${item.id}`))}
                className="flex items-center gap-3 p-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">
                    {item.first_name} {item.last_name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="font-bold text-primary uppercase">{item.role}</span>
                    <span>•</span>
                    <span className="truncate">{item.email}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Inscriptions Results */}
        {results.inscriptions.length > 0 && (
          <CommandGroup heading="Demandes d'Inscriptions">
            {results.inscriptions.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(`/superadmin/inscriptions?id=${item.id}`))}
                className="flex items-center gap-3 p-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-semibold text-neutral-900 truncate">
                    {item.organisation_name || `${item.prenom} ${item.nom}`}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span className="bg-neutral-100 px-1.5 py-0.5 rounded-md font-bold uppercase">{item.organisation_type}</span>
                    <span>•</span>
                    <span>{item.prenom} {item.nom}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-300 opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100 transition-all" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Quick Links */}
        <CommandGroup heading="Navigation Superadmin">
          <div className="grid grid-cols-2 gap-2 p-2">
            <CommandItem onSelect={() => runCommand(() => router.push('/superadmin/dashboard'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/superadmin/utilisateurs'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Utilisateurs</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/superadmin/inscriptions'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Inscriptions</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/superadmin/aide'))} className="p-3 cursor-pointer flex items-center gap-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group">
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
