import {
  BreakdownLineItem,
  DocumentQuoteResult,
  GlobalQuoteConfig,
  InkMode,
  ManualCopiesInput,
  PaperSize,
  PrintSides,
  QuoteSummary,
  UploadedDocument,
} from '../types';

export const BINDING_INTERNAL_COST = 130 / 25; // $5.20 por engargolado

/**
 * Precio unitario B/N Normal según tamaño, caras y volumen acumulado.
 */
export function getBnNormalUnitPrice(
  paperSize: PaperSize,
  sides: PrintSides,
  totalVolume: number
): number {
  const vol = Math.max(1, totalVolume);

  if (paperSize === 'tabloide') {
    if (vol <= 60) return 10.0;
    if (vol <= 100) return 9.0;
    return 8.0;
  }

  if (paperSize === 'carta') {
    if (sides === 1) {
      if (vol <= 20) return 1.0;
      if (vol <= 385) return 0.7;
      if (vol <= 999) return 0.6;
      return 0.55;
    } else {
      if (vol <= 20) return 1.0;
      if (vol <= 385) return 0.55;
      if (vol <= 999) return 0.45;
      if (vol <= 5000) return 0.4;
      return 0.35;
    }
  }

  // Oficio
  if (sides === 1) {
    if (vol <= 20) return 1.5;
    if (vol <= 485) return 1.0;
    return 0.8;
  } else {
    if (vol <= 20) return 1.5;
    if (vol <= 585) return 0.8;
    return 0.7;
  }
}

/**
 * Precio unitario Color (Media Tinta vs Full Color) según tamaño y volumen acumulado.
 * Escala por umbrales: [10, 30, 100, 500].
 * Oficio desplaza al escalón de precio previo.
 * Tabloide usa escala Tabloide ($10 / $9 / $8).
 */
export function getColorUnitPrice(
  paperSize: PaperSize,
  type: 'color_media' | 'color_full',
  totalColorVolume: number
): number {
  const vol = Math.max(1, totalColorVolume);

  if (paperSize === 'tabloide') {
    if (vol <= 60) return 10.0;
    if (vol <= 100) return 9.0;
    return 8.0;
  }

  // Umbrales: 1-10 (0), 11-30 (1), 31-100 (2), 101-500 (3), 501+ (4)
  let tierIndex = 0;
  if (vol <= 10) tierIndex = 0;
  else if (vol <= 30) tierIndex = 1;
  else if (vol <= 100) tierIndex = 2;
  else if (vol <= 500) tierIndex = 3;
  else tierIndex = 4;

  // Si es Oficio en Color, se desplaza al escalón de precio previo
  if (paperSize === 'oficio') {
    tierIndex = Math.max(0, tierIndex - 1);
  }

  const fullPrices = [6.0, 4.0, 3.5, 3.0, 2.0];
  const mediaPrices = [4.0, 3.5, 3.0, 2.5, 1.5];

  return type === 'color_full' ? fullPrices[tierIndex] : mediaPrices[tierIndex];
}

/**
 * Precio de venta de engargolado según hojas físicas.
 */
export function getBindingUnitPrice(physicalSheets: number): number {
  if (physicalSheets <= 0) return 0;
  if (physicalSheets <= 20) return 13.0;
  if (physicalSheets <= 70) return 15.0;
  if (physicalSheets <= 115) return 17.0;
  if (physicalSheets <= 200) return 22.0;
  return 38.0;
}

/**
 * Costo interno de producción por impresión.
 */
export function getInternalPrintCost(
  paperSize: PaperSize,
  sides: PrintSides,
  effectiveInkMode: InkMode,
  category: 'bn_normal' | 'bn_pesada' | 'color_media' | 'color_full'
): number {
  if (paperSize === 'tabloide') {
    return 2.0;
  }

  if (effectiveInkMode === 'bn') {
    if (sides === 1) {
      return category === 'bn_pesada' ? 0.47 : 0.16;
    } else {
      return category === 'bn_pesada' ? 0.4 : 0.1;
    }
  } else {
    // Modo Color Carta/Oficio
    if (sides === 1) {
      if (category === 'color_full') return 0.38;
      if (category === 'color_media') return 0.25;
      if (category === 'bn_pesada') return 0.47;
      return 0.14;
    } else {
      if (category === 'color_full') return 0.32;
      if (category === 'color_media') return 0.19;
      if (category === 'bn_pesada') return 0.4;
      return 0.08;
    }
  }
}

export function getPhysicalSheets(totalPages: number, sides: PrintSides): number {
  if (totalPages <= 0) return 0;
  return sides === 2 ? Math.ceil(totalPages / 2) : totalPages;
}

