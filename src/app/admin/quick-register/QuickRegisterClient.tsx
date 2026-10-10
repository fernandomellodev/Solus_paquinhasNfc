'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap,
  Camera,
  CheckCircle2,
  ExternalLink,
  Plus,
  Sparkles,
  QrCode,
  ShieldCheck,
  Nfc,
  Building,
  Link as LinkIcon,
  Phone,
  HelpCircle,
} from 'lucide-react';
import QRScannerModal from '@/components/QRScannerModal';
import { cleanGoogleReviewUrl } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface RegisteredItem {
  code: string;
  title: string;
  googleReviewUrl: string;
  timestamp: string;
}

export default function QuickRegisterClient() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode.toUpperCase());
  const [title, setTitle] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [feedbackGate, setFeedbackGate] = useState(false);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successPlaque, setSuccessPlaque] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentRegistered, setRecentRegistered] = useState<RegisteredItem[]>([]);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
      // Foca automaticamente no campo do nome da empresa
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300);
    }
  }, [initialCode]);

  const handleScanSuccess = (scannedCode: string) => {
    setCode(scannedCode.toUpperCase());
    setError(null);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Por favor, informe ou escaneie o código da plaquinha.');
      return;
    }

    if (!title.trim()) {
      setError('Por favor, digite o nome do estabelecimento / cliente.');
      return;
    }

    if (!googleReviewUrl.trim()) {
      setError('Por favor, cole o link de avaliação do Google.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanedUrl = cleanGoogleReviewUrl(googleReviewUrl);
      const res = await fetch('/api/plaques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          googleReviewUrl: cleanedUrl,
          placeName: placeName.trim() || undefined,
          clientPhone: clientPhone.trim() || undefined,
          status: 'ACTIVE',
          feedbackGate,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao cadastrar plaquinha');
      }

      // Sucesso!
      setSuccessPlaque(data.plaque);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}

      // Adiciona na lista rápida da sessão
      setRecentRegistered((prev) => [
        {
          code: data.plaque.code,
          title: data.plaque.title,
          googleReviewUrl: data.plaque.googleReviewUrl,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao cadastrar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPlaque = () => {
    setSuccessPlaque(null);
    setCode('');
    setTitle('');
    setGoogleReviewUrl('');
    setPlaceName('');
    setClientPhone('');
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            Ativação Expressa em Poucos Segundos
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cadastrar Plaquinha NFC
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Escaneie o QR Code da plaquinha nova, insira o link do Google e ative na hora.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-5 rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-95"
        >
          <Camera className="w-5 h-5" />
          <span>Escanear com a Câmera</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário Principal */}
        <div className="lg:col-span-7">
          {successPlaque ? (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                Plaquinha Ativada com Sucesso!
              </span>

              <h2 className="text-2xl font-bold text-white mt-3 mb-1">
                {successPlaque.title}
              </h2>
              <p className="text-slate-400 text-xs font-mono">
                Código: <span className="text-blue-400 font-bold">#{successPlaque.code}</span>
              </p>

              <div className="my-6 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">URL Dinâmica NFC:</span>
                  <a
                    href={`/r/${successPlaque.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline font-mono inline-flex items-center gap-1 font-semibold"
                  >
                    /r/{successPlaque.code} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Destino Google:</span>
                  <span className="truncate max-w-[200px] text-slate-300 font-mono">
                    {successPlaque.googleReviewUrl}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleNextPlaque}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition active:scale-95 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Próxima Plaquinha</span>
                </button>

                <a
                  href={`/r/${successPlaque.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-2xl text-sm transition inline-flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Testar no Navegador</span>
                </a>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
            >
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-medium">
                  {error}
                </div>
              )}

              {/* 1. Código da Plaquinha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    1. Código da Plaquinha *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Abrir Câmera
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ex: PLQ-8932 ou leia com a câmera"
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-white text-base font-mono font-bold tracking-wider placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition uppercase"
                  />
                </div>
              </div>

              {/* 2. Nome da Empresa */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  2. Nome da Empresa / Estabelecimento *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building className="w-5 h-5" />
                  </div>
                  <input
                    ref={titleInputRef}
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Barbearia Vip, Restaurante Sabor Real..."
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition font-medium"
                  />
                </div>
              </div>

              {/* 3. Link do Google Avaliações */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Link de Avaliação do Google *
                  </label>
                  {googleReviewUrl && (
                    <a
                      href={googleReviewUrl.startsWith('http') ? googleReviewUrl : `https://${googleReviewUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Testar Link
                    </a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="Cole aqui o link do Google (g.page/r/.../review ou link curto)"
                    className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 rounded-2xl pl-11 pr-4 py-3 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>

              {/* Campos Opcionais Expansíveis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Categoria (Opcional)
                  </label>
                  <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="Ex: Restaurante e Bar"
                    className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    WhatsApp do Cliente (Opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Filtro 5 Estrelas */}
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="feedbackGate"
                  checked={feedbackGate}
                  onChange={(e) => setFeedbackGate(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                />
                <label htmlFor="feedbackGate" className="text-xs cursor-pointer select-none">
                  <span className="font-semibold text-slate-200 block mb-0.5">
                    Ativar Filtro Inteligente de 5 Estrelas
                  </span>
                  <span className="text-slate-400 block leading-relaxed">
                    Se desativado, o cliente vai direto para o Google em 1 segundo. Se ativado, abre tela de satisfação prévia.
                  </span>
                </label>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/25 transition active:scale-98 text-base"
              >
                {isLoading ? (
                  <span>Ativando plaquinha...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white" />
                    <span>Ativar Plaquinha em 1 Clique</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Lado Direito: Instruções Rápidas e Histórico Recente */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Como Funciona */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Como funciona o cadastro rápido?
            </h3>
            <ol className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </span>
                <span>
                  Pegue a plaquinha física recém-chegada e aponte a câmera para o QR Code (ou digite o código dela).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </span>
                <span>
                  Insira o nome do cliente e cole o link direto de avaliação do Google Meu Negócio.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </span>
                <span>
                  Clique em <b>Ativar</b>. Pronto! A plaquinha já está funcionando e pronta para entrega.
                </span>
              </li>
            </ol>
          </div>

          {/* Plaquinhas cadastradas nesta sessão */}
          {recentRegistered.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Cadastradas Nesta Sessão
              </h3>
              <div className="space-y-2.5">
                {recentRegistered.map((item) => (
                  <div
                    key={item.code}
                    className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{item.title}</span>
                      <span className="text-[11px] font-mono text-blue-400">#{item.code}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal da Câmera */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
