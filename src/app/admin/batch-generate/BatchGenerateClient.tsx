'use client';

import { useState } from 'react';
import { Plaque } from '@/lib/db';
import { QRCodeSVG } from 'qrcode.react';
import { formatPlaqueUrl } from '@/lib/utils';
import { Layers, Printer, Download, Plus, CheckCircle2, Sparkles, FileSpreadsheet } from 'lucide-react';

export default function BatchGenerateClient() {
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('PLQ');
  const [batchTag, setBatchTag] = useState(`LOTE-${new Date().toISOString().slice(0, 10)}`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaques, setGeneratedPlaques] = useState<Plaque[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/plaques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BATCH',
          count,
          prefix: prefix.trim().toUpperCase(),
          batchTag: batchTag.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedPlaques(data.plaques);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!generatedPlaques.length) return;

    let csvContent = 'data:text/csv;charset=utf-8,Codigo,URL_NFC_Dinamica,Status,Lote,Data_Criacao\n';
    generatedPlaques.forEach((p) => {
      const url = formatPlaqueUrl(p.code);
      csvContent += `${p.code},${url},${p.status},${p.batchTag || ''},${p.createdAt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lote_plaquinhas_${batchTag || 'novo'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header (oculto na impressão) */}
      <div className="print:hidden mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            Produção e Pré-Impressão
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gerar Lote de Plaquinhas Virgens
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gere códigos e QR Codes em lote para impressão gráfica e gravação em massa de tags NFC.
          </p>
        </div>

        {generatedPlaques.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV / NFC</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Folha de QR Codes</span>
            </button>
          </div>
        )}
      </div>

      {/* Formulário de Geração (oculto na impressão) */}
      <div className="print:hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Quantidade de Plaquinhas
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
            >
              <option value={5}>5 Plaquinhas</option>
              <option value={10}>10 Plaquinhas</option>
              <option value={20}>20 Plaquinhas</option>
              <option value={50}>50 Plaquinhas</option>
              <option value={100}>100 Plaquinhas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Prefixo do Código
            </label>
            <input
              type="text"
              required
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              placeholder="Ex: PLQ ou TAG"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Identificador do Lote
            </label>
            <input
              type="text"
              value={batchTag}
              onChange={(e) => setBatchTag(e.target.value)}
              placeholder="Ex: LOTE-OUTUBRO-2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Gerando...' : 'Gerar Plaquinhas'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grade de Impressão e Visualização */}
      {generatedPlaques.length > 0 ? (
        <div className="space-y-6">
          <div className="print:hidden flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {generatedPlaques.length} Plaquinhas prontas para impressão e gravação
            </span>
          </div>

          {/* Grid de Plaquinhas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-3 print:gap-4 print:text-black">
            {generatedPlaques.map((plaque) => {
              const url = formatPlaqueUrl(plaque.code);
              return (
                <div
                  key={plaque.code}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center shadow-md print:bg-white print:border-2 print:border-black print:text-black print:rounded-lg"
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400 print:text-black mb-1">
                    Avaliação Google
                  </div>

                  <div className="p-2.5 bg-white rounded-xl shadow-inner my-2">
                    <QRCodeSVG
                      value={url}
                      size={130}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
                        x: undefined,
                        y: undefined,
                        height: 28,
                        width: 28,
                        excavate: true,
                      }}
                    />
                  </div>

                  <div className="mt-1 w-full">
                    <div className="font-mono font-extrabold text-sm text-white print:text-black tracking-wider">
                      {plaque.code}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 print:text-gray-700 truncate w-full mt-0.5">
                      /r/{plaque.code}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="print:hidden bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum lote gerado nesta sessão</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Escolha a quantidade acima e clique em &quot;Gerar Plaquinhas&quot; para criar códigos e folhas de QR Code prontas para corte e impressão.
          </p>
        </div>
      )}
    </div>
  );
}
