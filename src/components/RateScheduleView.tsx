import React from 'react';

export const RateScheduleView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blanco y Negro */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Tarifas Blanco y Negro (B/N Normal)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Precios por volumen total acumulado de impresiones. Hoja pesada
              (&gt;50% cobertura): $6.00 fijo.
            </p>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Carta — 1 Cara
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 font-mono tabular-nums">
                  <li className="flex justify-between">
                    <span>1 a 20 págs.</span>
                    <strong className="text-slate-900">$1.00</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>21 a 385 págs.</span>
                    <strong className="text-slate-900">$0.70</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>386 a 999 págs.</span>
                    <strong className="text-slate-900">$0.60</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>1,000+ págs.</span>
                    <strong className="text-slate-900">$0.55</strong>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Carta — 2 Caras (Dúplex)
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 font-mono tabular-nums">
                  <li className="flex justify-between">
                    <span>1 a 20 págs.</span>
                    <strong className="text-slate-900">$1.00</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>21 a 385 págs.</span>
                    <strong className="text-slate-900">$0.55</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>386 a 999 págs.</span>
                    <strong className="text-slate-900">$0.45</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>1,000 a 5,000 págs.</span>
                    <strong className="text-slate-900">$0.40</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>5,001+ págs.</span>
                    <strong className="text-slate-900">$0.35</strong>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Oficio — 1 Cara
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 font-mono tabular-nums">
                  <li className="flex justify-between">
                    <span>1 a 20</span>
                    <strong className="text-slate-900">$1.50</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>21 a 485</span>
                    <strong className="text-slate-900">$1.00</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>486+</span>
                    <strong className="text-slate-900">$0.80</strong>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Oficio — 2 Caras
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 font-mono tabular-nums">
                  <li className="flex justify-between">
                    <span>1 a 20</span>
                    <strong className="text-slate-900">$1.50</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>21 a 585</span>
                    <strong className="text-slate-900">$0.80</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>586+</span>
                    <strong className="text-slate-900">$0.70</strong>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Tabloide (B/N y Color)
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 font-mono tabular-nums">
                  <li className="flex justify-between">
                    <span>1 a 60</span>
                    <strong className="text-slate-900">$10.00</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>61 a 100</span>
                    <strong className="text-slate-900">$9.00</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>101+</span>
                    <strong className="text-slate-900">$8.00</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Color y Engargolado */}
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Tarifas Impresión a Color (Carta)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Media Tinta: ≤35% cobertura de color · Full Color: &gt;35%. En
                tamaño Oficio se aplica el escalón de precio previo.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold">Volumen</th>
                    <th className="py-2.5 px-4 text-right font-semibold">
                      Media Tinta
                    </th>
                    <th className="py-2.5 px-4 text-right font-semibold">
                      Full Color
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {[
                    ['1 a 10 imp.', '$4.00', '$6.00'],
                    ['11 a 30 imp.', '$3.50', '$4.00'],
                    ['31 a 100 imp.', '$3.00', '$3.50'],
                    ['101 a 500 imp.', '$2.50', '$3.00'],
                    ['501+ imp.', '$1.50', '$2.00'],
                  ].map(([range, media, full]) => (
                    <tr key={range}>
                      <td className="py-2.5 px-4 text-slate-700">{range}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                        {media}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-blue-800">
                        {full}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Tarifas de Engargolado
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculado por hojas físicas (2 caras = mitad de páginas
                redondeado arriba). Costo interno de insumo: $5.20 / pza.
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono tabular-nums">
              {[
                ['1–20 hojas', '$13.00'],
                ['21–70 hojas', '$15.00'],
                ['71–115 hojas', '$17.00'],
                ['116–200 hojas', '$22.00'],
                ['201+ hojas', '$38.00'],
              ].map(([range, price]) => (
                <div
                  key={range}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3"
                >
                  <div className="text-[11px] text-slate-500 font-sans">
                    {range}
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {price}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
