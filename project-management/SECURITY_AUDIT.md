# 🔐 Rapport d'Audit Sécurité (07/02/2026)

## 🚨 Risques Critiques

### 1. API d'Email Non Sécurisée (`/api/send-email`)
- **Problème** : La route est publique et ne vérifie pas l'identité de l'expéditeur.
- **Risque** : Spam, détournement de compte Resend, coûts élevés.
- **Solution** : Ajouter une vérification de session via `supabase.auth.getUser()`.

### 2. Exposition de Logiciels d'Administration (`/admin/init-opportunites`)
- **Problème** : Utilisation de la `SERVICE_ROLE_KEY` dans une route GET accessible via le navigateur.
- **Risque** : Modification non autorisée de la base de données si l'URL est découverte.
- **Solution** : Supprimer après usage ou restreindre aux scripts serveurs non exposés.

### 3. Absence de Politiques RLS (Row Level Security)
- **Problème** : Pas de définition de RLS dans les migrations locales pour les tables `opportunites`, `candidatures`, `profiles`.
- **Risque** : Accès total aux données via la clé `anon` si non configuré manuellement sur le dashboard Supabase.
- **Solution** : Créer une migration SQL définissant les politiques `SELECT`, `INSERT`, `UPDATE` par rôle.

## 📋 Observations Techniques
- **Auth Middleware** : Protège bien les routes `/admin/*`, mais ne vérifie pas encore les rôles (Admin vs User).
- **Emailing** : Actuellement en mode "onboarding" (Resend). Nécessite un domaine vérifié pour le Go-Live.
- **Logique Métier** : Très concentrée côté client (React Pages). Une centralisation dans une couche `services` améliorerait la sécurité.
