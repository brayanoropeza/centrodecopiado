import React, { useMemo, useState } from 'react';
import { formatMXN } from '../utils/pricing';
import {
  ArrowRight,
  Banknote,
  Calculator,
  Plus,
  RotateCcw,
  X as MultiplyIcon,
} from 'lucide-react';

interface CounterToolsProps {
  syncedQuoteTotal: number;
  customAmountOverride: number | null;
  onClearOverride: () => void;
}

const QUICK_BILLS = [20, 50, 100, 200, 500, 1000];

export const CounterTools: React.FC<CounterToolsProps> = ({
  syncedQuoteTotal,
  customAmountOverride,
  onClearOverride,
}) => {
  // 1. Calculadora de Cambio
  const [manualTotalStr, setManualTotalStr] = useState<string>('');
  const [cashReceivedStr, setCashReceivedStr] = useState<string>('');

  const effectiveTotalToCharge = useMemo(() => {
    if (manualTotalStr.trim() !== '') {
      const parsed = parseFloat(manualTotalStr);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }
    if (customAmountOverride !== null) {
      return customAmountOverride;
    }
    return syncedQuoteTotal;
  }, [manualTotalStr, customAmountOverride, syncedQuoteTotal]);

  const cashReceived = useMemo(() => {
    const parsed = parseFloat(cashReceivedStr);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }, [cashReceivedStr]);

  const changeDiff = cashReceived - effectiveTotalToCharge;

  // 2. Sumadora Rápida
  const [adderText, setAdderText] = useState<string>('');

  const adderResult = useMemo(() => {
    const tokens = adderText
      .split(/[\n,;+\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const numbers: number[] = [];
    for (const token of tokens) {
      const cleaned = token.replace(/[^0-9.-]/g, '');
      const n = parseFloat(cleaned);
      if (Number.isFinite(n)) {
        numbers.push(n);
      }
    }
    const sum = numbers.reduce((acc, v) => acc + v, 0);
    return { sum, count: numbers.length };
  }, [adderText]);

  // 3. Multiplicadora Rápida
  const [multA, setMultA] = useState<string>('');
  const [multB, setMultB] = useState<string>('');

  const multResult = useMemo(() => {
    const a = parseFloat(multA);
    const b = parseFloat(multB);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
    return a * b;
  }, [multA, multB]);

  const handleAppendMultToAdder = () => {
    if (multResult === 0) return;
    setAdderText((prev) =>
      prev.trim()
        ? `${prev.trim()}\n${multResult.toFixed(2)}`
        : multResult.toFixed(2)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* 1. Calculadora de Cambio */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-blue-700 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Calculadora de Cambio
              </h2>
              <p className="text-xs text-slate-500">
                Cobro en mostrador en efectivo
              </p>
            </div>
          </div>
          {(cashReceivedStr || manualTotalStr) && (
            <button
              type="button"
              onClick={() => {
                setCashReceivedStr('');
                setManualTotalStr('');
                onClearOverride();
              }}
              className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Monto a cobrar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="cash-total-charge"
              className="font-semibold text-slate-700"
            >
              Total a Cobrar (MXN)
            </label>
            <span className="text-slate-500">
              {manualTotalStr.trim() !== ''
                ? 'Monto manual'
                : 'Sincronizado con cotizador'}
            </span>
          </div>
          <input
            id="cash-total-charge"
            type="number"
            min={0}
            step="0.50"
            value={
              manualTotalStr !== ''
                ? manualTotalStr
                : effectiveTotalToCharge > 0
                  ? effectiveTotalToCharge.toFixed(2)
                  : ''
            }
            placeholder="0.00"
            onChange={(e) => setManualTotalStr(e.target.value)}
            className="h-11 w-full px-3.5 font-mono tabular-nums text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>

        {/* Efectivo recibido */}
        <div className="space-y-2">
          <label
            htmlFor="cash-received"
            className="block text-xs font-semibold text-slate-700"
          >
            Efectivo Recibido
          </label>
          <input
            id="cash-received"
            type="number"
            min={0}
            step="1"
            value={cashReceivedStr}
            placeholder="Ingresa el pago del cliente..."
            onChange={(e) => setCashReceivedStr(e.target.value)}
            className="h-11 w-full px-3.5 font-mono tabular-nums text-lg font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />

          {/* Denominaciones rápidas */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {QUICK_BILLS.map((bill) => (
              <button
                key={bill}
                type="button"
                onClick={() => setCashReceivedStr(String(bill))}
                className="py-1.5 px-2 text-xs font-mono tabular-nums font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                ${bill}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setCashReceivedStr(effectiveTotalToCharge.toFixed(2))
              }
              className="col-span-2 py-1.5 px-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
            >
              Pago Exacto
            </button>
          </div>
        </div>

        {/* Resultado del cambio */}
        <div
          className={`rounded-xl p-4 border ${
            cashReceivedStr.trim() === ''
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : changeDiff >= 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="text-xs font-semibold">
            {cashReceivedStr.trim() === ''
              ? 'Esperando efectivo recibido'
              : changeDiff >= 0
                ? 'Cambio a regresar al cliente'
                : 'Falta por cubrir'}
          </div>
          <div className="font-mono tabular-nums text-3xl font-bold mt-1">
            {cashReceivedStr.trim() === ''
              ? formatMXN(0)
              : formatMXN(Math.abs(changeDiff))}
          </div>
        </div>
      </section>

      {/* 2. Sumadora Rápida */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-blue-700 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sumadora Rápida
              </h2>
              <p className="text-xs text-slate-500">
                Anota cantidades sueltas para sumar al instante
              </p>
            </div>
          </div>
          {adderText && (
            <button
              type="button"
              onClick={() => setAdderText('')}
              className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="quick-adder-textarea"
            className="block text-xs font-medium text-slate-600"
          >
            Separa los valores por salto de línea, espacio, coma o signo +
          </label>
          <textarea
            id="quick-adder-textarea"
            rows={7}
            value={adderText}
            onChange={(e) => setAdderText(e.target.value)}
            placeholder={'15.50\n20\n10\n45.00'}
            className="w-full p-3.5 font-mono tabular-nums text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-y"
          />
        </div>

        <div className="rounded-xl bg-slate-900 text-white p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">
              Suma Total ({adderResult.count}{' '}
              {adderResult.count === 1 ? 'valor' : 'valores'})
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold mt-0.5">
              {formatMXN(adderResult.sum)}
            </div>
          </div>
          {adderResult.sum > 0 && (
            <button
              type="button"
              onClick={() => setManualTotalStr(adderResult.sum.toFixed(2))}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
              title="Pasar resultado a Calculadora de Cambio"
            >
              Cobrar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* 3. Multiplicadora Rápida */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-blue-700 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Multiplicadora Rápida
              </h2>
              <p className="text-xs text-slate-500">
                Cálculo exprés de Cantidad A × Cantidad B
              </p>
            </div>
          </div>
          {(multA || multB) && (
            <button
              type="button"
              onClick={() => {
                setMultA('');
                setMultB('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="mult-a"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Cantidad A (ej. copias o piezas)
            </label>
            <input
              id="mult-a"
              type="number"
              step="any"
              value={multA}
              placeholder="0"
              onChange={(e) => setMultA(e.target.value)}
              className="h-11 w-full px-3.5 font-mono tabular-nums text-base font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-center text-slate-400">
            <MultiplyIcon className="w-4 h-4" />
          </div>

          <div>
            <label
              htmlFor="mult-b"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Cantidad B (ej. precio unitario)
            </label>
            <input
              id="mult-b"
              type="number"
              step="any"
              value={multB}
              placeholder="0.00"
              onChange={(e) => setMultB(e.target.value)}
              className="h-11 w-full px-3.5 font-mono tabular-nums text-base font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div>
            <div className="text-xs font-medium text-slate-500">Resultado</div>
            <div className="font-mono tabular-nums text-3xl font-bold text-slate-900 mt-0.5">
              {multResult.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {multResult > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleAppendMultToAdder}
                className="flex-1 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Agregar a Sumadora
              </button>
              <button
                type="button"
                onClick={() => setManualTotalStr(multResult.toFixed(2))}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Pasar a Cambio
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
