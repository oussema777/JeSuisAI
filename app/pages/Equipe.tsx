'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  Edit,
  Check,
  X as XIcon,
  MoreVertical,
  Clock,
  RotateCcw,
  Key,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Annonceur' | 'Superadmin';
  status: 'Actif' | 'Invité' | 'Inactif';
  addedDate: string;
  photo?: string;
  initials: string;
}

interface EquipeProps {
  teamMembers: TeamMember[];
  currentUserId: string;
  onSuccess?: () => void;
}

export function Equipe({ teamMembers, currentUserId, onSuccess }: EquipeProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const activeCount = teamMembers.filter(m => m.status === 'Actif').length;
  const invitedCount = teamMembers.filter(m => m.status === 'Invité').length;

  const handleEditRole = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditRoleModal(true);
    setOpenMenuId(null);
  };

  const handleRemove = (member: TeamMember) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
    setOpenMenuId(null);
  };

  return (
    <div>
      {/* SECTION 1: Page Header with Action */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-neutral-900 mb-3" style={{ fontSize: '25px', fontWeight: 600 }}>
            Gestion de l&apos;équipe
          </h2>
          <div className="flex items-center gap-4" style={{ fontSize: '14px', fontWeight: 400 }}>
            <span className="text-neutral-600">
              <span style={{ fontWeight: 600 }}>{activeCount}</span> membres actifs
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-600">
              <span style={{ fontWeight: 600 }}>{invitedCount}</span> invitations en attente
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="h-13 px-7 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2.5 shadow-sm"
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          <UserPlus className="w-5 h-5" strokeWidth={2} />
          Inviter un membre
        </button>
      </div>
      <div className="h-px bg-neutral-200 mb-8" />

      {/* SECTION 2: Role Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Admin */}
        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 rounded-xl p-6">
          <Shield className="w-8 h-8 text-primary mb-3" strokeWidth={2} />
          <div className="inline-block px-2.5 py-1 bg-primary text-white rounded text-xs font-semibold uppercase tracking-wide mb-3">
            ADMIN
          </div>
          <h4 className="text-neutral-900 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
            Administrateur
          </h4>
          <p className="text-neutral-700 mb-4" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
            Accès complet au système incluant la gestion des utilisateurs
          </p>
          <div className="space-y-2" style={{ fontSize: '13px', fontWeight: 400 }}>
            <div className="flex items-center gap-2 text-neutral-600">
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>Tout gérer</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>Ajouter/supprimer utilisateurs</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>Accès aux statistiques</span>
            </div>
          </div>
        </div>

        {/* Card 2: Content Editor */}
        <div className="bg-gradient-to-br from-blue-50 to-transparent border border-blue-200 rounded-xl p-6">
          <Edit className="w-8 h-8 text-blue-600 mb-3" strokeWidth={2} />
          <div className="inline-block px-2.5 py-1 bg-blue-500 text-white rounded text-xs font-semibold uppercase tracking-wide mb-3">
            Annonceur
          </div>
          <h4 className="text-neutral-900 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
            Chargé de mise à jour
          </h4>
          <p className="text-neutral-700 mb-4" style={{ fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
            Peut créer et gérer les actions, actualités et informations de la mairie
          </p>
          <div className="space-y-2" style={{ fontSize: '13px', fontWeight: 400 }}>
            <div className="flex items-center gap-2 text-neutral-600">
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>Créer des actions</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>Publier des actualités</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600">
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>Modifier le profil mairie</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <XIcon className="w-4 h-4" strokeWidth={2} />
              <span>Gérer les utilisateurs</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <XIcon className="w-4 h-4" strokeWidth={2} />
              <span>Voir les candidatures</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Team Members Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-neutral-50 border-b-2 border-neutral-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-4">
            <div className="col-span-4">
              <span className="text-neutral-700 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>
                Membre
              </span>
            </div>
            <div className="col-span-3">
              <span className="text-neutral-700 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>
                Email
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-neutral-700 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>
                Rôle
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-neutral-700 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>
                Statut
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-neutral-700 uppercase tracking-wider" style={{ fontSize: '13px', fontWeight: 600 }}>
                Actions
              </span>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-neutral-100">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-neutral-50 transition-colors"
              style={{ minHeight: '88px' }}
            >
              {/* Column 1: Member */}
              <div className="col-span-4 flex items-center gap-4">
                {/* Avatar */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white border-2 border-neutral-200 flex-shrink-0 ${
                    member.role === 'Admin' ? 'bg-primary' :
                    member.role === 'Annonceur' ? 'bg-blue-500' :
                    'bg-purple-500'
                  } ${member.status === 'Invité' ? 'opacity-50' : ''}`}
                >
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>
                    {member.initials}
                  </span>
                </div>
                {/* Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                      {member.firstName} {member.lastName}
                    </span>
                    {member.id === currentUserId && (
                      <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-xs font-medium">
                        Vous
                      </span>
                    )}
                  </div>
                  <span className="text-neutral-500" style={{ fontSize: '12px', fontWeight: 400 }}>
                    {member.addedDate}
                  </span>
                </div>
              </div>

              {/* Column 2: Email */}
              <div className="col-span-3 flex items-center">
                <span className="text-neutral-600 truncate" style={{ fontSize: '14px', fontWeight: 400 }}>
                  {member.email}
                </span>
              </div>

              {/* Column 3: Role */}
              <div className="col-span-2 flex items-center">
                <div
                  className={`inline-flex px-3.5 py-2 rounded-lg shadow-sm ${
                    member.role === 'Admin' ? 'bg-primary text-white' :
                    member.role === 'Annonceur' ? 'bg-blue-500 text-white' :
                    'bg-purple-500 text-white'
                  } ${member.status === 'Invité' ? 'opacity-60' : ''}`}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Column 4: Status */}
              <div className="col-span-2 flex items-center">
                {member.status === 'Actif' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-md">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Actif</span>
                  </div>
                )}
                {member.status === 'Invité' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-md">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Invité</span>
                  </div>
                )}
                {member.status === 'Inactif' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-400 text-white rounded-md">
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Inactif</span>
                  </div>
                )}
              </div>

              {/* Column 5: Actions */}
              <div className="col-span-1 flex items-center justify-end relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                  className="w-9 h-9 flex items-center justify-center border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                  aria-label="Plus d'actions"
                >
                  <MoreVertical className="w-5 h-5 text-neutral-600" strokeWidth={2} />
                </button>
                {/* Dropdown Menu */}
                {openMenuId === member.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-0 top-10 z-20 bg-white border border-neutral-200 rounded-lg shadow-xl py-2 w-56">
                      <button
                        onClick={() => handleEditRole(member)}
                        className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                        style={{ fontSize: '14px', fontWeight: 500 }}
                      >
                        <Edit className="w-4 h-4 text-neutral-600" strokeWidth={2} />
                        <span className="text-neutral-900">Modifier le rôle</span>
                      </button>
                      {member.status === 'Invité' && (
                        <button
                          className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                          style={{ fontSize: '14px', fontWeight: 500 }}
                        >
                          <RotateCcw className="w-4 h-4 text-neutral-600" strokeWidth={2} />
                          <span className="text-neutral-900">Renvoyer l&apos;invitation</span>
                        </button>
                      )}
                      <button
                        className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                        style={{ fontSize: '14px', fontWeight: 500 }}
                      >
                        <Key className="w-4 h-4 text-neutral-600" strokeWidth={2} />
                        <span className="text-neutral-900">Réinitialiser le mot de passe</span>
                      </button>
                      <button
                        className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                        style={{ fontSize: '14px', fontWeight: 500 }}
                      >
                        <AlertTriangle className="w-4 h-4 text-neutral-600" strokeWidth={2} />
                        <span className="text-neutral-900">
                          {member.status === 'Actif' ? 'Désactiver' : 'Activer'}
                        </span>
                      </button>
                      {member.id !== currentUserId && (
                        <button
                          onClick={() => handleRemove(member)}
                          className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-neutral-100 mt-1"
                          style={{ fontSize: '14px', fontWeight: 500 }}
                        >
                          <AlertTriangle className="w-4 h-4 text-accent" strokeWidth={2} />
                          <span className="text-accent">Retirer de l&apos;équipe</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} onSuccess={onSuccess} />}
      {showEditRoleModal && selectedMember && (
        <EditRoleModal member={selectedMember} onClose={() => setShowEditRoleModal(false)} />
      )}
      {showRemoveModal && selectedMember && (
        <RemoveModal member={selectedMember} onClose={() => setShowRemoveModal(false)} />
      )}
    </div>
  );
}

// INVITE MODAL
// INVITE MODAL
// Update the InviteModal component in your Equipe.tsx to properly refresh the team list

// Replace the InviteModal component with this updated version:

// Update the InviteModal component in your Equipe.tsx to properly refresh the team list

// Replace the InviteModal component with this updated version:

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [sendWelcome, setSendWelcome] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      setError('Le prénom est requis');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Le nom est requis');
      return;
    }
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }
    if (!formData.role) {
      setError('Veuillez sélectionner un rôle');
      return;
    }
    if (!formData.password) {
      setError('Le mot de passe est requis');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email invalide');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/invite-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          role: formData.role,
          password: formData.password,
          sendWelcome: sendWelcome,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'invitation');
      }

      toast.success('Invitation envoyée avec succès !');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err: any) {
      console.error('Invite error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of the InviteModal JSX remains the same, but remove password fields
  // The password is now generated server-side
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Ajouter un membre">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-neutral-900 mb-2" style={{ fontSize: '22px', fontWeight: 600 }}>
                Inviter un membre de l&apos;équipe
              </h3>
              <p className="text-neutral-600" style={{ fontSize: '14px', fontWeight: 400 }}>
                Remplissez les informations du nouveau membre
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Fermer"
            >
              <XIcon className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Prénom *
                </label>
                <input
                  type="text"
                  placeholder="Prénom"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
              </div>
              <div>
                <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Nom *
                </label>
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Row 2: Email */}
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                Adresse email *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type="email"
                  placeholder="email@douala-city.cm"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Row 3: Phone */}
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                Téléphone (optionnel)
              </label>
              <div className="relative">
                <Phone className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type="tel"
                  placeholder="+237 6XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 pl-12 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Row 4: Password */}
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                Mot de passe *
              </label>
              <div className="relative">
                <Key className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 pl-12 pr-12 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 inset-y-0 my-auto text-neutral-400 hover:text-neutral-600"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-neutral-500 mt-1.5" style={{ fontSize: '12px', fontWeight: 400 }}>
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>

            {/* Row 5: Confirm Password */}
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Key className="absolute left-4 inset-y-0 my-auto w-5 h-5 text-neutral-400" strokeWidth={2} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Retapez le mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-12 pl-12 pr-12 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  style={{ fontSize: '16px', fontWeight: 400 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 inset-y-0 my-auto text-neutral-400 hover:text-neutral-600"
                  aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Row 6: Role */}
            <div>
              <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isSubmitting}
                className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed"
                style={{ fontSize: '16px', fontWeight: 400 }}
              >
                <option value="">Sélectionnez un rôle...</option>
                <option value="Annonceur">Chargé de mise à jour (Annonceur)</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>

            {/* Role Description */}
            {formData.role === 'Annonceur' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
                <Edit className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-neutral-900 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Chargé de mise à jour (Annonceur)
                  </p>
                  <p className="text-neutral-700 mb-2" style={{ fontSize: '13px', fontWeight: 400 }}>
                    Peut créer et gérer les actions, actualités et informations de la mairie
                  </p>
                  <p className="text-neutral-600" style={{ fontSize: '12px', fontWeight: 400 }}>
                    Peut: Créer actions, Publier actualités, Modifier profil mairie
                  </p>
                </div>
              </div>
            )}

            {formData.role === 'Admin' && (
              <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-neutral-900 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Attention
                  </p>
                  <p className="text-neutral-700" style={{ fontSize: '13px', fontWeight: 400 }}>
                    Les administrateurs ont un accès complet au système, incluant la suppression de données et la gestion des utilisateurs.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-neutral-200 bg-neutral-50 rounded-b-xl flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sendWelcome}
              onChange={(e) => setSendWelcome(e.target.checked)}
              disabled={isSubmitting}
              className="w-5 h-5 rounded border-2 border-neutral-300 text-primary cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-neutral-700" style={{ fontSize: '14px', fontWeight: 400 }}>
              Envoyer un email d&apos;invitation avec les identifiants
            </span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-6 bg-white border border-neutral-300 rounded-lg text-neutral-900 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-11 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" strokeWidth={2} />
                  Créer le membre
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// EDIT ROLE MODAL
function EditRoleModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const [newRole, setNewRole] = useState(member.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Modifier le rôle">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl">
        <div className="px-8 py-6 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            <h3 className="text-neutral-900" style={{ fontSize: '22px', fontWeight: 600 }}>
              Modifier le rôle
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Fermer"
            >
              <XIcon className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-neutral-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
              <span style={{ fontSize: '16px', fontWeight: 600 }}>{member.initials}</span>
            </div>
            <div>
              <div className="text-neutral-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                {member.firstName} {member.lastName}
              </div>
              <div className="text-neutral-600" style={{ fontSize: '13px', fontWeight: 400 }}>
                {member.email}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-neutral-700 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Rôle actuel:
            </p>
            <div className="inline-flex px-3.5 py-2 bg-primary text-white rounded-lg">
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{member.role}</span>
            </div>
          </div>

          <div>
            <label className="block text-neutral-900 mb-2" style={{ fontSize: '14px', fontWeight: 500 }}>
              Nouveau rôle *
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full h-12 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              style={{ fontSize: '16px', fontWeight: 400 }}
            >
              <option value="Admin">Administrateur</option>
              <option value="Annonceur">Chargé de mise à jour (Annonceur)</option>
            </select>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-neutral-200 bg-neutral-50 rounded-b-xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 px-6 bg-white border border-neutral-300 rounded-lg text-neutral-900 hover:bg-neutral-50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            Annuler
          </button>
          <button
            className="h-11 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}

// REMOVE MODAL
function RemoveModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Retirer un membre">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-8 py-6 border-b border-neutral-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-accent" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h3 className="text-neutral-900 mb-1" style={{ fontSize: '20px', fontWeight: 600 }}>
                Retirer ce membre ?
              </h3>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Fermer"
              >
                <XIcon className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          <p className="text-neutral-700 mb-4" style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.6' }}>
            <span className="font-semibold">{member.firstName} {member.lastName}</span> ({member.email}) sera retiré de l&apos;équipe et ne pourra plus accéder à la plateforme.
          </p>
          <div className="bg-red-50 border-l-4 border-accent rounded-lg p-4">
            <p className="text-neutral-800" style={{ fontSize: '14px', fontWeight: 500 }}>
              ⚠️ Cette action est irréversible. Le membre devra être invité à nouveau pour retrouver l&apos;accès.
            </p>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-neutral-200 bg-neutral-50 rounded-b-xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 px-6 bg-white border border-neutral-300 rounded-lg text-neutral-900 hover:bg-neutral-50 transition-colors"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            Annuler
          </button>
          <button
            className="h-11 px-6 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            Oui, retirer de l&apos;équipe
          </button>
        </div>
      </div>
    </div>
  );
}