export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'Admin' | 'Superadmin' | 'Annonceur' | 'user'
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          photo_url: string | null
          status: 'active' | 'inactive' | null
          annonceur_id: string | null
          email_preferences: {
            new_applications?: boolean
            auto_reminders?: boolean
            weekly_summary?: boolean
            platform_updates?: boolean
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'Admin' | 'Superadmin' | 'Annonceur' | 'user'
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          photo_url?: string | null
          status?: 'active' | 'inactive' | null
          annonceur_id?: string | null
          email_preferences?: {
            new_applications?: boolean
            auto_reminders?: boolean
            weekly_summary?: boolean
            platform_updates?: boolean
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'Admin' | 'Superadmin' | 'Annonceur' | 'user'
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          photo_url?: string | null
          status?: 'active' | 'inactive' | null
          annonceur_id?: string | null
          email_preferences?: {
            new_applications?: boolean
            auto_reminders?: boolean
            weekly_summary?: boolean
            platform_updates?: boolean
          } | null
          updated_at?: string
        }
      }
      annonceur_profiles: {
        Row: {
          id: string
          pays: string
          ville: string | null
          statut: string
          nom: string
          adresse: string
          logo_url: string | null
          photo_presentation_url: string | null
          presentation: string
          mot_dirigeant: string
          nom_dirigeant: string
          poste_dirigeant: string
          photo_dirigeant_url: string | null
          site_web: string | null
          facebook: string | null
          linkedin: string | null
          tiktok: string | null
          instagram: string | null
          contact_legal_nom: string
          contact_legal_prenom: string
          contact_legal_fonction: string
          contact_legal_email: string
          contact_legal_whatsapp: string
          points_focaux_diaspora: Array<{
            nom: string
            prenom: string
            fonction: string
            email: string
            whatsapp: string
          }> | null
          emails_destinataires: string
          domaines_action: string[]
          contributions_recherchees: string[]
          nombre_programmes_annuels: string | null
          facilites_offertes: string[]
          facilites_autres: string | null
          pieces_jointes: Array<{
            name: string
            url: string
            type: string
          }> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pays: string
          ville?: string | null
          statut: string
          nom: string
          adresse: string
          logo_url?: string | null
          photo_presentation_url?: string | null
          presentation: string
          mot_dirigeant: string
          nom_dirigeant: string
          poste_dirigeant: string
          photo_dirigeant_url?: string | null
          site_web?: string | null
          facebook?: string | null
          linkedin?: string | null
          tiktok?: string | null
          instagram?: string | null
          contact_legal_nom: string
          contact_legal_prenom: string
          contact_legal_fonction: string
          contact_legal_email: string
          contact_legal_whatsapp: string
          points_focaux_diaspora?: Array<{
            nom: string
            prenom: string
            fonction: string
            email: string
            whatsapp: string
          }> | null
          emails_destinataires: string
          domaines_action: string[]
          contributions_recherchees: string[]
          nombre_programmes_annuels?: string | null
          facilites_offertes: string[]
          facilites_autres?: string | null
          pieces_jointes?: Array<{
            name: string
            url: string
            type: string
          }> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          pays?: string
          ville?: string | null
          statut?: string
          nom?: string
          adresse?: string
          logo_url?: string | null
          photo_presentation_url?: string | null
          presentation?: string
          mot_dirigeant?: string
          nom_dirigeant?: string
          poste_dirigeant?: string
          photo_dirigeant_url?: string | null
          site_web?: string | null
          facebook?: string | null
          linkedin?: string | null
          tiktok?: string | null
          instagram?: string | null
          contact_legal_nom?: string
          contact_legal_prenom?: string
          contact_legal_fonction?: string
          contact_legal_email?: string
          contact_legal_whatsapp?: string
          points_focaux_diaspora?: Array<{
            nom: string
            prenom: string
            fonction: string
            email: string
            whatsapp: string
          }> | null
          emails_destinataires?: string
          domaines_action?: string[]
          contributions_recherchees?: string[]
          nombre_programmes_annuels?: string | null
          facilites_offertes?: string[]
          facilites_autres?: string | null
          pieces_jointes?: Array<{
            name: string
            url: string
            type: string
          }> | null
          updated_at?: string
        }
      }
      opportunites: {
        Row: {
          id: string
          created_at: string
          intitule_action: string
          photo_representation_path: string | null
          domaine_action: string
          public_vise: 'tous' | 'diaspora'
          timing_action: 'permanente' | 'ponctuelle' | 'urgente'
          date_debut: string | null
          date_fin: string | null
          afficher_une: boolean
          action_distance: 'oui' | 'non' | 'partiellement'
          description_generale: string
          impacts_objectifs: string
          details_contributions: string
          contributions_diaspora: Record<string, boolean>
          fichier_technique_paths: string[] | null
          lien_site_fb: string | null
          conditions_mission: string | null
          remuneration_prevue: 'benevole' | 'defraiement-local' | 'defraiement-complet' | 'remuneration' | 'autre' | null
          remuneration_autre: string | null
          detail_remuneration: string | null
          facilites: {
            interlocuteur?: boolean
            travailDistance?: boolean
            assistanceProjet?: boolean
            locauxMateriels?: boolean
            reseauPrestataires?: boolean
            autres?: boolean
          }
          facilites_autres: string | null
          emails_rappel: string | null
          statut_publication: 'brouillon' | 'publie'
          date_publication: string | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          intitule_action: string
          photo_representation_path?: string | null
          domaine_action: string
          public_vise: 'tous' | 'diaspora'
          timing_action: 'permanente' | 'ponctuelle' | 'urgente'
          date_debut?: string | null
          date_fin?: string | null
          afficher_une?: boolean
          action_distance: 'oui' | 'non' | 'partiellement'
          description_generale: string
          impacts_objectifs: string
          details_contributions: string
          contributions_diaspora: Record<string, boolean>
          fichier_technique_paths?: string[] | null
          lien_site_fb?: string | null
          conditions_mission?: string | null
          remuneration_prevue?: 'benevole' | 'defraiement-local' | 'defraiement-complet' | 'remuneration' | 'autre' | null
          remuneration_autre?: string | null
          detail_remuneration?: string | null
          facilites: {
            interlocuteur?: boolean
            travailDistance?: boolean
            assistanceProjet?: boolean
            locauxMateriels?: boolean
            reseauPrestataires?: boolean
            autres?: boolean
          }
          facilites_autres?: string | null
          emails_rappel?: string | null
          statut_publication?: 'brouillon' | 'publie'
          date_publication?: string | null
          created_by: string
        }
        Update: {
          intitule_action?: string
          photo_representation_path?: string | null
          domaine_action?: string
          public_vise?: 'tous' | 'diaspora'
          timing_action?: 'permanente' | 'ponctuelle' | 'urgente'
          date_debut?: string | null
          date_fin?: string | null
          afficher_une?: boolean
          action_distance?: 'oui' | 'non' | 'partiellement'
          description_generale?: string
          impacts_objectifs?: string
          details_contributions?: string
          contributions_diaspora?: Record<string, boolean>
          fichier_technique_paths?: string[] | null
          lien_site_fb?: string | null
          conditions_mission?: string | null
          remuneration_prevue?: 'benevole' | 'defraiement-local' | 'defraiement-complet' | 'remuneration' | 'autre' | null
          remuneration_autre?: string | null
          detail_remuneration?: string | null
          facilites?: {
            interlocuteur?: boolean
            travailDistance?: boolean
            assistanceProjet?: boolean
            locauxMateriels?: boolean
            reseauPrestataires?: boolean
            autres?: boolean
          }
          facilites_autres?: string | null
          emails_rappel?: string | null
          statut_publication?: 'brouillon' | 'publie'
          date_publication?: string | null
          created_by?: string
        }
      }
      opportunite_contacts: {
        Row: {
          id: string
          opportunite_id: string
          nom: string
          email: string
          tel: string
          ordre: number
        }
        Insert: {
          id?: string
          opportunite_id: string
          nom: string
          email: string
          tel: string
          ordre: number
        }
        Update: {
          opportunite_id?: string
          nom?: string
          email?: string
          tel?: string
          ordre?: number
        }
      }
      candidatures: {
        Row: {
          id: number
          created_at: string
          opportunite_id: string
          nom_prenom: string
          pays_residence: string
          email: string
          whatsapp: string
          linkedin_url: string | null
          lien_territoire: string
          message: string
          accord_temoignage: boolean | null
          statut: 'nouvelle' | 'en_attente' | 'repondu' | 'archive'
        }
        Insert: {
          id?: number
          created_at?: string
          opportunite_id: string
          nom_prenom: string
          pays_residence: string
          email: string
          whatsapp: string
          linkedin_url?: string | null
          lien_territoire: string
          message: string
          accord_temoignage?: boolean | null
          statut?: 'nouvelle' | 'en_attente' | 'repondu' | 'archive'
        }
        Update: {
          nom_prenom?: string
          pays_residence?: string
          email?: string
          whatsapp?: string
          linkedin_url?: string | null
          lien_territoire?: string
          message?: string
          accord_temoignage?: boolean | null
          statut?: 'nouvelle' | 'en_attente' | 'repondu' | 'archive'
        }
      }
      actualites: {
        Row: {
          id: string
          created_at: string
          objet: string
          public_vise: string
          public_cible: string | null
          titre: string
          mots_cles: string
          resume: string
          detail: string
          appel_action_texte: string | null
          appel_action_url: string | null
          image_principale_path: string | null
          pieces_jointes_paths: string[] | null
          mairie_emettrice: string
          statut_publication: 'brouillon' | 'publie'
          date_publication: string | null
          prioritaire: boolean
          epingle: boolean
          date_debut: string | null
          date_fin: string | null
          created_by: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          objet: string
          public_vise: string
          public_cible?: string | null
          titre: string
          mots_cles: string
          resume: string
          detail: string
          appel_action_texte?: string | null
          appel_action_url?: string | null
          image_principale_path?: string | null
          pieces_jointes_paths?: string[] | null
          mairie_emettrice: string
          statut_publication?: 'brouillon' | 'publie'
          date_publication?: string | null
          prioritaire?: boolean
          epingle?: boolean
          date_debut?: string | null
          date_fin?: string | null
          created_by: string
          updated_at?: string
        }
        Update: {
          objet?: string
          public_vise?: string
          public_cible?: string | null
          titre?: string
          mots_cles?: string
          resume?: string
          detail?: string
          appel_action_texte?: string | null
          appel_action_url?: string | null
          image_principale_path?: string | null
          pieces_jointes_paths?: string[] | null
          mairie_emettrice?: string
          statut_publication?: 'brouillon' | 'publie'
          date_publication?: string | null
          prioritaire?: boolean
          epingle?: boolean
          date_debut?: string | null
          date_fin?: string | null
          created_by?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'candidature_received' | 'candidature_status_change' | 'candidature_reminder' | 'new_opportunity' | 'system_message'
          title: string
          message: string
          data: {
            candidature_id?: number
            opportunite_id?: string
            candidat_name?: string
            candidat_email?: string
            opportunity_title?: string
            old_status?: string
            new_status?: string
          } | null
          read: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'candidature_received' | 'candidature_status_change' | 'candidature_reminder' | 'new_opportunity' | 'system_message'
          title: string
          message: string
          data?: {
            candidature_id?: number
            opportunite_id?: string
            candidat_name?: string
            candidat_email?: string
            opportunity_title?: string
            old_status?: string
            new_status?: string
          } | null
          read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          read?: boolean
          read_at?: string | null
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          created_at: string
          email: string
          whatsapp: string | null
          ville: string | null
          domaine: string | null
          type_contribution: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          whatsapp?: string | null
          ville?: string | null
          domaine?: string | null
          type_contribution?: string | null
        }
        Update: {
          email?: string
          whatsapp?: string | null
          ville?: string | null
          domaine?: string | null
          type_contribution?: string | null
        }
      }
      static_contents: {
        Row: {
          id: string
          key: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          content?: string
          updated_at?: string
        }
      }
      pre_inscriptions: {
        Row: {
          id: string
          created_at: string
          organisation_type: string
          organisation_name: string | null
          nom: string
          prenom: string
          fonction: string
          pays: string
          whatsapp: string | null
          email: string
          message: string | null
          statut: 'en_attente' | 'approuve' | 'rejete' | 'archive'
        }
        Insert: {
          id?: string
          created_at?: string
          organisation_type: string
          organisation_name?: string | null
          nom: string
          prenom: string
          fonction: string
          pays: string
          whatsapp?: string | null
          email: string
          message?: string | null
          statut?: 'en_attente' | 'approuve' | 'rejete' | 'archive'
        }
        Update: {
          organisation_type?: string
          organisation_name?: string | null
          nom?: string
          prenom?: string
          fonction?: string
          pays?: string
          whatsapp?: string | null
          email?: string
          message?: string | null
          statut?: 'en_attente' | 'approuve' | 'rejete' | 'archive'
        }
      }
      projets_soumis: {
        Row: {
          id: string
          created_at: string
          nom: string
          prenom: string
          pays: string
          email: string
          whatsapp: string | null
          profil_linkedin: string | null
          domaines_action: string[]
          autres_domaine: string | null
          niveau_ciblage: 'toutes' | 'plusieurs-villes'
          ville_specifique: string | null
          villes_multiples: string[] | null
          nature_projet: string[]
          autres_nature: string | null
          message: string | null
          fichiers_joints_urls: string[] | null
          fichiers_joints_noms: string[] | null
          fichiers_joints_tailles: number[] | null
          autorisation_publication: 'oui' | 'non' | null
          statut: string
        }
        Insert: {
          id?: string
          created_at?: string
          nom: string
          prenom: string
          pays: string
          email: string
          whatsapp?: string | null
          profil_linkedin?: string | null
          domaines_action: string[]
          autres_domaine?: string | null
          niveau_ciblage: 'toutes' | 'plusieurs-villes'
          ville_specifique?: string | null
          villes_multiples?: string[] | null
          nature_projet: string[]
          autres_nature?: string | null
          message?: string | null
          fichiers_joints_urls?: string[] | null
          fichiers_joints_noms?: string[] | null
          fichiers_joints_tailles?: number[] | null
          autorisation_publication?: 'oui' | 'non' | null
          statut?: string
        }
        Update: {
          nom?: string
          prenom?: string
          pays?: string
          email?: string
          whatsapp?: string | null
          profil_linkedin?: string | null
          domaines_action?: string[]
          autres_domaine?: string | null
          niveau_ciblage?: 'toutes' | 'plusieurs-villes'
          ville_specifique?: string | null
          villes_multiples?: string[] | null
          nature_projet?: string[]
          autres_nature?: string | null
          message?: string | null
          fichiers_joints_urls?: string[] | null
          fichiers_joints_noms?: string[] | null
          fichiers_joints_tailles?: number[] | null
          autorisation_publication?: 'oui' | 'non' | null
          statut?: string
        }
      }
      profils_soumis: {
        Row: {
          id: string
          created_at: string
          nom: string
          prenom: string
          pays: string
          email: string
          whatsapp: string | null
          profil_linkedin: string | null
          domaines_action: string[]
          autres_domaine: string | null
          contributions_proposees: string[]
          niveau_ciblage: 'toutes' | 'plusieurs-villes'
          ville_specifique: string | null
          villes_multiples: string[] | null
          message: string | null
          fichiers_joints_urls: string[] | null
          fichiers_joints_noms: string[] | null
          fichiers_joints_tailles: number[] | null
          autorisation_publication: 'oui' | 'non'
          statut: string
        }
        Insert: {
          id?: string
          created_at?: string
          nom: string
          prenom: string
          pays: string
          email: string
          whatsapp?: string | null
          profil_linkedin?: string | null
          domaines_action: string[]
          autres_domaine?: string | null
          contributions_proposees: string[]
          niveau_ciblage: 'toutes' | 'plusieurs-villes'
          ville_specifique?: string | null
          villes_multiples?: string[] | null
          message?: string | null
          fichiers_joints_urls?: string[] | null
          fichiers_joints_noms?: string[] | null
          fichiers_joints_tailles?: number[] | null
          autorisation_publication: 'oui' | 'non'
          statut?: string
        }
        Update: {
          nom?: string
          prenom?: string
          pays?: string
          email?: string
          whatsapp?: string | null
          profil_linkedin?: string | null
          domaines_action?: string[]
          autres_domaine?: string | null
          contributions_proposees?: string[]
          niveau_ciblage?: 'toutes' | 'plusieurs-villes'
          ville_specifique?: string | null
          villes_multiples?: string[] | null
          message?: string | null
          fichiers_joints_urls?: string[] | null
          fichiers_joints_noms?: string[] | null
          fichiers_joints_tailles?: number[] | null
          autorisation_publication?: 'oui' | 'non'
          statut?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
