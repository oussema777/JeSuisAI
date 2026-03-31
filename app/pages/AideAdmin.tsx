'use client';
import React from 'react';
import { SidebarAdmin } from '../components/admin/SidebarAdmin';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { 
  ClipboardList, 
  Newspaper, 
  Inbox, 
  User, 
  Plus, 
  BookOpen,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function AideAdmin() {
  const t = useTranslations('Admin.Help');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const helpSections = [
    {
      id: "missions",
      icon: ClipboardList,
      title: t('sections.missions.title'),
      description: t('sections.missions.desc'),
      items: [
        { label: t('sections.missions.item1_label'), detail: t('sections.missions.item1_detail') },
        { label: t('sections.missions.item2_label'), detail: t('sections.missions.item2_detail') },
        { label: t('sections.missions.item3_label'), detail: t('sections.missions.item3_detail') }
      ]
    },
    {
      id: "news",
      icon: Newspaper,
      title: t('sections.news.title'),
      description: t('sections.news.desc'),
      items: [
        { label: t('sections.news.item1_label'), detail: t('sections.news.item1_detail') },
        { label: t('sections.news.item2_label'), detail: t('sections.news.item2_detail') },
        { label: t('sections.news.item3_label'), detail: t('sections.news.item3_detail') }
      ]
    },
    {
      id: "applications",
      icon: Inbox,
      title: t('sections.applications.title'),
      description: t('sections.applications.desc'),
      items: [
        { label: t('sections.applications.item1_label'), detail: t('sections.applications.item1_detail') },
        { label: t('sections.applications.item2_label'), detail: t('sections.applications.item2_detail') },
        { label: t('sections.applications.item3_label'), detail: t('sections.applications.item3_detail') }
      ]
    },
    {
      id: "submissions",
      icon: User,
      title: t('sections.submissions.title'),
      description: t('sections.submissions.desc'),
      items: [
        { label: t('sections.submissions.item1_label'), detail: t('sections.submissions.item1_detail') },
        { label: t('sections.submissions.item2_label'), detail: t('sections.submissions.item2_detail') },
        { label: t('sections.submissions.item3_label'), detail: t('sections.submissions.item3_detail') }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-page-bg">
      <SidebarAdmin 
        activePage="aide" 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'}`}>
        <HeaderAdmin pageTitle={t('page_title')} />
        
        <main className="p-4 lg:p-10 mt-16 lg:mt-[72px]">
          {/* Hero Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-primary" strokeWidth={2.5} />
              </div>
              <h1 className="text-neutral-900" style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700 }}>
                {t('hero_title')}
              </h1>
            </div>
            <p className="text-neutral-600 max-w-2xl" style={{ fontSize: '17px', lineHeight: '1.6' }}>
              {t('hero_subtitle')}
            </p>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-neutral-900 mb-4 flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 600 }}>
                <Plus className="w-5 h-5 text-primary" />
                {t('quick_actions_title')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/admin/opportunites/creer" className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                  <span className="text-sm font-medium">{t('quick_action_mission')}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1" />
                </Link>
                <Link href="/admin/actualites/creer" className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/20">
                  <span className="text-sm font-medium">{t('quick_action_news')}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-primary mb-4 flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 600 }}>
                  <MessageSquare className="w-5 h-5" />
                  {t('tech_support_title')}
                </h2>
                <p className="text-neutral-700 mb-5 text-sm leading-relaxed max-w-md">
                  {t('tech_support_desc')}
                </p>
                <a 
                  href="mailto:support@ilab.tn" 
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all text-sm font-bold shadow-lg shadow-primary/20"
                >
                  {t('tech_support_button')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <Database className="w-32 h-32 text-primary" />
              </div>
            </div>
          </div>

          {/* Help Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {helpSections.map((section) => (
              <div key={section.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-neutral-200 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="text-neutral-900 font-bold" style={{ fontSize: '18px' }}>
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-neutral-500 text-sm">
                    {section.description}
                  </p>
                </div>
                <div className="p-5 space-y-5 flex-1">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary/40" />
                      <h4 className="text-neutral-800 text-sm font-bold mb-1">
                        {item.label}
                      </h4>
                      <p className="text-neutral-600 text-xs leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('footer_version')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('footer_secure')}</span>
              </div>
            </div>
            <p style={{ fontSize: '12px' }}>{t('footer_rights')}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
