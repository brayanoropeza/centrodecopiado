import React, { useRef, useState } from 'react';
import { AnalysisProgress } from '../types';
import { AlertCircle, FileUp, Loader2, Zap } from 'lucide-react';

interface FileUploadZoneProps {
  fastMode: boolean;
  progress: AnalysisProgress;
  errors: string[];
  onDismissErrors: () => void;
  onFilesSelected: (files: File[]) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  fastMode,
  progress,
  errors,
  onDismissErrors,
  onFilesSelected,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!progress.active) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (progress.active) return;
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      onFilesSelected(dropped);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      onFilesSelected(selected);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !progress.active && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !progress.active) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`relative rounded-xl border-2 border-dashed transition-colors p-6 sm:p-8 text-center cursor-pointer ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/70'
        } ${progress.active ? 'pointer-events-none opacity-85' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            {progress.active ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <FileUp className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Arrastra tus archivos PDF o Imágenes aquí
            </h3>
            <p className="text-sm text-slate-500">
              o haz clic para explorar en tu equipo (selección múltiple: PDF,
              PNG, JPG, JPEG)
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
            {fastMode ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                <Zap className="w-3.5 h-3.5" />
                Modo Lectura Rápida activo — conteo instantáneo sin análisis de
                cobertura
              </span>
            ) : (
              <span>
                Modo Análisis Normal · Inspección de cobertura de tinta por
                píxel y detección automática de color
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso interactiva */}
      {progress.active && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="w-4 h-4 text-blue-700 animate-spin shrink-0" />
              <span className="font-semibold text-slate-800 truncate">
                Procesando: {progress.currentFile}
              </span>
              {progress.totalPages > 1 && (
                <span className="text-slate-500 font-mono tabular-nums whitespace-nowrap shrink-0">
                  Página {progress.currentPage} de {progress.totalPages}
                </span>
              )}
            </div>
            <span className="font-mono tabular-nums font-bold text-blue-700 shrink-0">
              {progress.percent}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all duration-150 rounded-full"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Errores de carga */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <ul className="space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={onDismissErrors}
            className="text-xs font-semibold text-red-700 hover:text-red-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};
