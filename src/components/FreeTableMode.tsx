import React, { useMemo } from 'react';
import { FreeTableRowKey } from '../types';
import {
  BINDING_INTERNAL_COST,
  formatMXN,
  getBnNormalUnitPrice,
  getColorUnitPrice,
  getInternalPrintCost,
} from '../utils/pricing';
import { exportFreeTableToExcel } from '../utils/exportExcel';
import { Calculator, Download, RotateCcw } from 'lucide-react';

interface FreeTableRowDef {
  key: FreeTableRowKey;
  label: string;
  category: 'Impresión B/N' | 'Impresión Color' | 'Tabloide' | 'Engargolado';
  unitLabel: string;
  getUnitPrice: (qty: number) => number;
  getUnitCost: () => number;
}

const FREE_TABLE_ROWS: FreeTableRowDef[] = [
  {
    key: 'bn_carta_1',
    label: 'B/N — Carta (1 Cara)',
    category: 'Impresión B/N',
    unitLabel: 'imp.',
    getUnitPrice: (q) => getBnNormalUnitPrice('carta', 1, q),
    getUnitCost: () => getInternalPrintCost('carta', 1, 'bn', 'bn_normal'),
  },
  {
    key: 'bn_carta_2',
    label: 'B/N — Carta (2 Caras)',
    category: 'Impresión B/N',
    unitLabel: 'imp.',
    getUnitPrice: (q) => getBnNormalUnitPrice('carta', 2, q),
    getUnitCost: () => getInternalPrintCost('carta', 2, 'bn', 'bn_normal'),
  },
  {
    key: 'bn_oficio_1',
    label: 'B/N — Oficio (1 Cara)',
    category: 'Impresión B/N',
    unitLabel: 'imp.',
    getUnitPrice: (q) => getBnNormalUnitPrice('oficio', 1, q),
    getUnitCost: () => getInternalPrintCost('oficio', 1, 'bn', 'bn_normal'),
  },
  {
    key: 'bn_oficio_2',
    label: 'B/N — Oficio (2 Caras)',
    category: 'Impresión B/N',
    unitLabel: 'imp.',
    getUnitPrice: (q) => getBnNormalUnitPrice('oficio', 2, q),
    getUnitCost: () => getInternalPrintCost('oficio', 2, 'bn', 'bn_normal'),
  },
  {
    key: 'bn_carta_pesada',
    label: 'B/N — Carta Pesada (>50% tinta)',
    category: 'Impresión B/N',
    unitLabel: 'imp.',
    getUnitPrice: () => 6.0,
    getUnitCost: () => getInternalPrintCost('carta', 1, 'bn', 'bn_pesada'),
  },
  {
    key: 'color_full_carta_1',
    label: 'Color Full — Carta (1 Cara)',
    category: 'Impresión Color',
    unitLabel: 'imp.',
    getUnitPrice: (q) => getColorUnitPrice('carta', 'color_full', q),
    getUnitCost: () => getInternalPrintCost('carta', 1, 'color', 'color_full'),
  },
  {
    key: 'color_full_carta_2',
    label: 'Color Full — Carta (2 Caras)',
    category: 'Impresión Color',
    unitLabel: 'imp.',
    getUnitPrice: (q) => getColorUnitPrice('carta', 'color_full', q),
    getUnitCost: () => getInternalPrintCost('carta', 2, 'color', 'color_full'),
  },
  {
    key: 'tabloide_general',
    label: 'Impresión — Tabloide (General)',
    category: 'Tabloide',
    unitLabel: 'imp.',
    getUnitPrice: (q) => getBnNormalUnitPrice('tabloide', 1, q),
    getUnitCost: () => getInternalPrintCost('tabloide', 1, 'bn', 'bn_normal'),
  },
  {
    key: 'eng_hasta_20',
    label: 'Engargolado — Hasta 20 hojas',
    category: 'Engargolado',
    unitLabel: 'pza.',
    getUnitPrice: () => 13.0,
    getUnitCost: () => BINDING_INTERNAL_COST,
  },
  {
    key: 'eng_21_70',
    label: 'Engargolado — 21 a 70 hojas',
    category: 'Engargolado',
    unitLabel: 'pza.',
    getUnitPrice: () => 15.0,
    getUnitCost: () => BINDING_INTERNAL_COST,
  },
  {
    key: 'eng_71_115',
    label: 'Engargolado — 71 a 115 hojas',
    category: 'Engargolado',
    unitLabel: 'pza.',
    getUnitPrice: () => 17.0,
    getUnitCost: () => BINDING_INTERNAL_COST,
  },
  {
    key: 'eng_116_200',
    label: 'Engargolado — 116 a 200 hojas',
    category: 'Engargolado',
    unitLabel: 'pza.',
    getUnitPrice: () => 22.0,
    getUnitCost: () => BINDING_INTERNAL_COST,
  },
  {
    key: 'eng_201_plus',
    label: 'Engargolado — 201+ hojas',
    category: 'Engargolado',
    unitLabel: 'pza.',
    getUnitPrice: () => 38.0,
    getUnitCost: () => BINDING_INTERNAL_COST,
  },
];

