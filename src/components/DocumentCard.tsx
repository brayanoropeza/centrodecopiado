import React from 'react';
import {
  DocumentQuoteResult,
  FileInkOverride,
  PrintSides,
  UploadedDocument,
} from '../types';
import { formatMXN, getPhysicalSheets } from '../utils/pricing';
import { FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

interface DocumentCardProps {
  doc: UploadedDocument;
  quote: DocumentQuoteResult | undefined;
  onUpdate: (id: string, patch: Partial<UploadedDocument>) => void;
  onRemove: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  quote,
  onUpdate,
  onRemove,
}) => {
  const physicalSheets = getPhysicalSheets(doc.totalPages, doc.sides);

  const handleSetsChange = (nextSets: number) => {
    const clamped = Math.max(1, nextSets);
    const patch: Partial<UploadedDocument> = { sets: clamped };
    if (doc.bindingSets > clamped) {
      patch.bindingSets = clamped;
    }
    onUpdate(doc.id, patch);
  };

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5">
      {/* Miniatura 130x170 */}
      <div className="w-[92px] sm:w-[104px] aspect-[130/170] shrink-0 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center self-start">
        {doc.thumbnailDataUrl ? (
          <img
            src={doc.thumbnailDataUrl}
            alt={`Portada de ${doc.name}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain bg-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 p-2 text-center">
            {doc.fileType === 'pdf' ? (
              <FileText className="w-7 h-7" />
            ) : (
              <ImageIcon className="w-7 h-7" />
            )}
            <span className="text-[11px] font-medium uppercase">
              {doc.fileType}
            </span>
          </div>
        )}
      </div>

      {/* Contenido y Controles */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
        {/* Cabecera del archivo */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="text-sm sm:text-base font-bold text-slate-900 truncate"
              title={doc.name}
            >
              {doc.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1 font-mono tabular-nums">
              <span>
                {doc.totalPages} {doc.totalPages === 1 ? 'página' : 'páginas'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {physicalSheets} {physicalSheets === 1 ? 'hoja física' : 'hojas físicas'}
              </span>
              {doc.analyzedFast && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans text-amber-700 font-medium">
                    Lectura rápida
                  </span>
                </>
              )}
            </div>

            {/* Desglose de clasificación por página */}
            {quote && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 mt-2">
                {quote.bnNormalPerSet > 0 && (
                  <span>
                    B/N Normal:{' '}
                    <strong className="font-mono tabular-nums text-slate-900">
                      {quote.bnNormalPerSet}
                    </strong>
                  </span>
                )}
                {quote.bnPesadaPerSet > 0 && (
                  <span>
                    Hoja Pesada:{' '}
                    <strong className="font-mono tabular-nums text-slate-900">
                      {quote.bnPesadaPerSet}
                    </strong>
                  </span>
                )}
                {quote.colorMediaPerSet > 0 && (
                  <span>
                    Media Color:{' '}
                    <strong className="font-mono tabular-nums text-blue-700">
                      {quote.colorMediaPerSet}
                    </strong>
                  </span>
                )}
                {quote.colorFullPerSet > 0 && (
                  <span>
                    Full Color:{' '}
                    <strong className="font-mono tabular-nums text-blue-700">
                      {quote.colorFullPerSet}
                    </strong>
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(doc.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Eliminar archivo"
            aria-label={`Eliminar ${doc.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Controles individuales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Caras */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Impresión
            </label>
            <select
              value={doc.sides}
              onChange={(e) =>
                onUpdate(doc.id, {
                  sides: Number(e.target.value) as PrintSides,
                })
              }
              className="h-9 w-full px-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value={1}>1 Cara (Sencilla)</option>
              <option value={2}>2 Caras (Dúplex)</option>
            </select>
          </div>

          {/* Tinta individual */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Modo de Tinta
            </label>
            <select
              value={doc.inkOverride}
              onChange={(e) =>
                onUpdate(doc.id, {
                  inkOverride: e.target.value as FileInkOverride,
                })
              }
              className="h-9 w-full px-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="auto">Auto (Global)</option>
              <option value="bn">Forzar B/N</option>
              <option value="color">Forzar Color</option>
            </select>
          </div>

          {/* Juegos */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Juegos (Copias)
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleSetsChange(doc.sets - 1)}
                className="h-9 w-8 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-l-lg text-slate-700 font-semibold cursor-pointer"
                aria-label="Restar juego"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={doc.sets}
                onChange={(e) =>
                  handleSetsChange(parseInt(e.target.value, 10) || 1)
                }
                className="h-9 w-full min-w-[44px] text-center font-mono tabular-nums text-xs font-semibold border-y border-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSetsChange(doc.sets + 1)}
                className="h-9 w-8 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-r-lg text-slate-700 font-semibold cursor-pointer"
                aria-label="Sumar juego"
              >
                +
              </button>
            </div>
          </div>

          {/* Engargolado individual */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Engargolado
            </label>
            <div className="flex items-center gap-2 h-9">
              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={doc.includeBinding}
                  onChange={(e) =>
                    onUpdate(doc.id, {
                      includeBinding: e.target.checked,
                      bindingSets: e.target.checked
                        ? doc.bindingSets || doc.sets
                        : 0,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
                />
                Sí
              </label>
              {doc.includeBinding && (
                <input
                  type="number"
                  min={0}
                  max={doc.sets}
                  value={doc.bindingSets}
                  onChange={(e) =>
                    onUpdate(doc.id, {
                      bindingSets: Math.max(
                        0,
                        Math.min(doc.sets, parseInt(e.target.value, 10) || 0)
                      ),
                    })
                  }
                  title="Cantidad de juegos a engargolar"
                  className="h-9 w-16 px-2 text-center font-mono tabular-nums text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              )}
            </div>
          </div>
        </div>

        {/* Pie financiero de la tarjeta */}
        {quote && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
              <span>
                Por pieza/libro:{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {formatMXN(quote.totalPerFullBoundSet)}
                </strong>
              </span>
              {quote.includeBinding && (
                <span>
                  Engargolado:{' '}
                  <strong className="font-mono tabular-nums text-slate-900">
                    {formatMXN(quote.bindingUnitPrice)} × {quote.bindingSets}
                  </strong>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-slate-500">Total documento:</span>
              <span className="font-mono tabular-nums text-base font-bold text-slate-900">
                {formatMXN(quote.totalSale)}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
