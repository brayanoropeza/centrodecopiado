import React, { useState } from 'react';
import { QuoteSummary } from '../types';
import { formatMXN } from '../utils/pricing';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Calculator,
} from 'lucide-react';

interface BreakdownPanelProps {
  summary: QuoteSummary;
  onOpenMultiFileModal: () => void;
  onExportCsv: () => void;
  onSendToCashTool: () => void;
}

export const BreakdownPanel: React.FC<BreakdownPanelProps> = ({
  summary,
  onOpenMultiFileModal,
  onExportCsv,
  onSendToCashTool,
}) => {
  const [showInternalCosts, setShowInternalCosts] = useState(false);

  const hasData = summary.documents.length > 0;

  return (
    <section className="space-y-5">
      {/* Tira de Métricas Financieras (Focal Anchor = Cobro al Cliente) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monto a Cobrar al Cliente (Ancla Principal) */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-300">
              Total a Cobrar al Cliente (MXN)
            </span>
            {summary.totalSetsCount > 1 && (
              <span className="text-xs font-mono tabular-nums text-blue-300">
                Prom. {formatMXN(summary.avgPricePerSet)} / juego
              </span>
            )}
          </div>
          <div className="font-mono tabular-nums text-3xl sm:text-4xl font-bold tracking-tight">
            {formatMXN(summary.totalSale)}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="font-mono tabular-nums">
              {summary.totalImpressions.toLocaleString('es-MX')} impresiones
              {summary.totalBindingSets > 0
                ? ` · ${summary.totalBindingSets} eng.`
                : ''}
            </span>
            {hasData && (
              <button
                type="button"
                onClick={onSendToCashTool}
                className="text-blue-300 hover:text-white font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Calculator className="w-3.5 h-3.5" />
                Calcular cambio
              </button>
            )}
          </div>
        </div>

        {/* Costo de Producción */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-medium text-slate-500">
            Costo Interno de Producción
          </span>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-slate-900">
            {formatMXN(summary.totalCost)}
          </div>
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Insumos estimados de papel, tinta y pastas/arillos
          </p>
        </div>

        {/* Ganancia Neta Pura */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">
              Ganancia Neta Pura
            </span>
            {hasData && (
              <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
                Margen {summary.profitMarginPct.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-emerald-700">
            {formatMXN(summary.netProfit)}
          </div>
          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Cobro total menos costo de producción
          </p>
        </div>
      </div>

      {/* Acciones de Reporte */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5">
        <div className="text-sm font-bold text-slate-900">
          Desglose de Cotización
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMultiFileModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver Tabla Resumen Completa por Archivo
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            disabled={!hasData}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-45 disabled:pointer-events-none rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar a Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Tabla de Desglose */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {!hasData ? (
          <div className="p-10 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-700">
              Aún no hay conceptos en la cotización
            </p>
            <p className="text-xs text-slate-500">
              Arrastra archivos PDF/imágenes arriba o ingresa copias físicas
              manuales en el panel izquierdo.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4 text-right">Cantidad</th>
                    <th className="py-3 px-4 text-right">Precio Unitario</th>
                    <th className="py-3 px-4 text-right">Subtotal Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {summary.breakdownLines.map((line) => (
                    <tr
                      key={line.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {line.concept}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {line.detail}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {line.quantity.toLocaleString('es-MX')} {line.unitLabel}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {formatMXN(line.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatMXN(line.subtotalSale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-sm">
                    <td className="py-3 px-4 text-slate-900" colSpan={3}>
                      Total General Venta
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-base font-bold text-slate-900 whitespace-nowrap">
                      {formatMXN(summary.totalSale)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Desplegable de Costos Internos */}
            <div className="border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowInternalCosts((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>
                  Detalle interno de costos de producción y utilidad por renglón
                </span>
                {showInternalCosts ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showInternalCosts && (
                <div className="overflow-x-auto border-t border-slate-100 bg-slate-50/40">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2.5 px-4 font-semibold">Concepto</th>
                        <th className="py-2.5 px-4 text-right font-semibold">
                          Costo Unitario
                        </th>
                        <th className="py-2.5 px-4 text-right font-semibold">
                          Costo Total
                        </th>
                        <th className="py-2.5 px-4 text-right font-semibold">
                          Ganancia Neta
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.breakdownLines.map((line) => {
                        const profit = line.subtotalSale - line.subtotalCost;
                        return (
                          <tr key={`${line.id}-cost`}>
                            <td className="py-2.5 px-4 text-slate-700">
                              {line.concept}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                              {formatMXN(line.unitCost)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                              {formatMXN(line.subtotalCost)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                              {formatMXN(profit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