interface FreeTableModeProps {
  quantities: Record<FreeTableRowKey, number>;
  onChangeQuantity: (key: FreeTableRowKey, value: number) => void;
  onClearAll: () => void;
  onSendTotalToCash: (total: number) => void;
}

export const FreeTableMode: React.FC<FreeTableModeProps> = ({
  quantities,
  onChangeQuantity,
  onClearAll,
  onSendTotalToCash,
}) => {
  const computed = useMemo(() => {
    let totalSale = 0;
    let totalCost = 0;
    let totalItems = 0;

    const rows = FREE_TABLE_ROWS.map((def) => {
      const qty = Math.max(0, Math.floor(quantities[def.key] || 0));
      const unitPrice = def.getUnitPrice(Math.max(1, qty));
      const unitCost = def.getUnitCost();
      const subtotalSale = qty * unitPrice;
      const subtotalCost = qty * unitCost;
      const profit = subtotalSale - subtotalCost;

      totalSale += subtotalSale;
      totalCost += subtotalCost;
      totalItems += qty;

      return {
        ...def,
        qty,
        unitPrice,
        unitCost,
        subtotalSale,
        subtotalCost,
        profit,
      };
    });

    const netProfit = totalSale - totalCost;
    const marginPct = totalSale > 0 ? (netProfit / totalSale) * 100 : 0;

    return { rows, totalSale, totalCost, netProfit, marginPct, totalItems };
  }, [quantities]);

  const handleExportFreeTableExcel = async () => {
    const activeRows = computed.rows
      .filter((r) => r.qty > 0)
      .map((r) => ({
        label: r.label,
        category: r.category,
        qty: r.qty,
        unitPrice: r.unitPrice,
        subtotalSale: r.subtotalSale,
        subtotalCost: r.subtotalCost,
        profit: r.profit,
      }));

    if (activeRows.length === 0) return;

    await exportFreeTableToExcel(activeRows, {
      totalItems: computed.totalItems,
      totalSale: computed.totalSale,
      totalCost: computed.totalCost,
      netProfit: computed.netProfit,
    });
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-medium text-slate-300">
            Venta Total — Tabla Libre (MXN)
          </span>
          <div className="font-mono tabular-nums text-3xl sm:text-4xl font-bold tracking-tight">
            {formatMXN(computed.totalSale)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="font-mono tabular-nums">
              {computed.totalItems.toLocaleString('es-MX')} unidades totales
            </span>
            {computed.totalSale > 0 && (
              <button
                type="button"
                onClick={() => onSendTotalToCash(computed.totalSale)}
                className="text-blue-300 hover:text-white font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Calculator className="w-3.5 h-3.5" />
                Calcular cambio
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-medium text-slate-500">
            Costo de Producción Estimado
          </span>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-slate-900">
            {formatMXN(computed.totalCost)}
          </div>
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Cálculo automático por tarifa de insumo
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Ganancia Neta Pura
            </span>
            {computed.totalSale > 0 && (
              <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
                Margen {computed.marginPct.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-emerald-700">
            {formatMXN(computed.netProfit)}
          </div>
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Venta total menos costos de producción
          </p>
        </div>
      </div>

      {/* Tabla estilo hoja de cálculo */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tabla Libre Dinámica
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Escribe las cantidades directamente en cada fila. El precio
              unitario se ajusta automáticamente al escalón de volumen.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearAll}
              disabled={computed.totalItems === 0}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar Tabla
            </button>
            <button
              type="button"
              onClick={handleExportFreeTableExcel}
              disabled={computed.totalItems === 0}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-45 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar a Excel (.xlsx)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Concepto / Servicio</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right w-40">Cantidad</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Precio Unit.
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Subtotal Venta
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Costo Prod.
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Ganancia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {computed.rows.map((row) => {
                const isActive = row.qty > 0;
                return (
                  <tr
                    key={row.key}
                    className={`transition-colors ${
                      isActive ? 'bg-blue-50/30' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">
                      {row.category}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          value={row.qty || ''}
                          placeholder="0"
                          aria-label={`Cantidad para ${row.label}`}
                          onChange={(e) =>
                            onChangeQuantity(
                              row.key,
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            )
                          }
                          className={`h-9 w-24 px-2.5 text-right font-mono tabular-nums text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                            isActive
                              ? 'border-blue-400 bg-white font-semibold text-slate-900'
                              : 'border-slate-200 bg-slate-50/60 text-slate-700'
                          }`}
                        />
                        <span className="text-xs text-slate-400 w-8 text-left">
                          {row.unitLabel}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {formatMXN(row.unitPrice)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap ${
                        isActive
                          ? 'font-bold text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatMXN(row.subtotalSale)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {formatMXN(row.subtotalCost)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap ${
                        isActive
                          ? 'font-semibold text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatMXN(row.profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-sm">
                <td className="py-3.5 px-4 text-slate-900" colSpan={2}>
                  Totales Generales
                </td>
                <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-900 pr-12">
                  {computed.totalItems.toLocaleString('es-MX')}
                </td>
                <td className="py-3.5 px-3 text-right text-slate-400">—</td>
                <td className="py-3.5 px-3 text-right font-mono tabular-nums text-base text-slate-900">
                  {formatMXN(computed.totalSale)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700">
                  {formatMXN(computed.totalCost)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700">
                  {formatMXN(computed.netProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
};
