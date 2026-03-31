'use client';

import { TableauDeBord } from '@/app/pages/TableauDeBord'; // Adjust path if needed
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';

export default function TableauDeBordPage() {
  const router = useRouter();

  // Central navigation handler used by TableauDeBord
  const handleNavigate = async (page: string, params?: any) => {
    switch (page) {
      case 'admin-creer-opportunite':
        router.push('/admin/opportunites/creer');
        break;
      case 'admin-creer-actualite':
        router.push('/admin/actualites/creer');
        break;
      case 'admin-opportunites':
        router.push('/admin/opportunites');
        break;
      case 'admin-candidatures':
        router.push('/admin/candidatures');
        break;
      case 'admin-profils':
        router.push('/admin/profilesoumis');
        break;
      case 'admin-projets':
        router.push('/admin/projetsoumis');
        break;
      case 'admin-parametres':
        router.push('/admin/parametres');
        break;
      case 'detail-candidature':
        if (params?.applicationId) {
          router.push(`/admin/candidatures/${params.applicationId}`);
        }
        break;
      case 'admin-aide':
        router.push('/contact');
        break;
      case 'admin-exporter-donnees':
        if (!params?.supabase) {
          toast.error("Erreur d'initialisation de la base de données");
          return;
        }

        const exportToastId = toast.loading("Préparation de l'export...");

        try {
          // Fetch data for multiple tables
          const [
            { data: opportunites },
            { data: candidatures },
            { data: profiles }
          ] = await Promise.all([
            params.supabase.from('opportunites').select('*'),
            params.supabase.from('candidatures').select('*'),
            params.supabase.from('profiles').select('*')
          ]);

          // Create workbook
          const XLSX = await import('xlsx');
          const wb = XLSX.utils.book_new();

          // Add sheets
          if (opportunites) {
            const wsOps = XLSX.utils.json_to_sheet(opportunites);
            XLSX.utils.book_append_sheet(wb, wsOps, "Opportunités");
          }
          if (candidatures) {
            const wsCand = XLSX.utils.json_to_sheet(candidatures);
            XLSX.utils.book_append_sheet(wb, wsCand, "Candidatures");
          }
          if (profiles) {
            const wsProf = XLSX.utils.json_to_sheet(profiles);
            XLSX.utils.book_append_sheet(wb, wsProf, "Utilisateurs");
          }

          // Export file
          XLSX.writeFile(wb, `Export_JeSuisAuCameroun_${new_date_string()}.xlsx`);
          
          toast.success("Données exportées avec succès !", { id: exportToastId });
        } catch (error) {
          console.error("Export error:", error);
          toast.error("Échec de l'export des données", { id: exportToastId });
        }
        break;
      default:
        console.warn('Unknown navigation page:', page);
    }
  };

  const new_date_string = () => {
    return new Date().toISOString().split('T')[0];
  };

  return <TableauDeBord onNavigate={handleNavigate} />;
}