'use client';
import React, { useState, useEffect } from 'react';
import { SidebarSuperadmin } from '../components/superadmin/Sidebarsuperadmin';
import { HeaderSuperadmin } from '../components/superadmin/HeaderSuperadmin';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Eye,
  Loader2,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { createUserAsAdmin } from '../api/actions/admin-users';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/listing/Pagination';
import { UserFormModal } from '../components/admin/UserFormModal';
import { UserViewModal } from '../components/admin/UserViewModal';
import { DeleteConfirmModal } from '../components/admin/DeleteConfirmModal';
import { useTranslations, useLocale } from 'next-intl';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  photo_url: string | null;
  role: string;
  status: string | null;
  annonceur_id: string | null; // Added for multi-tenancy
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password?: string;
  annonceur_id?: string; // Added for multi-tenancy
}

type ModalMode = 'add' | 'edit' | 'view' | null;

export default function GestionUtilisateurs({ hideSidebar = false }: { hideSidebar?: boolean }) {
  const t = useTranslations('Admin.Settings.Team');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const ITEMS_PER_PAGE = 20;
  const { supabase, profile, loading: authLoading, isSuperadmin } = useAuth();
  const hasAnnonceur = !!profile?.annonceur_id;
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [annonceurs, setAnnonceurs] = useState<Array<{ id: string; nom: string }>>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'Admin',
    status: 'active',
    password: '',
    annonceur_id: ''
  });

  // UI states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch cities/annonceurs for Superadmin dropdown
  useEffect(() => {
    const fetchAnnonceurs = async () => {
      if (isSuperadmin) {
        const { data } = await supabase.from('annonceur_profiles').select('id, nom').order('nom');
        if (data) setAnnonceurs(data);
      }
    };
    if (!authLoading && isSuperadmin) fetchAnnonceurs();
  }, [authLoading, isSuperadmin, supabase]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const applyFilters = (q: any) => {
        // Multi-tenancy: Admins only see users from their city
        // If hideSidebar is true, we are in "Team" mode (Parameters > Equipe)
        if (hideSidebar || !isSuperadmin) {
          if (profile?.annonceur_id) {
            q = q.eq('annonceur_id', profile.annonceur_id);
          } else {
            // In team mode or for city admins, if no annonceur_id, show nothing
            // (Unless they are superadmin and hideSidebar is false, which is handled by the outer IF)
            q = q.eq('id', '00000000-0000-0000-0000-000000000000');
          }
          
          // In team mode, never show Superadmins or public 'user' role
          q = q.neq('role', 'Superadmin');
          if (hideSidebar) {
            q = q.neq('role', 'user');
          }
        }

        if (debouncedSearch) {
          q = q.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
        }
        if (roleFilter !== 'all') {
          q = q.eq('role', roleFilter);
        }
        if (statusFilter !== 'all') {
          q = q.eq('status', statusFilter);
        }
        return q;
      };

      // Count query
      const { count } = await applyFilters(
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      );
      setTotalCount(count || 0);

      // Paginated data query
      const { data, error } = await applyFilters(
        supabase.from('profiles')
          .select('id, first_name, last_name, email, phone, photo_url, role, status, annonceur_id, created_at, updated_at')
      )
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      setUsers((data as UserProfile[]) || []);
    } catch (error: any) {
      console.error('Error fetching users:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading, debouncedSearch, roleFilter, statusFilter, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Open modal for add/edit/view
  const openModal = (mode: ModalMode, user?: UserProfile) => {
    setModalMode(mode);
    setModalOpen(true);
    setFormError('');
    setFormSuccess('');
    
    if (mode === 'add') {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'Annonceur', // Default to Annonceur for city admins
        status: 'active',
        password: '',
        annonceur_id: profile?.annonceur_id || '' // Auto-assign if city admin
      });
      setSelectedUser(null);
    } else if (user) {
      setSelectedUser(user);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status || 'active',
        password: '', // Never pre-fill password
        annonceur_id: user.annonceur_id || ''
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setSelectedUser(null);
    setFormError('');
    setFormSuccess('');
    setShowPassword(false);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
     if (modalMode === 'add') {
  // Create new user using server action
  if (!formData.password || formData.password.length < 6) {
    throw new Error(locale === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters');
  }

  // Call server action
  const result = await createUserAsAdmin({
    email: formData.email,
    password: formData.password,
    first_name: formData.first_name,
    last_name: formData.last_name,
    phone: formData.phone,
    role: formData.role,
    status: formData.status,
    annonceur_id: formData.annonceur_id, // Include city assignment
  });

  if (!result.success) {
    throw new Error(result.error || (locale === 'fr' ? 'Erreur lors de la création de l\'utilisateur' : 'Error during user creation'));
  }

  setFormSuccess(result.message || (locale === 'fr' ? 'Utilisateur créé avec succès !' : 'User created successfully!'));
  setTimeout(async () => {
    closeModal();
    await fetchUsers();
  }, 1500);}
   else if (modalMode === 'edit' && selectedUser) {
        // Update existing user
        const updateData: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          annonceur_id: formData.annonceur_id || null, // Include city update
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', selectedUser.id);

        if (updateError) throw updateError;

        setFormSuccess(locale === 'fr' ? 'Utilisateur mis à jour avec succès !' : 'User updated successfully!');
        setTimeout(async () => {
          closeModal();
          await fetchUsers();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error in form submit:', error);
      setFormError(error.message || (locale === 'fr' ? 'Une erreur est survenue' : 'An error occurred'));
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete user (soft delete - deactivate)
  const handleDeleteUser = async (userId: string) => {
    try {
      setFormLoading(true);
      
      // Soft delete: set status to inactive
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setFormSuccess(t('toast_deactivate_success'));
      setFormError('');
      setDeleteConfirmId(null);
      await fetchUsers();
      
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      setFormError(t('toast_deactivate_error'));
      setFormSuccess('');
    } finally {
      setFormLoading(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Superadmin':
        return 'bg-accent text-white';
      case 'Admin':
        return 'bg-primary text-white';
      case 'Annonceur':
        return 'bg-secondary text-white';
      default:
        return 'bg-neutral-500 text-white';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className={`min-h-screen bg-page-bg flex ${hideSidebar ? 'flex-col' : ''}`}>
      {!hideSidebar && <SidebarSuperadmin activePage="gestion-utilisateurs" />}
      
      <main className={`flex-1 ${hideSidebar ? 'p-0' : 'ml-[260px] pb-8'}`}>
        {/* Header */}
        {!hideSidebar && (
          <>
            <HeaderSuperadmin pageTitle={locale === 'fr' ? 'Gestion des Utilisateurs' : 'User Management'} />
            <div className="p-8 mt-16 lg:mt-[72px]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="mb-2 bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center gap-3 text-primary inline-flex">
                    <Search className="w-4 h-4" />
                    <p className="text-xs font-medium">{locale === 'fr' ? 'Recherche rapide : CTRL + K' : 'Quick search: CTRL + K'}</p>
                  </div>
                  <p className="text-neutral-600" style={{ fontSize: '16px', fontWeight: 400 }}>
                    {locale === 'fr' ? 'Gérez tous les utilisateurs de la plateforme' : 'Manage all platform users'}
                  </p>
                </div>
                <button
                  onClick={() => openModal('add')}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md"
                  style={{ fontSize: '15px', fontWeight: 600 }}
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                  <span>{locale === 'fr' ? 'Nouvel Utilisateur' : 'New User'}</span>
                </button>
              </div>
            </div>
          </>
        )}

        <div className={hideSidebar ? "p-0" : "px-8"}>
        {hideSidebar && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-neutral-900 mb-2" style={{ fontSize: '24px', fontWeight: 600 }}>
                  {t('title')}
                </h2>
                <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                  {t('subtitle')}
                </p>
              </div>
              <button
                onClick={() => openModal('add')}
                disabled={!hasAnnonceur && !isSuperadmin}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-md ${
                  !hasAnnonceur && !isSuperadmin
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
                style={{ fontSize: '14px', fontWeight: 600 }}
                title={!hasAnnonceur && !isSuperadmin ? t('required_annonceur_title') : ''}
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>{t('add_button')}</span>
              </button>
            </div>

            {!hasAnnonceur && !isSuperadmin && (
              <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-amber-800" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {t('required_annonceur_title')}
                  </p>
                  <p className="text-amber-700 mt-1" style={{ fontSize: '13px', fontWeight: 400 }}>
                    {t('required_annonceur_desc')}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Success/Error Messages */}
        {formSuccess && !modalOpen && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" strokeWidth={2} />
            <p className="text-green-700" style={{ fontSize: '14px', fontWeight: 600 }}>
              {formSuccess}
            </p>
          </div>
        )}

        {formError && !modalOpen && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
            <p className="text-red-700" style={{ fontSize: '14px', fontWeight: 600 }}>
              {formError}
            </p>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                  style={{ fontSize: '15px', fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
              >
                <option value="all">{t('role_filter_all')}</option>
                {(!hideSidebar && isSuperadmin) && <option value="Superadmin">Superadmin</option>}
                <option value="Admin">Admin</option>
                <option value="Annonceur">Annonceur</option>
                {!hideSidebar && <option value="user">{locale === 'fr' ? 'Utilisateur' : 'User'}</option>}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-neutral-300 focus:border-primary focus:outline-none"
                style={{ fontSize: '15px', fontWeight: 400 }}
              >
                <option value="all">{t('status_filter_all')}</option>
                <option value="active">{t('status_active')}</option>
                <option value="inactive">{t('status_inactive')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-neutral-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {t('table.user')}
                  </th>
                  <th className="px-6 py-4 text-left text-neutral-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {t('table.contact')}
                  </th>
                  <th className="px-6 py-4 text-left text-neutral-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {t('table.role')}
                  </th>
                  <th className="px-6 py-4 text-left text-neutral-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {t('table.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-neutral-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {t('table.created_at')}
                  </th>
                  <th className="px-6 py-4 text-center text-neutral-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {t('table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-neutral-200 rounded" />
                              <div className="h-3 w-20 bg-neutral-200 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-4 w-40 bg-neutral-200 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 bg-neutral-200 rounded-full" /></td>
                        <td className="px-6 py-4"><div className="h-6 w-16 bg-neutral-200 rounded-full" /></td>
                        <td className="px-6 py-4"><div className="h-4 w-24 bg-neutral-200 rounded" /></td>
                        <td className="px-6 py-4"><div className="h-8 w-24 bg-neutral-200 rounded mx-auto" /></td>
                      </tr>
                    ))}
                  </>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-neutral-300 mx-auto mb-2" strokeWidth={2} />
                      <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                        {t('empty_state')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {user.photo_url ? (
                              <img src={user.photo_url} alt={`Photo de ${user.first_name || ''} ${user.last_name || ''}`} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-primary" style={{ fontSize: '14px', fontWeight: 600 }}>
                                {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 500 }}>
                              {user.first_name || user.last_name 
                                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                : (locale === 'fr' ? 'Sans nom' : 'No name')}
                            </p>
                            <p className="text-neutral-500" style={{ fontSize: '13px', fontWeight: 400 }}>
                              ID: {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-neutral-700">
                            <Mail className="w-4 h-4" strokeWidth={2} />
                            <span style={{ fontSize: '14px', fontWeight: 400 }}>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-neutral-700">
                              <Phone className="w-4 h-4" strokeWidth={2} />
                              <span style={{ fontSize: '14px', fontWeight: 400 }}>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full ${getRoleBadgeColor(user.role)}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full ${getStatusBadgeColor(user.status)}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                          {user.status === 'active' ? t('status_active') : (user.status === 'inactive' ? t('status_inactive') : (user.status || 'N/A'))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                        {new Date(user.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal('view', user)}
                            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title={tCommon('view')}
                            aria-label={tCommon('view')}
                          >
                            <Eye className="w-5 h-5" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => openModal('edit', user)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title={tCommon('edit')}
                            aria-label={tCommon('edit')}
                          >
                            <Edit className="w-5 h-5" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title={tCommon('delete')}
                            aria-label={tCommon('delete')}
                          >
                            <Trash2 className="w-5 h-5" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <p className="text-neutral-600 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('stats.total')}
            </p>
            <p className="text-neutral-900" style={{ fontSize: '24px', fontWeight: 700 }}>
              {users.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <p className="text-neutral-600 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('stats.active')}
            </p>
            <p className="text-green-600" style={{ fontSize: '24px', fontWeight: 700 }}>
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <p className="text-neutral-600 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('stats.admins')}
            </p>
            <p className="text-primary" style={{ fontSize: '24px', fontWeight: 700 }}>
              {users.filter(u => u.role === 'Admin' || u.role === 'Superadmin').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <p className="text-neutral-600 mb-1" style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('stats.announcers')}
            </p>
            <p className="text-secondary" style={{ fontSize: '24px', fontWeight: 700 }}>
              {users.filter(u => u.role === 'Annonceur').length}
            </p>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              pageActuelle={currentPage}
              totalPages={totalPages}
              onChangementPage={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {modalOpen && (modalMode === 'add' || modalMode === 'edit') && (
        <UserFormModal
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          formLoading={formLoading}
          formError={formError}
          formSuccess={formSuccess}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isSuperadmin={isSuperadmin}
          annonceurs={annonceurs}
        />
      )}

      {/* View Modal */}
      {modalOpen && modalMode === 'view' && selectedUser && (
        <UserViewModal
          user={selectedUser}
          onClose={closeModal}
          onEdit={() => {
            closeModal();
            openModal('edit', selectedUser);
          }}
          getRoleBadgeColor={getRoleBadgeColor}
          getStatusBadgeColor={getStatusBadgeColor}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <DeleteConfirmModal
          onConfirm={() => handleDeleteUser(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
          loading={formLoading}
        />
      )}
    </div>
  );
}
