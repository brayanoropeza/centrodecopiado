import ExcelJS from 'exceljs';
import { GlobalQuoteConfig, QuoteSummary } from '../types';

export const LOGO_ASSET_PATH = '/assets/aistudio/image_e04d83ca.png';

const FONT_NAME = 'Century';
const NAVY_HEX = 'FF001B5E';
const NAVY_DARK_HEX = 'FF001342';
const GOLD_HEX = 'FFE6DC00';
const ZEBRA_EVEN_HEX = 'FFE8EFFA';
const ZEBRA_ODD_HEX = 'FFFFFFFF';
const META_BG_HEX = 'FFF8FAFC';
const BORDER_LIGHT_HEX = 'FFCBD5E1';
const TEXT_DARK_HEX = 'FF0F172A';
const TEXT_MUTED_HEX = 'FF475569';

async function loadLogoBuffer(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(LOGO_ASSET_PATH);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function downloadWorkbook(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function applyCellBorder(
  cell: ExcelJS.Cell,
  color = BORDER_LIGHT_HEX,
  style: ExcelJS.BorderStyle = 'thin'
) {
  cell.border = {
    top: { style, color: { argb: color } },
    left: { style, color: { argb: color } },
    bottom: { style, color: { argb: color } },
    right: { style, color: { argb: color } },
  };
}

/**
 * Genera y descarga un archivo Excel (.xlsx) formal para el Cotizador Mixto,
 * con logotipo oficial, fuente Century y filas alternadas para fácil lectura.
 */
export async function exportQuoteToExcel(
  summary: QuoteSummary,
  config: GlobalQuoteConfig
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Centro de Copiado de Jesús';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Cotización', {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  // Definir columnas (10 columnas exactas)
  sheet.columns = [
    { key: 'name', width: 34 },
    { key: 'sides', width: 15 },
    { key: 'originales', width: 16 },
    { key: 'juegos', width: 14 },
    { key: 'totalCopias', width: 15 },
    { key: 'costoEng', width: 18 },
    { key: 'precioCopiasJuego', width: 20 },
    { key: 'totalEng', width: 18 },
    { key: 'precioTotalJuego', width: 20 },
    { key: 'cobroTotal', width: 21 },
  ];

  // Encabezado Institucional (Filas 1 a 4) con fondo azul marino corporativo
  for (let r = 1; r <= 4; r++) {
    const row = sheet.getRow(r);
    row.height = r === 1 || r === 2 ? 22 : 20;
    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: NAVY_HEX },
      };
      if (r === 4) {
        cell.border = {
          bottom: { style: 'medium', color: { argb: GOLD_HEX } },
        };
      }
    }
  }

  // Insertar logotipo oficial en A1:D4
  const logoBuffer = await loadLogoBuffer();
  if (logoBuffer) {
    const imageId = workbook.addImage({
      buffer: logoBuffer,
      extension: 'png',
    });
    sheet.addImage(imageId, {
      tl: { col: 0.15, row: 0.25 },
      ext: { width: 255, height: 92 },
    });
  } else {
    sheet.mergeCells('A1:D4');
    const brandCell = sheet.getCell('A1');
    brandCell.value = 'CENTRO DE COPIADO DE JESÚS';
    brandCell.font = {
      name: FONT_NAME,
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
  const timeStr = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Título formal a la derecha del logotipo
  sheet.mergeCells('E1:J2');
  const titleCell = sheet.getCell('E1');
  titleCell.value = 'COTIZACIÓN FORMAL DE SERVICIOS';
  titleCell.font = {
    name: FONT_NAME,
    size: 16,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'right' };

  sheet.mergeCells('E3:J3');
  const subCell = sheet.getCell('E3');
  subCell.value = 'Centro de Copiado de Jesús · Impresión Digital y Engargolado';
  subCell.font = {
    name: FONT_NAME,
    size: 10.5,
    italic: true,
    color: { argb: GOLD_HEX },
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'right' };

  sheet.mergeCells('E4:J4');
  const dateCell = sheet.getCell('E4');
  dateCell.value = `Fecha: ${dateStr}   |   Hora: ${timeStr}`;
  dateCell.font = {
    name: FONT_NAME,
    size: 9.5,
    color: { argb: 'FFDBEAFE' },
  };
  dateCell.alignment = { vertical: 'middle', horizontal: 'right' };

  // Fila 5 separadora
  sheet.getRow(5).height = 10;

  // Bloque de metadatos de la cotización (Filas 6 y 7)
  const modeLabel = config.ignoreBlackPages
    ? 'Lectura Rápida (Sin hojas negras)'
    : 'Análisis Normal (Cobertura de tinta por píxel)';
  const paperLabel =
    config.paperSize === 'carta'
      ? 'Carta'
      : config.paperSize === 'oficio'
        ? 'Oficio'
        : 'Tabloide';
  const inkLabel = config.inkMode === 'bn' ? 'Todo Blanco y Negro' : 'A Color';

  sheet.mergeCells('A6:E6');
  sheet.mergeCells('F6:J6');
  const metaRow = sheet.getRow(6);
  metaRow.height = 22;

  const metaLeft = sheet.getCell('A6');
  metaLeft.value = `Modo de Análisis: ${modeLabel}`;
  metaLeft.font = { name: FONT_NAME, size: 9.5, color: { argb: TEXT_DARK_HEX } };
  metaLeft.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  const metaRight = sheet.getCell('F6');
  metaRight.value = `Parámetros Globales: Tinta ${inkLabel}  ·  Papel ${paperLabel}`;
  metaRight.font = { name: FONT_NAME, size: 9.5, color: { argb: TEXT_DARK_HEX } };
  metaRight.alignment = { vertical: 'middle', horizontal: 'right' };

  for (let c = 1; c <= 10; c++) {
    const cell = metaRow.getCell(c);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: META_BG_HEX },
    };
    applyCellBorder(cell, BORDER_LIGHT_HEX);
  }

  sheet.getRow(7).height = 10;

  // Encabezado de Tabla (Fila 8)
  const headers = [
    'Nombre del Archivo',
    'Tipo Impresión',
    'Originales (Págs.)',
    'Juegos (Copias)',
    'Total Copias',
    'Costo Engargolado',
    'Precio Copias / Juego',
    'Total Engargolado',
    'Precio Total / Juego',
    'Cobro Total Archivo',
  ];

  const headerRow = sheet.getRow(8);
  headerRow.height = 30;
  headers.forEach((text, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = text;
    cell.font = {
      name: FONT_NAME,
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY_HEX },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: idx === 0 ? 'left' : idx === 1 ? 'center' : 'right',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: NAVY_DARK_HEX } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      bottom: { style: 'medium', color: { argb: GOLD_HEX } },
    };
  });

  // Filas de datos con color de fondo alternado por fila para fácil lectura
  let sumOriginales = 0;
  let sumJuegos = 0;
  let sumTotalCopias = 0;
  let sumTotalEngargolado = 0;
  let sumCobroTotal = 0;

  summary.documents.forEach((doc, index) => {
    sumOriginales += doc.totalPages;
    sumJuegos += doc.sets;
    sumTotalCopias += doc.totalImpressions;
    sumTotalEngargolado += doc.bindingTotalSale;
    sumCobroTotal += doc.totalSale;

    const rowNumber = 9 + index;
    const row = sheet.getRow(rowNumber);
    row.height = 24;

    const bgHex = index % 2 === 0 ? ZEBRA_ODD_HEX : ZEBRA_EVEN_HEX;

    const values: (string | number)[] = [
      doc.name,
      doc.sides === 1 ? '1 Cara' : '2 Caras',
      doc.totalPages,
      doc.sets,
      doc.totalImpressions,
      doc.includeBinding ? doc.bindingUnitPrice : 0,
      doc.printPricePerSet,
      doc.bindingTotalSale,
      doc.totalPerFullBoundSet,
      doc.totalSale,
    ];

    values.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = {
        name: FONT_NAME,
        size: 10,
        bold: colIdx === 9,
        color: { argb: colIdx === 9 ? NAVY_HEX : TEXT_DARK_HEX },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgHex },
      };
      applyCellBorder(cell, BORDER_LIGHT_HEX);

      if (colIdx === 0) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      } else if (colIdx === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }

      if (colIdx >= 2 && colIdx <= 4) {
        cell.numFmt = '#,##0';
      } else if (colIdx >= 5) {
        cell.numFmt = '$#,##0.00';
      }
    });
  });

  // Fila de Totales Generales
  const totalRowNumber = 9 + summary.documents.length;
  const totalRow = sheet.getRow(totalRowNumber);
  totalRow.height = 28;

  const totalValues: (string | number)[] = [
    'TOTALES GENERALES',
    '',
    sumOriginales,
    sumJuegos,
    sumTotalCopias,
    '',
    '',
    sumTotalEngargolado,
    '',
    sumCobroTotal,
  ];

  totalValues.forEach((val, colIdx) => {
    const cell = totalRow.getCell(colIdx + 1);
    cell.value = val;
    cell.font = {
      name: FONT_NAME,
      size: colIdx === 9 ? 11 : 10,
      bold: true,
      color: { argb: colIdx === 9 ? GOLD_HEX : 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY_HEX },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colIdx === 0 ? 'left' : 'right',
      indent: colIdx === 0 ? 1 : 0,
    };
    cell.border = {
      top: { style: 'medium', color: { argb: GOLD_HEX } },
      bottom: { style: 'medium', color: { argb: NAVY_DARK_HEX } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } },
    };

    if (colIdx >= 2 && colIdx <= 4) {
      cell.numFmt = '#,##0';
    } else if (colIdx === 7 || colIdx === 9) {
      cell.numFmt = '$#,##0.00';
    }
  });

  // Nota formal al pie
  const footerRowNum = totalRowNumber + 2;
  sheet.mergeCells(`A${footerRowNum}:J${footerRowNum}`);
  const footerCell = sheet.getCell(`A${footerRowNum}`);
  footerCell.value =
    'Precios expresados en Pesos Mexicanos (MXN). Gracias por su preferencia — Centro de Copiado de Jesús.';
  footerCell.font = {
    name: FONT_NAME,
    size: 9,
    italic: true,
    color: { argb: TEXT_MUTED_HEX },
  };
  footerCell.alignment = { vertical: 'middle', horizontal: 'center' };

  const buffer = await workbook.xlsx.writeBuffer();
  const fileStamp = now.toISOString().slice(0, 10);
  downloadWorkbook(
    buffer as ArrayBuffer,
    `Cotizacion_CentroDeCopiadoJesus_${fileStamp}.xlsx`
  );
}

