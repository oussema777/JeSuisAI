'use client';

import React, { useState } from 'react';
import { Download, Upload, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function BulkContentManager() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const handleExport = async () => {
    try {
      setExporting(true);
      toast.info('Préparation de l\'exportation...');

      // 1. Fetch data
      const [
        { data: staticContents },
        { data: opportunities },
        { data: actualites },
        { data: organisations }
      ] = await Promise.all([
        supabase.from('static_contents').select('id, key, content'),
        supabase.from('opportunites').select('id, intitule_action, domaine_action, description_generale, impacts_objectifs, details_contributions, conditions_mission'),
        supabase.from('actualites').select('id, titre, resume, detail'),
        supabase.from('annonceur_profiles').select('id, nom, presentation, mot_dirigeant, nom_dirigeant, poste_dirigeant')
      ]);

      // 2. Format for Excel
      const wb = XLSX.utils.book_new();

      // Sheet 1: Contenus Statiques
      const wsStatic = XLSX.utils.json_to_sheet(staticContents?.map(c => ({
        ID: c.id,
        Cle: c.key,
        Contenu: typeof c.content === 'string' ? c.content : JSON.stringify(c.content, null, 2)
      })) || []);
      XLSX.utils.book_append_sheet(wb, wsStatic, "Contenus Statiques");

      // Sheet 2: Missions
      const wsMissions = XLSX.utils.json_to_sheet(opportunities?.map(o => ({
        ID: o.id,
        Titre: o.intitule_action,
        Domaine: o.domaine_action,
        Description: o.description_generale,
        Impacts: o.impacts_objectifs,
        Contributions: o.details_contributions,
        Conditions: o.conditions_mission
      })) || []);
      XLSX.utils.book_append_sheet(wb, wsMissions, "Missions");

      // Sheet 3: Actualites
      const wsNews = XLSX.utils.json_to_sheet(actualites?.map(a => ({
        ID: a.id,
        Titre: a.titre,
        Resume: a.resume,
        Detail: a.detail
      })) || []);
      XLSX.utils.book_append_sheet(wb, wsNews, "Actualites");

      // Sheet 4: Organisations
      const wsOrgs = XLSX.utils.json_to_sheet(organisations?.map(org => ({
        ID: org.id,
        Nom: org.nom,
        Presentation: org.presentation,
        Mot_Representant_Legal: org.mot_dirigeant,
        Nom_Representant_Legal: org.nom_dirigeant,
        Poste_Representant_Legal: org.poste_dirigeant
      })) || []);
      XLSX.utils.book_append_sheet(wb, wsOrgs, "Organisations");

      // 3. Download
      XLSX.writeFile(wb, `Contenus_JeSuisAuCameroun_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Exportation réussie !');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'exportation');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      toast.info('Analyse du fichier...');

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          
          let updatedCount = 0;

          // Helper to update table
          const updateTable = async (sheetName: string, tableName: string, fieldMapping: Record<string, string>) => {
            const ws = wb.Sheets[sheetName];
            if (!ws) return;
            
            const data = XLSX.utils.sheet_to_json(ws) as any[];
            for (const row of data) {
              const id = row.ID;
              if (!id) continue;

              const updateData: any = {};
              for (const [excelCol, dbField] of Object.entries(fieldMapping)) {
                if (row[excelCol] !== undefined) {
                  // Special case for static_contents JSON
                  if (tableName === 'static_contents' && dbField === 'content') {
                    try {
                      updateData[dbField] = JSON.parse(row[excelCol]);
                    } catch {
                      updateData[dbField] = row[excelCol];
                    }
                  } else {
                    updateData[dbField] = row[excelCol];
                  }
                }
              }

              if (Object.keys(updateData).length > 0) {
                const { error } = await supabase
                  .from(tableName as any)
                  .update(updateData)
                  .eq('id', id);
                
                if (!error) updatedCount++;
                else console.error(`Error updating ${tableName} ID ${id}:`, error);
              }
            }
          };

          // Process each sheet
          await updateTable('Contenus Statiques', 'static_contents', { 'Contenu': 'content' });
          await updateTable('Missions', 'opportunites', { 
            'Titre': 'intitule_action',
            'Domaine': 'domaine_action',
            'Description': 'description_generale',
            'Impacts': 'impacts_objectifs',
            'Contributions': 'details_contributions',
            'Conditions': 'conditions_mission'
          });
          await updateTable('Actualites', 'actualites', {
            'Titre': 'titre',
            'Resume': 'resume',
            'Detail': 'detail'
          });
          await updateTable('Organisations', 'annonceur_profiles', {
            'Nom': 'nom',
            'Presentation': 'presentation',
            'Mot_Representant_Legal': 'mot_dirigeant',
            'Nom_Representant_Legal': 'nom_dirigeant',
            'Poste_Representant_Legal': 'poste_dirigeant'
          });

          toast.success(`${updatedCount} entrées mises à jour avec succès !`);
          // Reset input
          e.target.value = '';
        } catch (err) {
          console.error('Import processing error:', err);
          toast.error('Erreur lors du traitement du fichier');
        } finally {
          setImporting(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erreur lors de l\'importation');
      setImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
        <h2 className="text-xl font-bold text-neutral-900">Correction de Contenu en Masse</h2>
        <p className="text-neutral-600 text-sm mt-1">
          Exportez tout le contenu du site vers Excel, modifiez-le, puis réimportez-le pour appliquer les changements instantanément.
        </p>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="flex flex-col items-center p-6 border-2 border-dashed border-neutral-200 rounded-xl hover:border-primary/50 transition-colors bg-neutral-50/30 group">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">1. Exporter le contenu</h3>
          <p className="text-neutral-600 text-center text-sm mb-6">
            Téléchargez un fichier Excel contenant tous les textes modifiables de la plateforme.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exportation en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Télécharger le template Excel
              </>
            )}
          </button>
        </div>

        {/* Import Section */}
        <div className="flex flex-col items-center p-6 border-2 border-dashed border-neutral-200 rounded-xl hover:border-accent/50 transition-colors bg-neutral-50/30 group">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">2. Importer les corrections</h3>
          <p className="text-neutral-600 text-center text-sm mb-6">
            Une fois vos corrections terminées, glissez-déposez le fichier ici pour mettre à jour le site.
          </p>
          
          <label className="w-full">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleImport}
              disabled={importing}
            />
            <div className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${importing ? 'bg-neutral-100 text-neutral-400' : 'bg-accent text-white hover:bg-accent-dark cursor-pointer'} rounded-lg font-semibold transition-colors`}>
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Sélectionner le fichier corrigé
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 p-6 flex gap-4">
        <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Conseils importants :</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Ne modifiez pas la colonne <strong>ID</strong>, elle est utilisée pour identifier le contenu à mettre à jour.</li>
            <li>Le contenu peut contenir du formatage HTML ou Markdown selon les sections.</li>
            <li>Pour les contenus complexes (JSON), gardez la structure intacte.</li>
            <li>Faites une sauvegarde (export) avant chaque import massif par sécurité.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