/**
 * Clasifica las páginas de un documento según modo de tinta efectivo y flag de omitir negras.
 */
function classifyDocumentPages(
  doc: UploadedDocument,
  effectiveInkMode: InkMode,
  ignoreBlackPages: boolean
): {
  bnNormal: number;
  bnPesada: number;
  colorMedia: number;
  colorFull: number;
} {
  if (doc.analyzedFast) {
    // En lectura rápida, todas las páginas se asignan a bn_normal
    return {
      bnNormal: doc.totalPages,
      bnPesada: 0,
      colorMedia: 0,
      colorFull: 0,
    };
  }

  let bnNormal = 0;
  let bnPesada = 0;
  let colorMedia = 0;
  let colorFull = 0;

  for (const p of doc.pages) {
    if (effectiveInkMode === 'bn') {
      if (!ignoreBlackPages && p.totalInkPct > 50.0) {
        bnPesada++;
      } else {
        bnNormal++;
      }
    } else {
      if (p.colorPct > 0) {
        if (p.colorPct <= 35.0) {
          colorMedia++;
        } else {
          colorFull++;
        }
      } else {
        if (!ignoreBlackPages && p.totalInkPct > 50.0) {
          bnPesada++;
        } else {
          bnNormal++;
        }
      }
    }
  }

  return { bnNormal, bnPesada, colorMedia, colorFull };
}

/**
 * Calcula la cotización completa del Cotizador Mixto (archivos + copias manuales).
 */