export interface FreeTableExportRow {
  label: string;
  category: string;
  qty: number;
  unitPrice: number;
  subtotalSale: number;
  subtotalCost: number;
  profit: number;
}

/**
 * Exporta la Tabla Libre Dinámica en formato Excel (.xlsx) formal
 * con logotipo oficial, fuente Century y filas alternadas.
 */
export async function exportFreeTableToExcel(
  rows: FreeTableExportRow[],
  totals: {
    totalItems: number;
    totalSale: number;
    totalCost: number;
    netProfit: number;
  }
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Centro de Copiado de Jesús';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Tabla Libre', {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  sheet.columns = [
    { key: 'label', width: 36 },
    { key: 'category', width: 18 },
    { key: 'qty', width: 14 },
    { key: 'unitPrice', width: 16 },
    { key: 'subtotalSale', width: 18 },
    { key: 'subtotalCost', width: 18 },
    { key: 'profit', width: 18 },
  ];

  // Encabezado azul marino (Filas 1 a 4)
  for (let r = 1; r <= 4; r++) {
    const row = sheet.getRow(r);
    row.height = r === 1 || r === 2 ? 22 : 20;
    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: NAVY_HEX },
      };
      if (r === 4) {
        cell.border = {
          bottom: { style: 'medium', color: { argb: GOLD_HEX } },
        };
      }
    }
  }

  const logoBuffer = await loadLogoBuffer();
  if (logoBuffer) {
    const imageId = workbook.addImage({
      buffer: logoBuffer,
      extension: 'png',
    });
    sheet.addImage(imageId, {
      tl: { col: 0.15, row: 0.25 },
      ext: { width: 255, height: 92 },
    });
  } else {
    sheet.mergeCells('A1:C4');
    const brandCell = sheet.getCell('A1');
    brandCell.value = 'CENTRO DE COPIADO DE JESÚS';
    brandCell.font = {
      name: FONT_NAME,
      size: 16,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
  const timeStr = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  sheet.mergeCells('D1:G2');
  const titleCell = sheet.getCell('D1');
  titleCell.value = 'COTIZACIÓN — TABLA LIBRE DINÁMICA';
  titleCell.font = {
    name: FONT_NAME,
    size: 15,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'right' };

  sheet.mergeCells('D3:G3');
  const subCell = sheet.getCell('D3');
  subCell.value = 'Centro de Copiado de Jesús';
  subCell.font = {
    name: FONT_NAME,
    size: 10.5,
    italic: true,
    color: { argb: GOLD_HEX },
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'right' };

  sheet.mergeCells('D4:G4');
  const dateCell = sheet.getCell('D4');
  dateCell.value = `Fecha: ${dateStr}   |   Hora: ${timeStr}`;
  dateCell.font = {
    name: FONT_NAME,
    size: 9.5,
    color: { argb: 'FFDBEAFE' },
  };
  dateCell.alignment = { vertical: 'middle', horizontal: 'right' };

  sheet.getRow(5).height = 12;

  const headers = [
    'Concepto / Servicio',
    'Categoría',
    'Cantidad',
    'Precio Unitario',
    'Subtotal Venta',
    'Costo Producción',
    'Ganancia Neta',
  ];

  const headerRow = sheet.getRow(6);
  headerRow.height = 28;
  headers.forEach((text, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = text;
    cell.font = {
      name: FONT_NAME,
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY_HEX },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: idx <= 1 ? 'left' : 'right',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: NAVY_DARK_HEX } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      bottom: { style: 'medium', color: { argb: GOLD_HEX } },
    };
  });

  rows.forEach((item, index) => {
    const row = sheet.getRow(7 + index);
    row.height = 24;
    const bgHex = index % 2 === 0 ? ZEBRA_ODD_HEX : ZEBRA_EVEN_HEX;

    const vals: (string | number)[] = [
      item.label,
      item.category,
      item.qty,
      item.unitPrice,
      item.subtotalSale,
      item.subtotalCost,
      item.profit,
    ];

    vals.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = {
        name: FONT_NAME,
        size: 10,
        bold: colIdx === 4,
        color: { argb: colIdx === 6 ? 'FF15803D' : TEXT_DARK_HEX },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgHex },
      };
      applyCellBorder(cell, BORDER_LIGHT_HEX);
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIdx <= 1 ? 'left' : 'right',
        indent: colIdx === 0 ? 1 : 0,
      };
      if (colIdx === 2) cell.numFmt = '#,##0';
      if (colIdx >= 3) cell.numFmt = '$#,##0.00';
    });
  });

  const totalRowNum = 7 + rows.length;
  const totalRow = sheet.getRow(totalRowNum);
  totalRow.height = 28;

  const totalVals: (string | number)[] = [
    'TOTALES GENERALES',
    '',
    totals.totalItems,
    '',
    totals.totalSale,
    totals.totalCost,
    totals.netProfit,
  ];

  totalVals.forEach((val, colIdx) => {
    const cell = totalRow.getCell(colIdx + 1);
    cell.value = val;
    cell.font = {
      name: FONT_NAME,
      size: colIdx === 4 ? 11 : 10,
      bold: true,
      color: { argb: colIdx === 4 ? GOLD_HEX : 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY_HEX },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colIdx === 0 ? 'left' : 'right',
      indent: colIdx === 0 ? 1 : 0,
    };
    cell.border = {
      top: { style: 'medium', color: { argb: GOLD_HEX } },
      bottom: { style: 'medium', color: { argb: NAVY_DARK_HEX } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } },
    };
    if (colIdx === 2) cell.numFmt = '#,##0';
    if (colIdx >= 4) cell.numFmt = '$#,##0.00';
  });

  const footerRowNum = totalRowNum + 2;
  sheet.mergeCells(`A${footerRowNum}:G${footerRowNum}`);
  const footerCell = sheet.getCell(`A${footerRowNum}`);
  footerCell.value =
    'Precios expresados en Pesos Mexicanos (MXN). Gracias por su preferencia — Centro de Copiado de Jesús.';
  footerCell.font = {
    name: FONT_NAME,
    size: 9,
    italic: true,
    color: { argb: TEXT_MUTED_HEX },
  };
  footerCell.alignment = { vertical: 'middle', horizontal: 'center' };

  const buffer = await workbook.xlsx.writeBuffer();
  const fileStamp = now.toISOString().slice(0, 10);
  downloadWorkbook(
    buffer as ArrayBuffer,
    `TablaLibre_CentroDeCopiadoJesus_${fileStamp}.xlsx`
  );
}
