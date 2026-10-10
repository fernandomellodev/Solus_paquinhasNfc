import { getPlaqueByCode, recordScan } from '@/lib/db';
import { headers } from 'next/headers';
import RedirectClient from './RedirectClient';
import Link from 'next/link';
import { QrCode, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PlaqueRedirectPage({ params }: PageProps) {
  const { code } = await params;
  const plaque = getPlaqueByCode(code);

  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown';
  const referrer = headersList.get('referer') || 'Direct/NFC';

  // Caso 1: Plaquinha não existe ou ainda é virgem (não cadastrada)
  if (!plaque || plaque.status === 'VIRGIN' || !plaque.googleReviewUrl) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <QrCode className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
            Plaquinha Nova
          </span>

          <h1 className="text-2xl font-bold text-white mb-2">
            Código: <span className="text-amber-400 font-mono">{code.toUpperCase()}</span>
          </h1>

          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Esta plaquinha NFC / QR Code ainda não foi vinculada a um estabelecimento. Você pode ativá-la agora em menos de 10 segundos!
          </p>

          <Link
            href={`/admin/quick-register?code=${encodeURIComponent(code.toUpperCase())}`}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-98"
          >
            <span>Cadastrar Plaquinha Agora</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="mt-6 text-xs text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            Sistema Solus de Plaquinhas Inteligentes
          </div>
        </div>
      </div>
    );
  }

  // Caso 2: Plaquinha Pausada
  if (plaque.status === 'PAUSED') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Página Temporariamente Indisponível</h1>
          <p className="text-slate-400 text-sm">
            Este link de avaliação está pausado temporariamente pelo estabelecimento.
          </p>
        </div>
      </div>
    );
  }

  // Plaquinha Ativa -> Registra o scan
  recordScan(plaque.id, userAgent, referrer);

  // Renderiza o componente de redirecionamento ou filtro de estrelas
  return (
    <RedirectClient
      code={plaque.code}
      title={plaque.title || 'Estabelecimento'}
      placeName={plaque.placeName}
      destinationUrl={plaque.googleReviewUrl}
      feedbackGate={plaque.feedbackGate}
    />
  );
}
