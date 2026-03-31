import { X, Download } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface ExportModalProps {
  title: string;
  filterOptions: FilterOption[];
  exportFilter: string;
  setExportFilter: (value: string) => void;
  onExport: () => void;
  onClose: () => void;
  exportLoading: boolean;
  description?: string;
  variant?: 'select' | 'buttons';
}

export const ExportModal = ({
  title,
  filterOptions,
  exportFilter,
  setExportFilter,
  onExport,
  onClose,
  exportLoading,
  description,
  variant = 'select',
}: ExportModalProps) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-label={title || "Télécharger les données"}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <label className="block mb-2 text-sm font-medium text-neutral-700">
          Filtrer par statut
        </label>

        {variant === 'select' ? (
          <select
            value={exportFilter}
            onChange={(e) => setExportFilter(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {filterOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setExportFilter(option.id)}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                  exportFilter === option.id
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-neutral-100 text-neutral-700 hover:border-neutral-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {description && (
          <p className="mt-3 text-xs text-neutral-500">{description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-white transition-colors font-medium"
        >
          Annuler
        </button>
        <button
          onClick={onExport}
          disabled={exportLoading}
          className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {exportLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Téléchargement...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Télécharger
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
