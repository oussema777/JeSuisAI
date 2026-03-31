'use client';
import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, Linkedin, MapPin, 
  Eye, Clock, ArrowRight, Check, FileText, Archive, Trash2, 
  Plus, X, Send, ExternalLink, Briefcase, Globe, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { HeaderAdmin } from '../components/admin/HeaderAdmin';
import { Badge } from '../components/ds/Badge';
import { Bouton } from '../components/ds/Bouton';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

// --- Types ---
interface Note {
  id: number;
  content: string;
  author: string;
  date: string;
  dateRelative: string;
}

interface TimelineItem {
  id: number;
  action: string;
  timestamp: string;
  icon: 'submit' | 'view' | 'note' | 'email' | 'status';
}

interface CandidatureData {
  id: number;
  created_at: string;
  nom_prenom: string;
  email: string;
  whatsapp: string;
  pays_residence: string;
  linkedin_url: string | null;
  message: string;
  lien_territoire: string;
  statut: string;
  accord_temoignage: boolean;
  opportunites: {
    intitule_action: string;
  } | null;
}

// Initialize Supabase (singleton)
const supabase = getSupabaseBrowserClient();

export default function DetailCandidature() {
  const params = useParams();
  const applicationId = params.id; 
  const { profile, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // --- State Management ---
  const [candidature, setCandidature] = useState<CandidatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Loading state for email sending
  const [isSending, setIsSending] = useState(false);

  // Local state for UI interactions
  const [notes, setNotes] = useState<Note[]>([]); 
  const [newNote, setNewNote] = useState('');
  const [emailSubject, setEmailSubject] = useState("");
  const [emailCC, setEmailCC] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [markAsRespondedAfterSend, setMarkAsRespondedAfterSend] = useState(true);

  // --- Authorization Check ---
  useEffect(() => {
    if (!authLoading) {
      if (profile && (profile.role === 'Admin' || profile.role === 'Superadmin')) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }
  }, [profile, authLoading]);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      if (!applicationId || isAuthorized !== true) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('candidatures')
          .select(`
            *,
            opportunites (
              intitule_action
            )
          `)
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error("Error fetching candidature:", error);
          toast.error("Impossible de charger la candidature.");
        } else {
          setCandidature(data);
          setEmailSubject(`Re: ${data.opportunites?.intitule_action || 'Candidature'}`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicationId, isAuthorized]);

  // --- Handlers ---

  const handleStatusChange = async (newStatus: string) => {
    if (!candidature) return;

    // Map UI values to database values
    const statusMap: Record<string, string> = {
      'Nouveau': 'nouvelle',
      'En attente': 'en_attente',
      'Répondu': 'repondu',
      'Archivé': 'archive'
    };

    const dbStatus = statusMap[newStatus] || newStatus.toLowerCase();

    // Optimistic UI update
    const previousStatus = candidature.statut;
    setCandidature({ ...candidature, statut: newStatus });

    const { error } = await supabase
      .from('candidatures')
      .update({ statut: dbStatus })
      .eq('id', candidature.id);

    if (error) {
      console.error("Error updating status:", error);
      setCandidature({ ...candidature, statut: previousStatus });
      toast.error("Erreur lors de la mise à jour du statut.");
    } else {
      toast.success(`Statut mis à jour : ${newStatus}`);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now(),
        content: newNote,
        author: profile?.first_name || "Admin", 
        date: new Date().toLocaleDateString('fr-FR'),
        dateRelative: "à l'instant"
      };
      setNotes([note, ...notes]);
      setNewNote('');
      toast.success("Note ajoutée");
    }
  };

  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast.info("Note supprimée");
  };

  const handleSendEmail = async () => {
    if (!candidature || !profile?.email || !emailMessage.trim()) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: candidature.email,
          cc: emailCC || undefined,
          subject: emailSubject,
          message: emailMessage,
          replyTo: profile.email,
          senderName: `${profile.first_name} ${profile.last_name}`,
          structuredData: {
            type: "Candidature",
            organisation: candidature.pays_residence,
            whatsapp: candidature.whatsapp
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }

      toast.success("Email envoyé avec succès !");

      if (markAsRespondedAfterSend) {
        await handleStatusChange('Répondu');
      }

      setShowContactModal(false);
      setEmailMessage('');

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de l'email.";
      console.error('Failed to send email:', error);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  // --- Utilities ---
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (statut: string): 'succes' | 'avertissement' | 'info' | 'neutre' => {
    const s = statut.toLowerCase();
    if (s === 'nouveau' || s === 'nouvelle') return 'succes';
    if (s === 'en attente' || s === 'en_attente') return 'avertissement';
    if (s === 'répondu' || s === 'repondu') return 'info';
    if (s === 'archivé' || s === 'archive') return 'neutre';
    return 'neutre';
  };

  const getDisplayStatus = (statut: string) => {
    const s = statut.toLowerCase();
    if (s === 'nouveau' || s === 'nouvelle') return 'Nouveau';
    if (s === 'en_attente') return 'En attente';
    if (s === 'repondu') return 'Répondu';
    if (s === 'archive') return 'Archivé';
    return statut;
  };

  const getTimelineIcon = (icon: string) => {
    switch (icon) {
      case 'submit': return <FileText className="w-4 h-4" strokeWidth={2} />;
      case 'view': return <Eye className="w-4 h-4" strokeWidth={2} />;
      case 'note': return <FileText className="w-4 h-4" strokeWidth={2} />;
      case 'email': return <Mail className="w-4 h-4" strokeWidth={2} />;
      case 'status': return <Check className="w-4 h-4" strokeWidth={2} />;
      default: return <Clock className="w-4 h-4" strokeWidth={2} />;
    }
  };

  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8 animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-neutral-200 rounded-xl" />
            <div className="h-32 bg-neutral-200 rounded-xl" />
          </div>
          <div className="h-64 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-2xl font-bold text-neutral-900">Accès non autorisé</h2>
        <p className="text-neutral-600">Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link href="/">
           <Bouton variant="primaire">Retour à l'accueil</Bouton>        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-neutral-200 rounded-xl" />
            <div className="h-32 bg-neutral-200 rounded-xl" />
          </div>
          <div className="h-64 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!candidature) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-12 h-12 text-neutral-300" />
        <p className="text-neutral-600">Candidature introuvable.</p>
        <Link href="/admin/candidatures">
           <Bouton variant="primaire">Retour à la liste</Bouton>
        </Link>
      </div>
    );
  }

  const timeline: TimelineItem[] = [
    { id: 1, action: "Candidature soumise", timestamp: formatDate(candidature.created_at), icon: "submit" },
  ];

  const initials = candidature.nom_prenom
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const daysSinceSubmission = Math.floor((new Date().getTime() - new Date(candidature.created_at).getTime()) / (1000 * 3600 * 24));

  return (
    <div className="w-full">
      <HeaderAdmin 
        pageTitle="Détail de la candidature"
        breadcrumb={[
          { label: 'Candidatures', href: '/admin/candidatures' }, 
          { label: candidature.nom_prenom }
        ]}
      />

      <div className="pt-28 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 max-w-[1600px]">
          
          {/* LEFT COLUMN */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 border border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-neutral-100">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-2xl font-bold border-2 border-white shadow-sm">
                    {initials}
                  </div>
                  {/* Name & Location */}
                  <div>
                    <h3 className="text-neutral-900 mb-1" style={{ fontSize: '24px', fontWeight: 600 }}>
                      {candidature.nom_prenom}
                    </h3>
                    <p className="text-neutral-600 mb-1 flex items-center gap-2" style={{ fontSize: '15px', fontWeight: 400 }}>
                      <Globe className="w-4 h-4 text-neutral-400" strokeWidth={2} />
                      {candidature.pays_residence}
                    </p>
                    <p className="text-neutral-500 italic text-sm">
                      Inscrit le {formatDate(candidature.created_at)}
                    </p>
                  </div>
                </div>
                {/* Status Badge */}
                <Badge variant={getStatusBadgeVariant(candidature.statut)} size="moyen">
                  {getDisplayStatus(candidature.statut)}
                </Badge>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Email</span>
                    <a href={`mailto:${candidature.email}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary transition-colors font-medium">
                      <Mail className="w-5 h-5 text-primary/60" strokeWidth={2} />
                      <span>{candidature.email}</span>
                    </a>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">WhatsApp</span>
                    <a href={`tel:${candidature.whatsapp}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary transition-colors font-medium">
                      <Phone className="w-5 h-5 text-primary/60" strokeWidth={2} />
                      <span>{candidature.whatsapp}</span>
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  {candidature.linkedin_url && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">LinkedIn</span>
                      <a href={candidature.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-neutral-700 hover:text-primary transition-colors font-medium">
                        <Linkedin className="w-5 h-5 text-[#0A66C2]" strokeWidth={2} />
                        <span className="flex items-center gap-1">
                          Profil Professionnel <ExternalLink className="w-3 h-3" /> <span className="sr-only">(nouvelle fenêtre)</span>
                        </span>
                      </a>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Résidence</span>
                    <div className="flex items-center gap-3 text-neutral-700 font-medium">
                      <MapPin className="w-5 h-5 text-red-500/60" strokeWidth={2} />
                      <span>{candidature.pays_residence}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to Territory */}
              {candidature.lien_territoire && (
                <div className="pt-4 border-t border-neutral-100">
                    <h4 className="text-neutral-900 mb-3 font-semibold text-sm">Lien avec le territoire</h4>
                    <span className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium border border-neutral-200">
                        {candidature.lien_territoire}
                    </span>
                </div>
              )}
            </div>

            {/* Application Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 border border-neutral-200">
              <div className="flex items-start justify-between mb-6">
                <h4 className="text-neutral-900 text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Détails de la candidature
                </h4>
              </div>

              {/* Dynamic Opportunity Info */}
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <p className="text-primary/70 uppercase tracking-widest mb-2 text-[10px] font-bold">ACTION CONCERNÉE</p>
                <h5 className="text-neutral-900 mb-4 font-bold text-xl leading-tight">
                  {candidature.opportunites?.intitule_action || "Candidature spontanée"}
                </h5>
                <Link href={`/admin/opportunites`} className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
                  Voir la fiche de l&apos;action <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Motivation Message */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 border border-neutral-200">
              <h4 className="text-neutral-900 text-lg font-semibold mb-6">Message de motivation</h4>
              <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                <p className="text-neutral-700 whitespace-pre-line text-base leading-relaxed">
                  {candidature.message || "Aucun message fourni."}
                </p>
              </div>
            </div>

            {/* Consent */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${candidature.accord_temoignage ? 'bg-green-100 text-green-600' : 'bg-neutral-200 text-neutral-50'}`}>
                  {candidature.accord_temoignage ? <CheckCircle2 size={24} /> : <X size={24} />}
                </div>
                <div>
                  <h4 className="text-neutral-900 font-semibold mb-1">Autorisation de témoignage</h4>
                  <p className="text-neutral-600 text-sm">
                    {candidature.accord_temoignage 
                      ? "Le candidat autorise la publication de son témoignage si sa contribution aboutit." 
                      : "Le candidat ne souhaite pas que son témoignage soit publié publiquement."}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Action Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            <div className="xl:sticky xl:top-24 space-y-6">
              
              {/* Status Management */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <h4 className="text-neutral-900 mb-4 font-bold text-sm uppercase tracking-wider">État du dossier</h4>
                <div className="mb-6 flex items-center justify-between">
                  <Badge variant={getStatusBadgeVariant(candidature.statut)} size="moyen">
                    {getDisplayStatus(candidature.statut)}
                  </Badge>
                  <span className="text-neutral-500 text-xs font-medium flex items-center gap-1">
                    <Clock size={14} /> {daysSinceSubmission} jours
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-neutral-600 mb-2 text-xs font-bold uppercase">Changer le statut</label>
                    <select
                      value={getDisplayStatus(candidature.statut)}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full h-11 px-4 rounded-lg border-2 border-neutral-200 bg-white text-neutral-900 font-medium cursor-pointer hover:border-primary transition-all focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    >
                      <option value="Nouveau">Nouveau</option>
                      <option value="En attente">En attente</option>
                      <option value="Répondu">Répondu</option>
                      <option value="Archivé">Archivé</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <h4 className="text-neutral-900 mb-4 font-bold text-sm uppercase tracking-wider">Actions</h4>
                <div className="space-y-3">
                  <Bouton variant="primaire" size="moyen" fullWidth onClick={() => setShowContactModal(true)}>
                    <Mail className="w-4 h-4" strokeWidth={2} /> Répondre par email
                  </Bouton>
                  <Bouton variant="secondaire" size="moyen" fullWidth onClick={() => handleStatusChange('Archivé')}>
                    <Archive className="w-4 h-4" strokeWidth={2} /> Archiver le dossier
                  </Bouton>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        if (confirm('Supprimer définitivement cette candidature ? Cette action est irréversible.')) {
                          // Logic
                        }
                      }}
                      className="w-full h-11 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-xs uppercase tracking-widest"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <h4 className="text-neutral-900 mb-4 font-bold text-sm uppercase tracking-wider">Notes internes</h4>
                {notes.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-neutral-50 rounded-lg p-3 relative group border border-neutral-100">
                        <p className="text-neutral-700 mb-2 pr-6 text-sm leading-relaxed">{note.content}</p>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">
                          <span>{note.author}</span>
                          <span>{note.dateRelative}</span>
                        </div>
                        <button onClick={() => handleDeleteNote(note.id)} className="absolute top-2 right-2 w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all" aria-label="Supprimer la note">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Ajouter une observation..."
                    className="w-full h-24 px-3 py-2 rounded-lg border-2 border-neutral-200 resize-none focus:border-primary focus:outline-none transition-all text-sm"
                  />
                  <Bouton variant="tertiaire" size="petit" fullWidth onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Plus className="w-4 h-4" /> Ajouter la note
                  </Bouton>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
                <h4 className="text-neutral-900 mb-4 font-bold text-sm uppercase tracking-wider">Historique</h4>
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div key={item.id} className="relative">
                      {index < timeline.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-neutral-100" />
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-white shadow-sm">
                          {getTimelineIcon(item.icon)}
                        </div>
                        <div className="flex-1">
                          <p className="text-neutral-900 mb-0.5 font-bold text-xs uppercase tracking-tight">{item.action}</p>
                          <p className="text-neutral-400 text-[10px] font-medium">{item.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Contacter le candidat">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <div>
                <h3 className="text-neutral-900 text-xl font-bold">Contacter le candidat</h3>
                <p className="text-neutral-500 text-sm">Envoyé à {candidature.nom_prenom}</p>
              </div>
              <button onClick={() => setShowContactModal(false)} className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-colors" aria-label="Fermer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Destinataire</label>
                  <div className="h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center text-neutral-600 text-sm font-medium">
                    {candidature.email}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">De</label>
                  <div className="h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center text-neutral-600 text-sm font-medium truncate">
                    {profile?.email}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Objet du message</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 font-medium focus:border-primary focus:outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Copie (CC)</label>
                  <input
                    type="text"
                    value={emailCC}
                    onChange={(e) => setEmailCC(e.target.value)}
                    placeholder="email1@ex.com, email2@ex.com"
                    className="w-full h-12 px-4 rounded-xl border-2 border-neutral-200 bg-white text-neutral-900 font-medium focus:border-primary focus:outline-none transition-all text-sm"
                  />
                  <p className="text-[9px] text-neutral-400 ml-1 italic">Séparez plusieurs emails par des virgules</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Bonjour, nous avons bien reçu votre candidature..."
                  className="w-full h-64 px-4 py-4 rounded-xl border-2 border-neutral-200 resize-none focus:border-primary focus:outline-none transition-all text-base leading-relaxed"
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markAsRespondedAfterSend}
                    onChange={(e) => setMarkAsRespondedAfterSend(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-neutral-300 text-primary accent-primary cursor-pointer transition-all"
                  />
                  <span className="text-neutral-700 text-sm font-semibold">Passer automatiquement le statut en &quot;Répondu&quot;</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t border-neutral-100 bg-neutral-50">
              <button 
                onClick={() => setShowContactModal(false)} 
                className="px-6 py-3 text-neutral-600 font-bold text-sm uppercase tracking-widest hover:text-neutral-900 transition-colors"
                disabled={isSending}
              >
                Annuler
              </button>
              <Bouton 
                variant="primaire" 
                size="grand" 
                onClick={handleSendEmail} 
                disabled={!emailMessage.trim() || isSending}
                icon={isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              >
                {isSending ? "Envoi..." : "Envoyer l'email"}
              </Bouton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
