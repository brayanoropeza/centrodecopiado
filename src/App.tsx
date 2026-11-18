import { useMemo, useState } from 'react';
import {
  AnalysisProgress,
  FreeTableRowKey,
  GlobalQuoteConfig,
  ManualCopiesInput,
  UploadedDocument,
} from './types';
import { calculateMixedQuote } from './utils/pricing';
import { processUploadedFiles } from './utils/fileAnalyzer';
import { exportQuoteToExcel, LOGO_ASSET_PATH } from './utils/exportExcel';
import { GlobalSidebar } from './components/GlobalSidebar';
import { FileUploadZone } from './components/FileUploadZone';
import { DocumentCard } from './components/DocumentCard';
import { BreakdownPanel } from './components/BreakdownPanel';
import { MultiFileSummaryModal } from './components/MultiFileSummaryModal';
import { FreeTableMode } from './components/FreeTableMode';
import { CounterTools } from './components/CounterTools';
import { RateScheduleView } from './components/RateScheduleView';
import { Trash2 } from 'lucide-react';

type ActiveTab = 'cotizador' | 'tabla' | 'caja' | 'tarifario';

const INITIAL_CONFIG: GlobalQuoteConfig = {
  inkMode: 'bn',
  paperSize: 'carta',
  sides: 1,
  sets: 1,
  includeBinding: false,
  bindingSets: 1,
  ignoreBlackPages: false,
};

const INITIAL_MANUAL: ManualCopiesInput = {
  bnNormalPages: 0,
  secondaryPages: 0,
  colorFullPages: 0,
};

