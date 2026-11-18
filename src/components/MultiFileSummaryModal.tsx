import React, { useEffect } from 'react';
import { QuoteSummary } from '../types';
import { formatMXN } from '../utils/pricing';
import { LOGO_ASSET_PATH } from '../utils/exportExcel';
import { Download, X } from 'lucide-react';

interface MultiFileSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: QuoteSummary;
  onExportCsv: () => void;
}

export const MultiFileSummaryModal: React.FC<MultiFileSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  onExportCsv,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-6xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={LOGO_ASSET_PATH}
              alt="Centro de Copiado de Jesús"
              referrerPolicy="no-referrer"
              className="hidden sm:block h-10 w-auto rounded-md object-contain shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="summary-modal-title"
                className="text-lg font-bold text-slate-900 truncate"
              >
                Tabla Resumen Completa por Archivo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Desglose comparativo de páginas, engargolado, precio por libro y
                cobro total por documento.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExportCsv}
              disabled={summary.documents.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-45 rounded-lg inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar a Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {summary.documents.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No hay archivos ni copias manuales cargadas todavía.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Nombre del Documento</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">
                        Págs. B/N
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">
                        Media Tinta
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">
                        Full Color
                      </th>
                      <th className="py-3 px-3 whitespace-nowrap">
                        Engargolado
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">
                        Precio 1 Libro
                      </th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">
                        Juegos
                      </th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">
                        Cobro Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.documents.map((doc) => {
                      const totalBn = doc.bnNormalPerSet + doc.bnPesadaPerSet;
                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 max-w-[260px] truncate">
                              {doc.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {doc.sides === 1 ? '1 Cara' : '2 Caras'} ·{' '}
                              {doc.totalPages} págs. originales
                              {doc.bnPesadaPerSet > 0
                                ? ` · ${doc.bnPesadaPerSet} pesada(s)`
                                : ''}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                            {totalBn}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                            {doc.colorMediaPerSet}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                            {doc.colorFullPerSet}
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-700 whitespace-nowrap">
                            {doc.includeBinding ? (
                              <span className="font-mono tabular-nums">
                                {formatMXN(doc.bindingUnitPrice)} ({doc.physicalSheets}{' '}
                                hjs · ×{doc.bindingSets})
                              </span>
                            ) : (
                              <span className="text-slate-400">No aplica</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                            {formatMXN(doc.totalPerFullBoundSet)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                            {doc.sets}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                            {formatMXN(doc.totalSale)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200 font-bold text-sm">
                      <td className="py-3.5 px-4 text-slate-900">
                        Totales Generales ({summary.documents.length}{' '}
                        {summary.documents.length === 1 ? 'concepto' : 'conceptos'})
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {summary.documents.reduce(
                          (acc, d) => acc + d.bnNormalPerSet + d.bnPesadaPerSet,
                          0
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {summary.documents.reduce(
                          (acc, d) => acc + d.colorMediaPerSet,
                          0
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {summary.documents.reduce(
                          (acc, d) => acc + d.colorFullPerSet,
                          0
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-xs font-mono tabular-nums text-slate-700">
                        {summary.totalBindingSets} engargolados
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-500">
                        —
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-900">
                        {summary.totalSetsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-base text-blue-800 whitespace-nowrap">
                        {formatMXN(summary.totalSale)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
