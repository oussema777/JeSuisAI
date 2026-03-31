'use client';
import React from 'react';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { BottomNavSuperadmin } from '../components/superadmin/BottomNavSuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Mail, 
  Search,
  BookOpen,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AideSuperadmin() {
  const helpSections = [
    {
      id: "users",
      icon: Users,
      title: "Gestion des Utilisateurs",
      description: "Gérez les accès et les rôles de la plateforme.",
      items: [
        { label: "Différence entre Admin et Annonceur", detail: "Le Superadmin contrôle tout. L'Admin gère sa ville, l'Annonceur publie des missions." },
        { label: "Désactivation d'un compte", detail: "Utilisez le bouton de statut pour suspendre immédiatement un accès." },
        { label: "Réinitialisation de mot de passe", detail: "L'utilisateur peut le faire via \"Mot de passe oublié\", ou vous pouvez renvoyer une invitation." }
      ]
    },
    {
      id: "content",
      icon: FileText,
      title: "Contenus Statiques",
      description: "Modifiez les textes officiels sans toucher au code.",
      items: [
        { label: "Modification de la Landing Page", detail: "Utilisez l'éditeur dédié pour changer les titres et les descriptions." },
        { label: "Correction en masse", detail: "Outil puissant pour corriger un terme sur l'ensemble des pages statiques." },
        { label: "Gestion de la FAQ", detail: "Ajoutez ou modifiez les questions récurrentes des utilisateurs." }
      ]
    },
    {
      id: "governance",
      icon: ShieldCheck,
      title: "Gouvernance & Inscriptions",
      description: "Processus de validation et sécurité.",
      items: [
        { label: "Validation des pré-inscriptions", detail: "Vérifiez l'identité de l'organisation avant d'approuver la demande." },
        { label: "Délais de réponse (48h)", detail: "Respectez l'engagement de réponse rapide pour garantir le sérieux du réseau." },
        { label: "Audit Logs", detail: "Bientôt disponible : Historique complet des actions administratives." }
      ]
    },
    {
      id: "newsletter",
      icon: Mail,
      title: "Newsletter & Communication",
      description: "Gérez la base de contacts.",
      items: [
        { label: "Export des abonnés", detail: "Téléchargez la liste au format CSV pour vos outils d'emailing." },
        { label: "RGPD", detail: "Toutes les données sont collectées avec consentement explicite." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-page-bg flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <SidebarSuperadmin activePage="aide" />
      </div>
      
      <main className="flex-1 lg:ml-[260px] pb-24 lg:pb-8">
        <HeaderSuperadmin pageTitle="Centre d'Aide Superadmin" />
        
        <div className="p-4 lg:p-8 mt-16 lg:mt-[72px]">
          {/* Search Shortcut Hint */}
          <div className="mb-6 bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary">
              <Search className="w-5 h-5" />
              <p className="text-sm font-medium">Recherche rapide disponible</p>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded text-[10px] font-bold text-neutral-500 shadow-sm">CTRL</kbd>
              <span className="text-neutral-400 font-bold text-xs">+</span>
              <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded text-[10px] font-bold text-neutral-500 shadow-sm">K</kbd>
            </div>
          </div>

          {/* Quick Links / Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h2 className="text-neutral-900 mb-4 flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 600 }}>
              <Lock className="w-5 h-5 text-accent" />
              Actions Critiques
            </h2>
            <div className="space-y-3">
              <Link href="/superadmin/utilisateurs" className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors group">
                <span className="text-neutral-700 text-sm font-medium">Réinitialiser un administrateur</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/superadmin/inscriptions" className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors group">
                <span className="text-neutral-700 text-sm font-medium">Valider les nouvelles mairies</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h2 className="text-primary mb-4 flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 600 }}>
              <MessageSquare className="w-5 h-5" />
              Support iLab Technique
            </h2>
            <p className="text-neutral-700 mb-4 text-sm leading-relaxed">
              Pour toute anomalie technique, erreur de base de données ou besoin d'évolution urgente :
            </p>
            <a 
              href="mailto:support@ilab.tn" 
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-all text-sm font-semibold shadow-md"
            >
              Contacter l'équipe iLab
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpSections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-neutral-200 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-neutral-900 font-bold" style={{ fontSize: '17px' }}>
                    {section.title}
                  </h3>
                </div>
                <p className="text-neutral-500 text-sm">
                  {section.description}
                </p>
              </div>
              <div className="p-4 space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="p-3">
                    <h4 className="text-neutral-800 text-sm font-bold mb-1 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {item.label}
                    </h4>
                    <p className="text-neutral-600 text-xs leading-relaxed ml-3.5">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-neutral-400">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span style={{ fontSize: '12px' }}>V 1.1.0 Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span style={{ fontSize: '12px' }}>Hébergement VPS Sécurisé</span>
          </div>
        </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <BottomNavSuperadmin activePage="dashboard" />
    </div>
  );
}
