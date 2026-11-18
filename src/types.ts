export type InkMode = 'bn' | 'color';
export type FileInkOverride = 'auto' | 'bn' | 'color';
export type PaperSize = 'carta' | 'oficio' | 'tabloide';
export type PrintSides = 1 | 2;
export type PageCategory = 'bn_normal' | 'bn_pesada' | 'color_media' | 'color_full';

export interface AnalyzedPage {
  pageNumber: number;
  totalInkPct: number;
  colorPct: number;
  rawCategory: PageCategory;
}

export interface UploadedDocument {
  id: string;
  name: string;
  fileType: 'pdf' | 'image';
  fileSize: number;
  totalPages: number;
  thumbnailDataUrl: string | null;
  analyzedFast: boolean;
  pages: AnalyzedPage[];
  // Per-file overrides / settings
  sides: PrintSides;
  inkOverride: FileInkOverride;
  sets: number;
  includeBinding: boolean;
  bindingSets: number;
}

export interface GlobalQuoteConfig {
  inkMode: InkMode;
  paperSize: PaperSize;
  sides: PrintSides;
  sets: number;
  includeBinding: boolean;
  bindingSets: number;
  ignoreBlackPages: boolean;
}

export interface ManualCopiesInput {
  bnNormalPages: number;
  secondaryPages: number; // bn_pesada when globalInkMode==='bn', color_media when 'color'
  colorFullPages: number; // optional when globalInkMode==='color'
}

export interface DocumentQuoteResult {
  id: string;
  name: string;
  isManual?: boolean;
  sides: PrintSides;
  effectiveInkMode: InkMode;
  totalPages: number;
  physicalSheets: number;
  sets: number;
  totalImpressions: number;
  // Counts per 1 set
  bnNormalPerSet: number;
  bnPesadaPerSet: number;
  colorMediaPerSet: number;
  colorFullPerSet: number;
  // Unit prices applied
  unitPriceBnNormal: number;
  unitPriceBnPesada: number;
  unitPriceColorMedia: number;
  unitPriceColorFull: number;
  // Per-set print price & total print price
  printPricePerSet: number;
  printTotalSale: number;
  // Binding
  includeBinding: boolean;
  bindingSets: number;
  bindingUnitPrice: number;
  bindingTotalSale: number;
  // Totals
  totalPerFullBoundSet: number;
  totalSale: number;
  // Internal costs
  printTotalCost: number;
  bindingTotalCost: number;
  totalCost: number;
  netProfit: number;
}

export interface BreakdownLineItem {
  id: string;
  concept: string;
  detail: string;
  quantity: number;
  unitLabel: string;
  unitPrice: number;
  subtotalSale: number;
  unitCost: number;
  subtotalCost: number;
  isBinding?: boolean;
}

export interface QuoteSummary {
  documents: DocumentQuoteResult[];
  breakdownLines: BreakdownLineItem[];
  totalPagesOriginal: number;
  totalImpressions: number;
  totalSetsCount: number;
  totalBindingSets: number;
  totalSale: number;
  totalCost: number;
  netProfit: number;
  profitMarginPct: number;
  avgPricePerSet: number;
}

export interface AnalysisProgress {
  active: boolean;
  percent: number;
  currentFile: string;
  currentPage: number;
  totalPages: number;
}

export type FreeTableRowKey =
  | 'bn_carta_1'
  | 'bn_carta_2'
  | 'bn_oficio_1'
  | 'bn_oficio_2'
  | 'bn_carta_pesada'
  | 'color_full_carta_1'
  | 'color_full_carta_2'
  | 'tabloide_general'
  | 'eng_hasta_20'
  | 'eng_21_70'
  | 'eng_71_115'
  | 'eng_116_200'
  | 'eng_201_plus';
