'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plaque } from '@/lib/db';
import {
  QrCode,
  Zap,
  Layers,
  Search,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Star,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import EditPlaqueModal from '@/components/EditPlaqueModal';
import { formatPlaqueUrl } from '@/lib/utils';

interface StatsData {
  totalPlaques: number;
  activePlaques: number;
  virginPlaques: number;
  totalScans: number;
  scansToday: number;
  recentScans: any[];
  recentFeedbacks: any[];
}

export default function AdminDashboardClient() {
  const [plaques, setPlaques] = useState<Plaque[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPlaque, setSelectedPlaque] = useState<Plaque | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [plaquesRes, statsRes] = await Promise.all([
        fetch(`/api/plaques?status=${statusFilter}&search=${encodeURIComponent(search)}`),
        fetch('/api/stats'),
      ]);

      const plaquesData = await plaquesRes.json();
      const statsData = await statsRes.json();

      if (plaquesData.success) {
        setPlaques(plaquesData.plaques);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = (code: string) => {
    const url = formatPlaqueUrl(code);
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenEdit = (plaque: Plaque) => {
    setSelectedPlaque(plaque);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Painel de Plaquinhas NFC
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Gerenciamento de QR Codes dinâmicos e aproximações Google Reviews
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/quick-register"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-5 rounded-2xl shadow-lg shadow-blue-500/25 transition active:scale-95 text-sm"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>⚡ Cadastrar em 5s</span>
          </Link>

          <Link
            href="/admin/batch-generate"
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 px-4 rounded-2xl border border-slate-700 transition text-sm"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Gerar Lote</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Plaquinhas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Plaquinhas
            </span>
            <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalPlaques ?? 0}
            </span>
            <span className="text-xs text-slate-500">fabricadas</span>
          </div>
        </div>

        {/* Plaquinhas Ativas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ativas com Clientes
            </span>
            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {stats?.activePlaques ?? 0}
            </span>
            <span className="text-xs text-slate-500">em uso</span>
          </div>
        </div>

        {/* Plaquinhas Virgens */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estoque Virgem
            </span>
            <div className="w-8 h-8 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">
              {stats?.virginPlaques ?? 0}
            </span>
            <span className="text-xs text-slate-500">disponíveis</span>
          </div>
        </div>

        {/* Total de Scans */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total de Avaliações
            </span>
            <div className="w-8 h-8 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.totalScans ?? 0}
            </span>
            <span className="text-xs text-purple-400 font-medium">
              +{stats?.scansToday ?? 0} hoje
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Plaque Table & Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, empresa..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {[
              { key: 'ALL', label: 'Todas' },
              { key: 'ACTIVE', label: 'Ativas' },
              { key: 'VIRGIN', label: 'Virgens' },
              { key: 'PAUSED', label: 'Pausadas' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                  statusFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plaque Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Código</th>
                <th className="pb-3">Estabelecimento / Cliente</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Filtro 5★</th>
                <th className="pb-3">Acessos</th>
                <th className="pb-3">Último Acesso</th>
                <th className="pb-3 text-right pr-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    Carregando plaquinhas...
                  </td>
                </tr>
              ) : plaques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <QrCode className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Nenhuma plaquinha encontrada.
                    <div className="mt-3">
                      <Link
                        href="/admin/quick-register"
                        className="inline-flex items-center gap-1.5 text-blue-400 hover:underline font-semibold"
                      >
                        <Plus className="w-4 h-4" /> Cadastrar agora em 5s
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                plaques.map((plaque) => {
                  const url = formatPlaqueUrl(plaque.code);
                  return (
                    <tr
                      key={plaque.code}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Código */}
                      <td className="py-3.5 pl-2 font-mono font-bold text-white">
                        <span className="px-2.5 py-1 bg-slate-800 rounded-lg text-blue-400 border border-slate-700/60 inline-flex items-center gap-1">
                          #{plaque.code}
                        </span>
                      </td>

                      {/* Empresa / Cliente */}
                      <td className="py-3.5">
                        {plaque.title ? (
                          <div>
                            <span className="font-bold text-slate-200 block text-sm">
                              {plaque.title}
                            </span>
                            {plaque.placeName && (
                              <span className="text-[11px] text-slate-400 block">
                                {plaque.placeName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Sem estabelecimento</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            plaque.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : plaque.status === 'PAUSED'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {plaque.status === 'ACTIVE'
                            ? 'Ativa'
                            : plaque.status === 'PAUSED'
                            ? 'Pausada'
                            : 'Virgem'}
                        </span>
                      </td>

                      {/* Filtro 5 Estrelas */}
                      <td className="py-3.5">
                        {plaque.feedbackGate ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-semibold flex items-center gap-1 w-fit">
                            <Star className="w-3 h-3 fill-amber-400" /> Ativo
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Direto</span>
                        )}
                      </td>

                      {/* Acessos */}
                      <td className="py-3.5">
                        <span className="font-semibold text-white">
                          {plaque.totalScans}
                        </span>{' '}
                        <span className="text-slate-500 text-[11px]">scans</span>
                      </td>

                      {/* Último Acesso */}
                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {plaque.lastScannedAt
                          ? new Date(plaque.lastScannedAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copiar URL NFC */}
                          <button
                            onClick={() => handleCopy(plaque.code)}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
                            title="Copiar URL para gravação NFC"
                          >
                            {copiedCode === plaque.code ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Testar Redirecionamento */}
                          <a
                            href={`/r/${plaque.code}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
                            title="Abrir página de redirecionamento"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Gerenciar / Editar */}
                          <button
                            onClick={() => handleOpenEdit(plaque)}
                            className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-medium text-xs transition flex items-center gap-1"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                            <span>Gerenciar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      <EditPlaqueModal
        plaque={selectedPlaque}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={fetchData}
      />
    </div>
  );
}
