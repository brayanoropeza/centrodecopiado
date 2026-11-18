import React from 'react';
import {
  GlobalQuoteConfig,
  InkMode,
  ManualCopiesInput,
  PaperSize,
  PrintSides,
} from '../types';
import { Copy, Layers, RotateCcw, Zap } from 'lucide-react';

interface GlobalSidebarProps {
  config: GlobalQuoteConfig;
  onChangeConfig: (next: GlobalQuoteConfig) => void;
  manual: ManualCopiesInput;
  onChangeManual: (next: ManualCopiesInput) => void;
  fileCount: number;
  onApplyGlobalToFiles: () => void;
  onResetManual: () => void;
}

export const GlobalSidebar: React.FC<GlobalSidebarProps> = ({
  config,
  onChangeConfig,
  manual,
  onChangeManual,
  fileCount,
  onApplyGlobalToFiles,
  onResetManual,
}) => {
  const update = <K extends keyof GlobalQuoteConfig>(
    key: K,
    value: GlobalQuoteConfig[K]
  ) => {
    const next = { ...config, [key]: value };
    if (key === 'sets') {
      const setsNum = Math.max(1, Number(value) || 1);
      next.sets = setsNum;
      if (next.bindingSets > setsNum) {
        next.bindingSets = setsNum;
      }
      if (next.includeBinding && next.bindingSets === 0) {
        next.bindingSets = setsNum;
      }
    }
    if (key === 'includeBinding') {
      if (value && next.bindingSets === 0) {
        next.bindingSets = next.sets;
      }
    }
    onChangeConfig(next);
  };

  return (
    <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 space-y-5">
      {/* Parámetros Globales */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Parámetros Globales
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ajustes base para nuevos archivos y copias físicas
            </p>
          </div>
        </div>

        {/* 1. Modo de Tinta */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Modo de Tinta
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { value: 'bn', label: 'Todo B/N' },
                { value: 'color', label: 'A Color' },
              ] as { value: InkMode; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('inkMode', opt.value)}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  config.inkMode === opt.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Tamaño de Papel */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Tamaño de Papel
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { value: 'carta', label: 'Carta' },
                { value: 'oficio', label: 'Oficio' },
                { value: 'tabloide', label: 'Tabloide' },
              ] as { value: PaperSize; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('paperSize', opt.value)}
                className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  config.paperSize === opt.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Modo de Impresión (Caras) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Modo de Impresión (Caras)
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { value: 1, label: '1 Cara (Sencilla)' },
                { value: 2, label: '2 Caras (Dúplex)' },
              ] as { value: PrintSides; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('sides', opt.value)}
                className={`py-2 px-2.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  config.sides === opt.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Número de Juegos (Copias) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="global-sets"
              className="text-xs font-semibold text-slate-700"
            >
              Número de Juegos (Copias)
            </label>
            <span className="text-xs text-slate-500">Multiplicador</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update('sets', Math.max(1, config.sets - 1))}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              aria-label="Disminuir juegos"
            >
              −
            </button>
            <input
              id="global-sets"
              type="number"
              min={1}
              max={9999}
              value={config.sets}
              onChange={(e) =>
                update('sets', Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="h-10 flex-1 text-center font-mono tabular-nums text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
            <button
              type="button"
              onClick={() => update('sets', config.sets + 1)}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              aria-label="Aumentar juegos"
            >
              +
            </button>
          </div>
        </div>

        {/* 5. Engargolado */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.includeBinding}
              onChange={(e) => update('includeBinding', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-800">
              Incluir Engargolado
            </span>
          </label>

          {config.includeBinding && (
            <div className="pl-7 space-y-1.5">
              <label
                htmlFor="global-binding-sets"
                className="block text-xs text-slate-600"
              >
                ¿Cuántos juegos se engargolan? (máx. {config.sets})
              </label>
              <input
                id="global-binding-sets"
                type="number"
                min={0}
                max={config.sets}
                value={config.bindingSets}
                onChange={(e) => {
                  const val = Math.max(
                    0,
                    Math.min(config.sets, parseInt(e.target.value, 10) || 0)
                  );
                  update('bindingSets', val);
                }}
                className="h-9 w-full px-3 font-mono tabular-nums text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          )}
        </div>

        {/* 6. Modo Lectura Rápida / No considerar páginas negras */}
        <div className="pt-3 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.ignoreBlackPages}
              onChange={(e) => update('ignoreBlackPages', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                No considerar páginas negras
              </span>
              <span className="block text-xs text-slate-500 leading-relaxed">
                Solo contar páginas al subir archivos (lectura instantánea) y
                cobrar hojas pesadas como B/N normal.
              </span>
            </div>
          </label>
        </div>

        {fileCount > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onApplyGlobalToFiles}
              className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              Aplicar parámetros a {fileCount}{' '}
              {fileCount === 1 ? 'archivo' : 'archivos'}
            </button>
          </div>
        )}
      </section>

      {/* Copias Físicas Extras / Ingreso Manual */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-slate-500 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900">
              Copias Físicas / Manual
            </h2>
          </div>
          {(manual.bnNormalPages > 0 ||
            manual.secondaryPages > 0 ||
            manual.colorFullPages > 0) && (
            <button
              type="button"
              onClick={onResetManual}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Suma copias de originales físicos sin subir archivo. Usa el tamaño,
          caras, juegos y engargolado globales.
        </p>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="manual-bn-normal"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              {config.inkMode === 'bn'
                ? 'Páginas Copia Normal B/N (≤50%)'
                : 'Páginas Texto B/N'}
            </label>
            <input
              id="manual-bn-normal"
              type="number"
              min={0}
              value={manual.bnNormalPages || ''}
              placeholder="0"
              onChange={(e) =>
                onChangeManual({
                  ...manual,
                  bnNormalPages: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              className="h-10 w-full px-3 font-mono tabular-nums text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="manual-secondary"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              {config.inkMode === 'bn'
                ? 'Páginas Hoja Pesada B/N (>50%)'
                : 'Páginas Media Tinta Color'}
            </label>
            <input
              id="manual-secondary"
              type="number"
              min={0}
              value={manual.secondaryPages || ''}
              placeholder="0"
              onChange={(e) =>
                onChangeManual({
                  ...manual,
                  secondaryPages: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              className="h-10 w-full px-3 font-mono tabular-nums text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {config.inkMode === 'color' && (
            <div>
              <label
                htmlFor="manual-color-full"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Páginas Full Color (&gt;35% color)
              </label>
              <input
                id="manual-color-full"
                type="number"
                min={0}
                value={manual.colorFullPages || ''}
                placeholder="0"
                onChange={(e) =>
                  onChangeManual({
                    ...manual,
                    colorFullPages: Math.max(
                      0,
                      parseInt(e.target.value, 10) || 0
                    ),
                  })
                }
                className="h-10 w-full px-3 font-mono tabular-nums text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          )}
        </div>
      </section>
    </aside>
  );
};
