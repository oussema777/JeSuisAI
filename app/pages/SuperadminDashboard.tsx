'use client';
import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { BottomNavSuperadmin } from '../components/superadmin/BottomNavSuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield,
  TrendingUp,
  Activity,
  FileText,
  BarChart3,
  Mail,
  Search
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  admins: number;
  annonceurs: number;
  superadmins: number;
  totalOpportunities: number;
  totalApplications: number;
  totalSubscribers: number;
}

export default function SuperadminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    admins: 0,
    annonceurs: 0,
    superadmins: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    totalSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);
  const hasFetched = React.useRef(false);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const fetchStats = async () => {
      if (authLoading || !profile || hasFetched.current) return;
      
      try {
        setLoading(true);
        hasFetched.current = true;
        // Fetch user statistics
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('role, status');

        if (profilesError) throw profilesError;

        const totalUsers = profiles?.length || 0;
        const activeUsers = profiles?.filter(p => p.status === 'active').length || 0;
        const inactiveUsers = profiles?.filter(p => p.status !== 'active').length || 0;
        const admins = profiles?.filter(p => p.role === 'Admin').length || 0;
        const annonceurs = profiles?.filter(p => p.role === 'Annonceur').length || 0;
        const superadmins = profiles?.filter(p => p.role === 'Superadmin').length || 0;

        // Fetch opportunities count
        const { count: opportunitiesCount } = await supabase
          .from('opportunites')
          .select('*', { count: 'exact', head: true });

        // Fetch applications count
        const { count: applicationsCount } = await supabase
          .from('candidatures')
          .select('*', { count: 'exact', head: true });

        // Fetch subscribers count
        const { count: subscribersCount } = await supabase
          .from('newsletter_subscriptions')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers,
          activeUsers,
          inactiveUsers,
          admins,
          annonceurs,
          superadmins,
          totalOpportunities: opportunitiesCount || 0,
          totalApplications: applicationsCount || 0,
          totalSubscribers: subscribersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase, authLoading, profile]);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    bgColor 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    color: string; 
    bgColor: string; 
  }) => (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} strokeWidth={2} />
        </div>
        <TrendingUp className="w-5 h-5 text-primary" strokeWidth={2} />
      </div>
      <p className="text-neutral-600 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
        {label}
      </p>
      <p className="text-neutral-900" style={{ fontSize: '32px', fontWeight: 700 }}>
        {loading ? '...' : value.toLocaleString()}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-page-bg flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <SidebarSuperadmin activePage="dashboard" />
      </div>
      
      <main className="flex-1 lg:ml-[260px] pb-24 lg:pb-8">
        <HeaderSuperadmin pageTitle="Tableau de bord Super Admin" />
        
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

          {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Utilisateurs"
            value={stats.totalUsers}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            icon={UserCheck}
            label="Utilisateurs Actifs"
            value={stats.activeUsers}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={UserX}
            label="Utilisateurs Inactifs"
            value={stats.inactiveUsers}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={Shield}
            label="Administrateurs"
            value={stats.admins + stats.superadmins}
            color="text-accent"
            bgColor="bg-accent/10"
          />
          <StatCard
            icon={Mail}
            label="Abonnés Newsletter"
            value={stats.totalSubscribers}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
        </div>

        {/* Role Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Admins
                </p>
                <p className="text-neutral-900" style={{ fontSize: '24px', fontWeight: 700 }}>
                  {loading ? '...' : stats.admins}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Annonceurs
                </p>
                <p className="text-neutral-900" style={{ fontSize: '24px', fontWeight: 700 }}>
                  {loading ? '...' : stats.annonceurs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" strokeWidth={2} />
              </div>
              <div>
                <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Superadmins
                </p>
                <p className="text-neutral-900" style={{ fontSize: '24px', fontWeight: 700 }}>
                  {loading ? '...' : stats.superadmins}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Total Actions
                </p>
                <p className="text-neutral-900" style={{ fontSize: '28px', fontWeight: 700 }}>
                  {loading ? '...' : stats.totalOpportunities}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Total Candidatures
                </p>
                <p className="text-neutral-900" style={{ fontSize: '28px', fontWeight: 700 }}>
                  {loading ? '...' : stats.totalApplications}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md border border-neutral-200 p-6">
          <h2 className="text-neutral-900 mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
              <Users className="w-5 h-5" strokeWidth={2} />
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Gérer Utilisateurs</span>
            </button>
            <button className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors flex items-center justify-center gap-2">
              <Activity className="w-5 h-5" strokeWidth={2} />
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Voir Activité</span>
            </button>
            <button className="px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" strokeWidth={2} />
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Rapports</span>
            </button>
          </div>
        </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <BottomNavSuperadmin activePage="dashboard" />
    </div>
  );
}