export function calculateMixedQuote(
  files: UploadedDocument[],
  manual: ManualCopiesInput,
  config: GlobalQuoteConfig
): QuoteSummary {
  interface RawItem {
    id: string;
    name: string;
    isManual: boolean;
    sides: PrintSides;
    effectiveInkMode: InkMode;
    sets: number;
    includeBinding: boolean;
    bindingSets: number;
    bnNormalPerSet: number;
    bnPesadaPerSet: number;
    colorMediaPerSet: number;
    colorFullPerSet: number;
    totalPages: number;
  }

  const rawItems: RawItem[] = [];

  for (const doc of files) {
    const effectiveInkMode: InkMode =
      doc.inkOverride === 'auto' ? config.inkMode : doc.inkOverride;
    const counts = classifyDocumentPages(doc, effectiveInkMode, config.ignoreBlackPages);
    const sets = Math.max(1, doc.sets);
    const bindingSets = doc.includeBinding
      ? Math.min(sets, Math.max(0, doc.bindingSets))
      : 0;

    rawItems.push({
      id: doc.id,
      name: doc.name,
      isManual: false,
      sides: doc.sides,
      effectiveInkMode,
      sets,
      includeBinding: doc.includeBinding && bindingSets > 0,
      bindingSets,
      bnNormalPerSet: counts.bnNormal,
      bnPesadaPerSet: counts.bnPesada,
      colorMediaPerSet: counts.colorMedia,
      colorFullPerSet: counts.colorFull,
      totalPages: doc.totalPages,
    });
  }

  // Copias físicas manuales
  const mBnNormal = Math.max(0, Math.floor(manual.bnNormalPages || 0));
  const mSecondary = Math.max(0, Math.floor(manual.secondaryPages || 0));
  const mColorFull =
    config.inkMode === 'color' ? Math.max(0, Math.floor(manual.colorFullPages || 0)) : 0;

  let manualBnNormal = mBnNormal;
  let manualBnPesada = 0;
  let manualColorMedia = 0;
  const manualColorFull = mColorFull;

  if (config.inkMode === 'bn') {
    if (config.ignoreBlackPages) {
      manualBnNormal += mSecondary;
    } else {
      manualBnPesada = mSecondary;
    }
  } else {
    manualColorMedia = mSecondary;
  }

  const manualTotalPages =
    manualBnNormal + manualBnPesada + manualColorMedia + manualColorFull;

  if (manualTotalPages > 0) {
    const sets = Math.max(1, config.sets);
    const bindingSets = config.includeBinding
      ? Math.min(sets, Math.max(0, config.bindingSets))
      : 0;

    rawItems.push({
      id: 'manual-copies',
      name: 'Copias Físicas / Ingreso Manual',
      isManual: true,
      sides: config.sides,
      effectiveInkMode: config.inkMode,
      sets,
      includeBinding: config.includeBinding && bindingSets > 0,
      bindingSets,
      bnNormalPerSet: manualBnNormal,
      bnPesadaPerSet: manualBnPesada,
      colorMediaPerSet: manualColorMedia,
      colorFullPerSet: manualColorFull,
      totalPages: manualTotalPages,
    });
  }

  // Acumular volúmenes totales del trabajo para escalones de precio
  let totalBnVolume1Side = 0;
  let totalBnVolume2Sides = 0;
  let totalColorVolume = 0;
  let totalTabloideVolume = 0;

  for (const item of rawItems) {
    const bnImp = item.bnNormalPerSet * item.sets;
    const colorImp = (item.colorMediaPerSet + item.colorFullPerSet) * item.sets;
    const allImp = item.totalPages * item.sets;

    if (config.paperSize === 'tabloide') {
      totalTabloideVolume += allImp;
    } else {
      if (item.sides === 1) totalBnVolume1Side += bnImp;
      else totalBnVolume2Sides += bnImp;
      totalColorVolume += colorImp;
    }
  }

  const documents: DocumentQuoteResult[] = [];
  const breakdownLines: BreakdownLineItem[] = [];

  let totalPagesOriginal = 0;
  let totalImpressions = 0;
  let totalSetsCount = 0;
  let totalBindingSets = 0;
  let grandTotalSale = 0;
  let grandTotalCost = 0;

  for (const item of rawItems) {
    const bnVol =
      config.paperSize === 'tabloide'
        ? totalTabloideVolume
        : item.sides === 1
          ? totalBnVolume1Side
          : totalBnVolume2Sides;
    const colVol =
      config.paperSize === 'tabloide' ? totalTabloideVolume : totalColorVolume;

    const unitPriceBnNormal = getBnNormalUnitPrice(config.paperSize, item.sides, bnVol);
    const unitPriceBnPesada = config.ignoreBlackPages
      ? unitPriceBnNormal
      : config.paperSize === 'tabloide'
        ? unitPriceBnNormal
        : 6.0;
    const unitPriceColorMedia = getColorUnitPrice(
      config.paperSize,
      'color_media',
      colVol
    );
    const unitPriceColorFull = getColorUnitPrice(
      config.paperSize,
      'color_full',
      colVol
    );

    const printPricePerSet =
      item.bnNormalPerSet * unitPriceBnNormal +
      item.bnPesadaPerSet * unitPriceBnPesada +
      item.colorMediaPerSet * unitPriceColorMedia +
      item.colorFullPerSet * unitPriceColorFull;

    const printTotalSale = printPricePerSet * item.sets;

    // Costos internos de impresión
    const costUnitBnNormal = getInternalPrintCost(
      config.paperSize,
      item.sides,
      item.effectiveInkMode,
      'bn_normal'
    );
    const costUnitBnPesada = getInternalPrintCost(
      config.paperSize,
      item.sides,
      item.effectiveInkMode,
      'bn_pesada'
    );
    const costUnitColorMedia = getInternalPrintCost(
      config.paperSize,
      item.sides,
      item.effectiveInkMode,
      'color_media'
    );
    const costUnitColorFull = getInternalPrintCost(
      config.paperSize,
      item.sides,
      item.effectiveInkMode,
      'color_full'
    );

    const printCostPerSet =
      item.bnNormalPerSet * costUnitBnNormal +
      item.bnPesadaPerSet * costUnitBnPesada +
      item.colorMediaPerSet * costUnitColorMedia +
      item.colorFullPerSet * costUnitColorFull;

    const printTotalCost = printCostPerSet * item.sets;

    // Engargolado
    const physicalSheets = getPhysicalSheets(item.totalPages, item.sides);
    const bindingUnitPrice = item.includeBinding
      ? getBindingUnitPrice(physicalSheets)
      : 0;
    const bindingTotalSale = bindingUnitPrice * item.bindingSets;
    const bindingTotalCost = item.includeBinding
      ? BINDING_INTERNAL_COST * item.bindingSets
      : 0;

    const totalSale = printTotalSale + bindingTotalSale;
    const totalCost = printTotalCost + bindingTotalCost;
    const totalPerFullBoundSet =
      printPricePerSet + (item.includeBinding ? bindingUnitPrice : 0);

    documents.push({
      id: item.id,
      name: item.name,
      isManual: item.isManual,
      sides: item.sides,
      effectiveInkMode: item.effectiveInkMode,
      totalPages: item.totalPages,
      physicalSheets,
      sets: item.sets,
      totalImpressions: item.totalPages * item.sets,
      bnNormalPerSet: item.bnNormalPerSet,
      bnPesadaPerSet: item.bnPesadaPerSet,
      colorMediaPerSet: item.colorMediaPerSet,
      colorFullPerSet: item.colorFullPerSet,
      unitPriceBnNormal,
      unitPriceBnPesada,
      unitPriceColorMedia,
      unitPriceColorFull,
      printPricePerSet,
      printTotalSale,
      includeBinding: item.includeBinding,
      bindingSets: item.bindingSets,
      bindingUnitPrice,
      bindingTotalSale,
      totalPerFullBoundSet,
      totalSale,
      printTotalCost,
      bindingTotalCost,
      totalCost,
      netProfit: totalSale - totalCost,
    });

    // Filas del desglose detallado
    const paperLabel =
      config.paperSize === 'carta'
        ? 'Carta'
        : config.paperSize === 'oficio'
          ? 'Oficio'
          : 'Tabloide';
    const sideLabel = item.sides === 1 ? '1 Cara' : '2 Caras';

    if (item.bnNormalPerSet > 0) {
      const qty = item.bnNormalPerSet * item.sets;
      breakdownLines.push({
        id: `${item.id}-bn-normal`,
        concept: `${item.name} — B/N Normal`,
        detail: `${paperLabel} · ${sideLabel} · ${item.bnNormalPerSet} pág × ${item.sets} jg`,
        quantity: qty,
        unitLabel: 'imp.',
        unitPrice: unitPriceBnNormal,
        subtotalSale: qty * unitPriceBnNormal,
        unitCost: costUnitBnNormal,
        subtotalCost: qty * costUnitBnNormal,
      });
    }

    if (item.bnPesadaPerSet > 0) {
      const qty = item.bnPesadaPerSet * item.sets;
      breakdownLines.push({
        id: `${item.id}-bn-pesada`,
        concept: `${item.name} — Hoja Pesada B/N (>50%)`,
        detail: `${paperLabel} · ${sideLabel} · ${item.bnPesadaPerSet} pág × ${item.sets} jg`,
        quantity: qty,
        unitLabel: 'imp.',
        unitPrice: unitPriceBnPesada,
        subtotalSale: qty * unitPriceBnPesada,
        unitCost: costUnitBnPesada,
        subtotalCost: qty * costUnitBnPesada,
      });
    }

    if (item.colorMediaPerSet > 0) {
      const qty = item.colorMediaPerSet * item.sets;
      breakdownLines.push({
        id: `${item.id}-color-media`,
        concept: `${item.name} — Media Tinta Color`,
        detail: `${paperLabel} · ${sideLabel} · ${item.colorMediaPerSet} pág × ${item.sets} jg`,
        quantity: qty,
        unitLabel: 'imp.',
        unitPrice: unitPriceColorMedia,
        subtotalSale: qty * unitPriceColorMedia,
        unitCost: costUnitColorMedia,
        subtotalCost: qty * costUnitColorMedia,
      });
    }

    if (item.colorFullPerSet > 0) {
      const qty = item.colorFullPerSet * item.sets;
      breakdownLines.push({
        id: `${item.id}-color-full`,
        concept: `${item.name} — Full Color`,
        detail: `${paperLabel} · ${sideLabel} · ${item.colorFullPerSet} pág × ${item.sets} jg`,
        quantity: qty,
        unitLabel: 'imp.',
        unitPrice: unitPriceColorFull,
        subtotalSale: qty * unitPriceColorFull,
        unitCost: costUnitColorFull,
        subtotalCost: qty * costUnitColorFull,
      });
    }

    if (item.includeBinding && item.bindingSets > 0) {
      breakdownLines.push({
        id: `${item.id}-binding`,
        concept: `Engargolado — ${item.name}`,
        detail: `${physicalSheets} hojas físicas por juego`,
        quantity: item.bindingSets,
        unitLabel: 'pza.',
        unitPrice: bindingUnitPrice,
        subtotalSale: bindingTotalSale,
        unitCost: BINDING_INTERNAL_COST,
        subtotalCost: bindingTotalCost,
        isBinding: true,
      });
    }

    totalPagesOriginal += item.totalPages;
    totalImpressions += item.totalPages * item.sets;
    totalSetsCount += item.sets;
    totalBindingSets += item.bindingSets;
    grandTotalSale += totalSale;
    grandTotalCost += totalCost;
  }

  const netProfit = grandTotalSale - grandTotalCost;
  const profitMarginPct =
    grandTotalSale > 0 ? (netProfit / grandTotalSale) * 100 : 0;
  const avgPricePerSet =
    totalSetsCount > 0 ? grandTotalSale / totalSetsCount : 0;

  return {
    documents,
    breakdownLines,
    totalPagesOriginal,
    totalImpressions,
    totalSetsCount,
    totalBindingSets,
    totalSale: grandTotalSale,
    totalCost: grandTotalCost,
    netProfit,
    profitMarginPct,
    avgPricePerSet,
  };
}

export function formatMXN(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
