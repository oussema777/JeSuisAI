# ✅ Quick Fix List (Objectif 09/02 & 11/02)

## Sécurité (Immédiat)
- [ ] **SEC-01** : Sécuriser `/api/send-email` (Vérifier session Supabase).
- [ ] **SEC-02** : Créer la migration SQL pour les politiques RLS (`opportunites`, `candidatures`, `profiles`).
- [ ] **SEC-03** : Mettre à jour `middleware.ts` pour vérifier le flag `is_admin` (ou similaire) dans la table `profiles`.
- [ ] **SEC-04** : Nettoyer/Supprimer les routes de debug (`init-opportunites`).

## Backend & Logique (Objectif 09/02)
- [x] **BE-01** : Vérifier le schéma complet "Annonceur" vs "Mairie" (Aligné sur `annonceur_profiles`).
- [x] **BE-04** : Implémenter le système de pré-inscription (Table `pre_inscriptions`).
- [x] **BE-05** : Ajouter le champ "Emails rappel" (14 jours) pour les missions.
- [ ] **BE-02** : Centraliser les appels Supabase dans `lib/services/` pour les Missions et Candidatures.
- [ ] **BE-03** : Ajouter une validation des formulaires côté serveur (Zod ou simple checks).

## Emailing (Objectif 11/02)
- [x] **ML-03** : Mise à jour du Cron Job pour inclure les emails de rappel supplémentaires.
- [ ] **ML-01** : Créer les templates HTML pour les notifications (Candidature reçue, Projet soumis).
- [ ] **ML-02** : Tester l'envoi réel avec un domaine de test (si disponible).

## UI & UX (En cours)
- [x] **UI-01** : Renommer "Annonce" en "Action" sur tout le Dashboard.
- [x] **UI-02** : Implémenter l'export Excel multi-feuilles sur le Dashboard.
- [x] **UI-03** : Harmoniser les formulaires publics (Grilles pour Domaines/Natures).
- [x] **UI-04** : Refactoriser la page de détail Actualité (Données dynamiques Supabase).
- [x] **UI-05** : Ajouter le CTA orange "Fiche Annonceur" dans la Sidebar.
- [x] **UI-08** : Refonte de la page de Login avec toggle Inscription.
- [x] **UI-09** : Création de l'interface Superadmin "Gestion Inscriptions".
- [ ] **UI-06** : Audit de la Sidebar Admin sur mobile (chevauchements).
- [ ] **UI-07** : Test de la grille de listing sur petits écrans.

# 🏁 Terminé (26/02/2026)
- **Refonte Auth & Navigation** : Logo agrandi sur la page Login, messages mis à jour et intégration de la Navbar globale. Réorganisation du routage via le groupe `(public)` pour garantir l'affichage du Header/Footer sur toutes les pages.
- **CMS Superadmin** : Intégration complète de la gestion des contenus pour "Comment ça marche" (4 étapes + 3 options de contribution), "À Propos" (écosystème + membres) et gestion directe de la FAQ depuis la configuration landing.
- **Dashboard Admin** : Mise à jour des messages de bienvenue, des actions rapides et des métriques pour un alignement parfait avec le cahier des charges. Standardisation de la terminologie "Télécharger" (XLSX).
- **Formulaires & UX** : Simplification des formulaires de soumission (Profil/Projet) avec contact WhatsApp optionnel pour la confidentialité. Mise à jour des libellés et des messages de succès sur l'ensemble de la plateforme.

# 🏁 Terminé (25/02/2026)
- **Sécurité & Permissions** : Correction des politiques RLS pour la table `annonceur_profiles` permettant aux Administrateurs, Superadmins et Annonceurs liés de créer et mettre à jour leur fiche.
- **UI Fiche Annonceur** : Mise à jour du frontend (`FicheAnnonceur.tsx`) pour autoriser le rôle `Annonceur` à éditer les informations de sa propre fiche.

# 🏁 Terminé (14/02/2026)
- **Stabilité Auth** : Optimisation du chargement du profil (timeout 10s, fallback léger, verrou de concurrence).
- **Système d'Inscription** : Mise en place complète du flux de pré-inscription (Formulaire login, Table DB, Gestion Superadmin).
- **Missions & Rappels** : Ajout du champ "Emails supplémentaire" et mise à jour de la logique de rappel à 14 jours (Cron).
- **Build & TypeScript** : Correction des erreurs `useSearchParams` (Suspense), `withTimeout` (Type casting) et `ville/region` (Schema drift).
- **UI Polishing** : Alignement des icônes d'inputs et espacement optimisé sur la page Détail Candidature.
- **Gestion Contenus Statiques** : Implémentation complète de l'interface Superadmin pour Landing, Première Visite, À Propos, Organisations, Mentions Légales, FAQ et CGU. Refactorisation des pages publiques pour consommer ces données dynamiques via Supabase.

# 🏁 Terminé (07/02/2026)
- Renommage "Créer une Annonce" -> "Créer une Action" (Dashboard & Gestion Actions).
- Fonctionnalité d'exportation de données (XLSX) opérationnelle.
- Mise en place du Toaster global (Sonner) pour le feedback utilisateur.
- Refonte visuelle des grilles de sélection dans "Soumettre Projet" et "Soumettre Profil".
- Correction de l'erreur runtime Next.js sur les dimensions d'images dans DetailActualite.
- Integration de la Navbar platforme sur les pages de détail actualités.
- Deep linking pour la Fiche Annonceur via la Sidebar.