const INITIAL_FREE_TABLE: Record<FreeTableRowKey, number> = {
  bn_carta_1: 0,
  bn_carta_2: 0,
  bn_oficio_1: 0,
  bn_oficio_2: 0,
  bn_carta_pesada: 0,
  color_full_carta_1: 0,
  color_full_carta_2: 0,
  tabloide_general: 0,
  eng_hasta_20: 0,
  eng_21_70: 0,
  eng_71_115: 0,
  eng_116_200: 0,
  eng_201_plus: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cotizador');
  const [config, setConfig] = useState<GlobalQuoteConfig>(INITIAL_CONFIG);
  const [manual, setManual] = useState<ManualCopiesInput>(INITIAL_MANUAL);
  const [files, setFiles] = useState<UploadedDocument[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<AnalysisProgress>({
    active: false,
    percent: 0,
    currentFile: '',
    currentPage: 0,
    totalPages: 0,
  });

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [freeTableQty, setFreeTableQty] =
    useState<Record<FreeTableRowKey, number>>(INITIAL_FREE_TABLE);
  const [cashAmountOverride, setCashAmountOverride] = useState<number | null>(
    null
  );

  // Cotización calculada en tiempo real
  const quoteSummary = useMemo(
    () => calculateMixedQuote(files, manual, config),
    [files, manual, config]
  );

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setUploadErrors([]);
    const { docs, errors } = await processUploadedFiles(
      selectedFiles,
      config,
      setProgress
    );
    if (docs.length > 0) {
      setFiles((prev) => [...prev, ...docs]);
    }
    if (errors.length > 0) {
      setUploadErrors(errors);
    }
  };

  const handleUpdateFile = (id: string, patch: Partial<UploadedDocument>) => {
    setFiles((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc))
    );
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleClearAllFiles = () => {
    setFiles([]);
  };

  const handleApplyGlobalToFiles = () => {
    setFiles((prev) =>
      prev.map((doc) => ({
        ...doc,
        sides: config.sides,
        inkOverride: 'auto',
        sets: config.sets,
        includeBinding: config.includeBinding,
        bindingSets: config.includeBinding ? config.bindingSets : 0,
      }))
    );
  };

  const handleExportExcel = async () => {
    if (quoteSummary.documents.length === 0) return;
    await exportQuoteToExcel(quoteSummary, config);
  };

  const handleSendToCashTool = (amount?: number) => {
    if (typeof amount === 'number') {
      setCashAmountOverride(amount);
    } else {
      setCashAmountOverride(null);
    }
    setActiveTab('caja');
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'cotizador', label: 'Cotizador Mixto' },
    { id: 'tabla', label: 'Tabla Libre' },
    { id: 'caja', label: 'Herramientas de Caja' },
    { id: 'tarifario', label: 'Tarifario' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand logo */}
          <button
            type="button"
            onClick={() => setActiveTab('cotizador')}
            className="flex items-center shrink-0 rounded-md overflow-hidden border border-slate-200 hover:opacity-95 transition-opacity cursor-pointer"
            aria-label="Centro de Copiado de Jesús — Inicio"
          >
            <img
              src={LOGO_ASSET_PATH}
              alt="Centro de Copiado de Jesús"
              referrerPolicy="no-referrer"
              className="h-10 sm:h-11 w-auto object-contain block"
            />
          </button>

          {/* Zone 2: Clean single-line nav links */}
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Navegación principal"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                    isActive
                      ? 'text-blue-700 border-blue-700 font-semibold'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsSummaryModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Resumen por Archivo
            </button>
          </div>
        </div>

        {/* Navegación compacta para móvil */}
        <nav
          className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto"
          aria-label="Navegación móvil"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`text-xs font-medium whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                  isActive
                    ? 'text-blue-700 border-blue-700 font-semibold'
                    : 'text-slate-600 border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'cotizador' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Panel Lateral de Parámetros Globales + Manual */}
            <GlobalSidebar
              config={config}
              onChangeConfig={setConfig}
              manual={manual}
              onChangeManual={setManual}
              fileCount={files.length}
              onApplyGlobalToFiles={handleApplyGlobalToFiles}
              onResetManual={() => setManual(INITIAL_MANUAL)}
            />

            {/* Área Principal de Trabajo */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* Carga de archivos PDF / Imágenes */}
              <FileUploadZone
                fastMode={config.ignoreBlackPages}
                progress={progress}
                errors={uploadErrors}
                onDismissErrors={() => setUploadErrors([])}
                onFilesSelected={handleFilesSelected}
              />

              {/* Lista de documentos cargados */}
              {files.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-sm font-bold text-slate-900">
                      Documentos Cargados ({files.length})
                    </h2>
                    <button
                      type="button"
                      onClick={handleClearAllFiles}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Borrar Todos
                    </button>
                  </div>

                  <div className="space-y-3">
                    {files.map((doc) => {
                      const docQuote = quoteSummary.documents.find(
                        (d) => d.id === doc.id
                      );
                      return (
                        <DocumentCard
                          key={doc.id}
                          doc={doc}
                          quote={docQuote}
                          onUpdate={handleUpdateFile}
                          onRemove={handleRemoveFile}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Resumen Financiero y Desglose */}
              <BreakdownPanel
                summary={quoteSummary}
                onOpenMultiFileModal={() => setIsSummaryModalOpen(true)}
                onExportCsv={handleExportExcel}
                onSendToCashTool={() => handleSendToCashTool()}
              />
            </div>
          </div>
        )}

        {activeTab === 'tabla' && (
          <FreeTableMode
            quantities={freeTableQty}
            onChangeQuantity={(key, val) =>
              setFreeTableQty((prev) => ({ ...prev, [key]: val }))
            }
            onClearAll={() => setFreeTableQty(INITIAL_FREE_TABLE)}
            onSendTotalToCash={(total) => handleSendToCashTool(total)}
          />
        )}

        {activeTab === 'caja' && (
          <CounterTools
            syncedQuoteTotal={quoteSummary.totalSale}
            customAmountOverride={cashAmountOverride}
            onClearOverride={() => setCashAmountOverride(null)}
          />
        )}

        {activeTab === 'tarifario' && <RateScheduleView />}
      </main>

      {/* Pie de página limpio */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_ASSET_PATH}
              alt="Centro de Copiado de Jesús"
              referrerPolicy="no-referrer"
              className="h-7 w-auto rounded-xs object-contain"
            />
            <span>Cotizador y Calculadora de Mostrador</span>
          </div>
          <span>
            Procesamiento local en navegador · Precios en pesos mexicanos (MXN)
          </span>
        </div>
      </footer>

      {/* Modal Resumen Multi-Archivo */}
      <MultiFileSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={quoteSummary}
        onExportCsv={handleExportExcel}
      />
    </div>
  );
}
