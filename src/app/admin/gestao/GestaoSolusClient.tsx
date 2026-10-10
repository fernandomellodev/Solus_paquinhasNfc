'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  UserX,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Save,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  ShoppingBag,
  Layers,
  Search,
  RefreshCw,
  Check,
  CalendarDays,
  Store,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Sale {
  id: string;
  clientName: string;
  saleDate: string;
  deliveryDate: string | null;
  amount: number;
  itemSold: string;
  status: 'PENDENTE' | 'ENTREGUE' | 'CONCLUIDA' | 'CANCELADA';
  paymentMethod: string | null;
  notes: string | null;
}

interface DailyLog {
  id: string;
  date: string;
  dayOfWeek: string;
  totalBusinesses: number;
  ownerAbsent: number;
  declined: number;
  accepted: number;
  revenue: number;
  prospectingHours: number;
  notes: string | null;
}

interface ServiceOffer {
  id: string;
  name: string;
  description: string | null;
  defaultPrice: number;
  active: boolean;
}

interface WeeklyTotals {
  totalBusinesses: number;
  totalOwnerAbsent: number;
  totalDeclined: number;
  totalAccepted: number;
  totalProspectingHours: number;
  totalRevenue: number;
  totalSalesCount: number;
  conversionRate: number;
  visitSuccessRate: number;
  revenuePerHour: number;
  averageTicket: number;
}

const DAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DAYS_FULL = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

function formatFullDisplayDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
}

export default function GestaoSolusClient() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [todayISO] = useState<string>(() => formatDateISO(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateISO(new Date()));
  const [isLoading, setIsLoading] = useState(true);

  // Main navigation tab on mobile/desktop
  const [activeTab, setActiveTab] = useState<'prospeccao' | 'vendas' | 'balanco'>('prospeccao');

  // Data states
  const [totals, setTotals] = useState<WeeklyTotals>({
    totalBusinesses: 0,
    totalOwnerAbsent: 0,
    totalDeclined: 0,
    totalAccepted: 0,
    totalProspectingHours: 0,
    totalRevenue: 0,
    totalSalesCount: 0,
    conversionRate: 0,
    visitSuccessRate: 0,
    revenuePerHour: 0,
    averageTicket: 0,
  });

  const [dailyLogs, setDailyLogs] = useState<{ [date: string]: DailyLog }>({});
  const [sales, setSales] = useState<Sale[]>([]);
  const [services, setServices] = useState<ServiceOffer[]>([]);

  // Feedback states
  const [savingDay, setSavingDay] = useState(false);
  const [savedSuccessDay, setSavedSuccessDay] = useState(false);
  const [searchSale, setSearchSale] = useState('');

  // Quick Sale Bottom Sheet / Modal
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [quickClient, setQuickClient] = useState('');
  const [quickDate, setQuickDate] = useState(() => formatDateISO(new Date()));
  const [quickItem, setQuickItem] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [isSavingQuickSale, setIsSavingQuickSale] = useState(false);

  // Edit / Detailed Sale Modal
  const [isEditSaleModalOpen, setIsEditSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleFormData, setSaleFormData] = useState<{
    clientName: string;
    saleDate: string;
    deliveryDate: string;
    amount: string;
    itemSold: string;
    status: 'PENDENTE' | 'ENTREGUE' | 'CONCLUIDA' | 'CANCELADA';
    paymentMethod: string;
    notes: string;
  }>({
    clientName: '',
    saleDate: formatDateISO(new Date()),
    deliveryDate: '',
    amount: '',
    itemSold: '',
    status: 'CONCLUIDA',
    paymentMethod: 'PIX',
    notes: '',
  });

  // Services Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Week Dates
  const weekDates = React.useMemo(() => {
    const dates: { dateStr: string; dayShort: string; dayFull: string; formatted: string; dateObj: Date; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      const dateStr = formatDateISO(d);
      dates.push({
        dateStr,
        dayShort: DAYS_SHORT[i],
        dayFull: DAYS_FULL[i],
        formatted: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        dateObj: d,
        isToday: dateStr === todayISO,
      });
    }
    return dates;
  }, [currentMonday, todayISO]);

  const weekStartStr = weekDates[0]?.dateStr;
  const weekEndStr = weekDates[6]?.dateStr;

  // Make sure selectedDate falls in the current week or default to today
  useEffect(() => {
    const exists = weekDates.some((w) => w.dateStr === selectedDate);
    if (!exists) {
      const isTodayInWeek = weekDates.find((w) => w.dateStr === todayISO);
      setSelectedDate(isTodayInWeek ? todayISO : weekDates[0]?.dateStr);
    }
  }, [currentMonday, weekDates, selectedDate, todayISO]);

  // Load Data
  const loadWeekData = async () => {
    if (!weekStartStr || !weekEndStr) return;
    setIsLoading(true);
    try {
      const [summaryRes, servicesRes] = await Promise.all([
        fetch(`/api/gestao/summary?startDate=${weekStartStr}&endDate=${weekEndStr}`),
        fetch('/api/gestao/services'),
      ]);

      const summaryData = await summaryRes.json();
      const servicesData = await servicesRes.json();

      if (summaryData.success) {
        setTotals(summaryData.totals);
        setSales(summaryData.sales || []);

        const logsMap: { [date: string]: DailyLog } = {};
        (summaryData.dailyLogs || []).forEach((log: DailyLog) => {
          logsMap[log.date] = log;
        });

        weekDates.forEach((wd) => {
          if (!logsMap[wd.dateStr]) {
            logsMap[wd.dateStr] = {
              id: '',
              date: wd.dateStr,
              dayOfWeek: wd.dayFull,
              totalBusinesses: 0,
              ownerAbsent: 0,
              declined: 0,
              accepted: 0,
              revenue: 0,
              prospectingHours: 0,
              notes: '',
            };
          }
        });

        setDailyLogs(logsMap);
      }

      if (servicesData.success) {
        setServices(servicesData.services || []);
        if (!quickItem && servicesData.services?.length > 0) {
          setQuickItem(servicesData.services[0].name);
          setQuickAmount(String(servicesData.services[0].defaultPrice || 50));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeekData();
  }, [currentMonday]);

  // Week navigation
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleCurrentWeek = () => {
    setCurrentMonday(getMonday(new Date()));
    setSelectedDate(todayISO);
  };

  // Active day object
  const activeDayLog = dailyLogs[selectedDate] || {
    id: '',
    date: selectedDate,
    dayOfWeek: weekDates.find((w) => w.dateStr === selectedDate)?.dayFull || 'Dia',
    totalBusinesses: 0,
    ownerAbsent: 0,
    declined: 0,
    accepted: 0,
    revenue: 0,
    prospectingHours: 0,
    notes: '',
  };

  const activeDayInfo = weekDates.find((w) => w.dateStr === selectedDate);
  const activeDaySales = sales.filter((s) => s.saleDate === selectedDate);

  // Stepper helper: modifies a metric and auto-adjusts totals
  const handleStepMetric = (field: 'totalBusinesses' | 'ownerAbsent' | 'declined' | 'accepted', delta: number) => {
    const currentVal = activeDayLog[field] || 0;
    const newVal = Math.max(0, currentVal + delta);

    const updated = { ...activeDayLog, [field]: newVal };

    // If incrementing outcome (accepted, declined, ownerAbsent), auto bump totalBusinesses if needed
    if (delta > 0 && field !== 'totalBusinesses') {
      const sumOutcomes = updated.accepted + updated.declined + updated.ownerAbsent;
      if (updated.totalBusinesses < sumOutcomes) {
        updated.totalBusinesses = sumOutcomes;
      }
    }

    setDailyLogs((prev) => ({ ...prev, [selectedDate]: updated }));
  };

  // Save current active day
  const handleSaveActiveDay = async () => {
    setSavingDay(true);
    try {
      const res = await fetch('/api/gestao/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeDayLog),
      });
      const data = await res.json();
      if (data.success) {
        setDailyLogs((prev) => ({ ...prev, [selectedDate]: data.log }));
        setSavedSuccessDay(true);
        setTimeout(() => setSavedSuccessDay(false), 2000);
        loadWeekData();
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setSavingDay(false);
    }
  };

  // Quick Sale Submission (Instant 5-second street registration)
  const handleQuickSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClient.trim() || !quickAmount) {
      alert('Informe o nome do cliente e o valor.');
      return;
    }

    setIsSavingQuickSale(true);
    try {
      const item = quickItem.trim() || services[0]?.name || 'Plaquinha NFC/QR Google';
      const res = await fetch('/api/gestao/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: quickClient.trim(),
          saleDate: quickDate,
          amount: Number(quickAmount) || 0,
          itemSold: item,
          status: 'CONCLUIDA',
          paymentMethod: 'PIX',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQuickClient('');
        setIsQuickSaleOpen(false);
        await loadWeekData();
      }
    } catch (err) {
      console.error('Erro ao salvar venda rápida:', err);
    } finally {
      setIsSavingQuickSale(false);
    }
  };

  // Delete sale
  const handleDeleteSale = async (id: string) => {
    if (!confirm('Deseja excluir esta venda?')) return;
    try {
      const res = await fetch(`/api/gestao/sales?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadWeekData();
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  // Open Edit Sale Modal
  const handleOpenEditSaleModal = (sale: Sale) => {
    setEditingSale(sale);
    setSaleFormData({
      clientName: sale.clientName,
      saleDate: sale.saleDate,
      deliveryDate: sale.deliveryDate || '',
      amount: String(sale.amount),
      itemSold: sale.itemSold,
      status: sale.status,
      paymentMethod: sale.paymentMethod || 'PIX',
      notes: sale.notes || '',
    });
    setIsEditSaleModalOpen(true);
  };

  // Save Edit Sale Modal
  const handleSaveEditSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;
    try {
      const res = await fetch('/api/gestao/sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSale.id,
          ...saleFormData,
          amount: Number(saleFormData.amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditSaleModalOpen(false);
        loadWeekData();
      }
    } catch (err) {
      console.error('Erro ao editar venda:', err);
    }
  };

  // Add Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    try {
      const res = await fetch('/api/gestao/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newServiceName,
          defaultPrice: Number(newServicePrice || 0),
          description: newServiceDesc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => [...prev, data.service]);
        setNewServiceName('');
        setNewServicePrice('');
        setNewServiceDesc('');
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm('Desativar este serviço do catálogo?')) return;
    try {
      const res = await fetch(`/api/gestao/services?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  // Filtered sales
  const filteredSales = sales.filter((s) => {
    if (!searchSale.trim()) return true;
    const term = searchSale.toLowerCase();
    return (
      s.clientName.toLowerCase().includes(term) ||
      s.itemSold.toLowerCase().includes(term) ||
      (s.notes && s.notes.toLowerCase().includes(term))
    );
  });

  const totalFilteredSalesAmount = filteredSales.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="min-h-screen bg-[#0e1117] text-slate-100 pb-28 font-sans selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP BAR ULTRA COMPACTO & ELEGANTE */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#141822]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Status */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-tight">
                Gestão <span className="text-emerald-400">Solus</span>
              </h1>
              <span className="text-[10px] text-slate-400 block font-mono">
                {formatDisplayDate(weekStartStr)} a {formatDisplayDate(weekEndStr)}
              </span>
            </div>
          </div>

          {/* Navegador de Semanas Compacto */}
          <div className="flex items-center gap-1 bg-[#0e1117] border border-slate-800 rounded-xl p-1">
            <button
              onClick={handlePrevWeek}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Semana Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCurrentWeek}
              className="px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:text-white rounded-md bg-slate-800/60"
            >
              Hoje
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Próxima Semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Abas (Mobile & Desktop) */}
        <div className="max-w-4xl mx-auto mt-2.5 flex items-center bg-[#0e1117] p-1 rounded-xl border border-slate-800/90">
          <button
            onClick={() => setActiveTab('prospeccao')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'prospeccao'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Dia a Dia
          </button>
          <button
            onClick={() => setActiveTab('vendas')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'vendas'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Vendas ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('balanco')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'balanco'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Balanço
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 mt-4 space-y-4">
        {/* ========================================================================= */}
        {/* TAB 1: PROSPECÇÃO DE RUA (DIA A DIA EM FOCO - OTIMIZADO PARA CELULAR) */}
        {/* ========================================================================= */}
        {activeTab === 'prospeccao' && (
          <div className="space-y-4">
            {/* Seletor Horizontal de Dias da Semana (Grandes alvos de toque) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {weekDates.map((wd) => {
                const isSelected = wd.dateStr === selectedDate;
                const dayLog = dailyLogs[wd.dateStr];
                const hasSales = (dayLog?.accepted || 0) > 0 || (dayLog?.revenue || 0) > 0;

                return (
                  <button
                    key={wd.dateStr}
                    onClick={() => {
                      setSelectedDate(wd.dateStr);
                      setQuickDate(wd.dateStr);
                    }}
                    className={`flex-1 min-w-[48px] py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center border transition relative ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950'
                        : 'bg-[#151922] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {wd.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-wider">{wd.dayShort}</span>
                    <span className="text-xs font-mono font-bold mt-0.5">{wd.formatted.split('/')[0]}</span>
                    {hasSales && (
                      <span className="text-[9px] text-emerald-400 font-bold mt-0.5">•</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* CARD DO DIA SELECIONADO (ESTILO NOTION REFINADO) */}
            <div className="bg-[#151922] border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-5">
              {/* Cabeçalho do Dia (Pill verde) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-[#193825] text-emerald-300 font-bold px-3.5 py-1 rounded-full text-xs sm:text-sm tracking-wide border border-emerald-500/20">
                    {activeDayInfo?.dayFull}
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-medium">
                    {formatFullDisplayDate(selectedDate)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                    Faturamento do Dia
                  </span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {formatCurrency(activeDayLog.revenue)}
                  </span>
                </div>
              </div>

              {/* CONTADORES RÁPIDOS DE TOQUE (+ / -) PARA A RUA */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Comércios Visitados */}
                <div className="bg-[#0e1117] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-blue-400" /> Total Comércios
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => handleStepMetric('totalBusinesses', -1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center font-bold text-lg transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-black text-white font-mono">
                      {activeDayLog.totalBusinesses}
                    </span>
                    <button
                      onClick={() => handleStepMetric('totalBusinesses', 1)}
                      className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center font-bold text-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Dono Não Estava */}
                <div className="bg-[#0e1117] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <UserX className="w-3.5 h-3.5 text-amber-400" /> Dono Ausente
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => handleStepMetric('ownerAbsent', -1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center font-bold text-lg transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {activeDayLog.ownerAbsent}
                    </span>
                    <button
                      onClick={() => handleStepMetric('ownerAbsent', 1)}
                      className="w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white flex items-center justify-center font-bold text-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Não (Recusas) */}
                <div className="bg-[#0e1117] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-red-400" /> Recusas (Não)
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => handleStepMetric('declined', -1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center font-bold text-lg transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-black text-red-400 font-mono">
                      {activeDayLog.declined}
                    </span>
                    <button
                      onClick={() => handleStepMetric('declined', 1)}
                      className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center font-bold text-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4. Sim (Vendas Fechadas!) */}
                <div className="bg-[#0e1117] border border-emerald-500/30 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fechou (Sim)
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => handleStepMetric('accepted', -1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center font-bold text-lg transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {activeDayLog.accepted}
                    </span>
                    <button
                      onClick={() => handleStepMetric('accepted', 1)}
                      className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tempo de Rua e Faturamento Manual se precisar */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Tempo de Prospecção (Horas):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={activeDayLog.prospectingHours === 0 ? '' : activeDayLog.prospectingHours}
                      placeholder="ex: 3"
                      onChange={(e) =>
                        setDailyLogs((prev) => ({
                          ...prev,
                          [selectedDate]: {
                            ...activeDayLog,
                            prospectingHours: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">h</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Ajuste Faturamento (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={activeDayLog.revenue === 0 ? '' : activeDayLog.revenue}
                    placeholder="0,00"
                    onChange={(e) =>
                      setDailyLogs((prev) => ({
                        ...prev,
                        [selectedDate]: {
                          ...activeDayLog,
                          revenue: Number(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Observação rápida do dia */}
              <div>
                <input
                  type="text"
                  value={activeDayLog.notes || ''}
                  placeholder="Anotações do dia (rua, bairro, retornos)..."
                  onChange={(e) =>
                    setDailyLogs((prev) => ({
                      ...prev,
                      [selectedDate]: { ...activeDayLog, notes: e.target.value },
                    }))
                  }
                  className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
                />
              </div>

              {/* Botão Salvar Dia */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {activeDaySales.length} {activeDaySales.length === 1 ? 'venda registrada hoje' : 'vendas registradas hoje'}
                </span>

                <button
                  onClick={handleSaveActiveDay}
                  disabled={savingDay}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                    savedSuccessDay
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {savingDay ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : savedSuccessDay ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {savedSuccessDay ? 'Salvo!' : savingDay ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>

            {/* MINI LISTA DE VENDAS DO DIA SELECIONADO */}
            {activeDaySales.length > 0 && (
              <div className="bg-[#151922] border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Clientes Fechados neste Dia:</span>
                  <span className="text-emerald-400 font-mono">
                    {formatCurrency(activeDaySales.reduce((acc, s) => acc + s.amount, 0))}
                  </span>
                </div>
                <div className="divide-y divide-slate-800/80">
                  {activeDaySales.map((sale) => (
                    <div key={sale.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{sale.clientName}</span>
                        <span className="text-[10px] text-slate-400">{sale.itemSold}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatCurrency(sale.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VENDAS (LISTA LIMPA / MOBILE E TABELA NO DESKTOP) */}
        {/* ========================================================================= */}
        {activeTab === 'vendas' && (
          <div className="space-y-4">
            {/* Header Vendas com Barra de Busca */}
            <div className="bg-[#151922] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchSale}
                  onChange={(e) => setSearchSale(e.target.value)}
                  placeholder="Buscar por cliente ou serviço..."
                  className="w-full bg-[#0e1117] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-xs text-slate-400">
                  Total:{' '}
                  <strong className="text-emerald-400 font-mono text-sm">
                    {formatCurrency(totalFilteredSalesAmount)}
                  </strong>
                </div>
                <button
                  onClick={() => {
                    setQuickDate(selectedDate);
                    setIsQuickSaleOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Nova Venda
                </button>
              </div>
            </div>

            {/* Lista de Vendas (Cartões compactos e limpos) */}
            <div className="space-y-2">
              {filteredSales.length === 0 ? (
                <div className="bg-[#151922] border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  Nenhuma venda cadastrada para esta semana.
                  <div className="mt-2">
                    <button
                      onClick={() => setIsQuickSaleOpen(true)}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      + Cadastrar Venda Agora
                    </button>
                  </div>
                </div>
              ) : (
                filteredSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-[#151922] border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{sale.clientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono bg-[#0e1117] px-2 py-0.5 rounded-md border border-slate-800">
                          {formatDisplayDate(sale.saleDate)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-1 truncate">
                        <span className="text-slate-300">{sale.itemSold}</span>
                        {sale.notes && <span className="text-slate-500 italic truncate">• {sale.notes}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                        {formatCurrency(sale.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSaleModal(sale)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SOMA NOTION STYLE */}
            {filteredSales.length > 0 && (
              <div className="bg-[#151922] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  SOMA SEMANAL
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatCurrency(totalFilteredSalesAmount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BALANÇO DA SEMANA */}
        {/* ========================================================================= */}
        {activeTab === 'balanco' && (
          <div className="space-y-4">
            {/* Banner Principal */}
            <div className="bg-gradient-to-br from-[#161d2b] to-[#121620] border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    Fechamento
                  </span>
                  <h2 className="text-lg font-black text-white mt-1">Balanço Semanal</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    {formatFullDisplayDate(weekStartStr)} a {formatFullDisplayDate(weekEndStr)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Faturado</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {formatCurrency(totals.totalRevenue)}
                  </span>
                </div>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                <div className="bg-[#0e1117] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Comércios</span>
                  <span className="text-lg font-bold text-white font-mono mt-0.5 block">{totals.totalBusinesses}</span>
                  <span className="text-[10px] text-slate-500">{totals.totalOwnerAbsent} donos ausentes</span>
                </div>

                <div className="bg-[#0e1117] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Fechamentos (Sim)</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{totals.totalAccepted}</span>
                  <span className="text-[10px] text-slate-500">{totals.totalDeclined} recusas</span>
                </div>

                <div className="bg-[#0e1117] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Taxa Conversão</span>
                  <span className="text-lg font-bold text-amber-300 font-mono mt-0.5 block">{totals.conversionRate}%</span>
                  <span className="text-[10px] text-slate-500">Sim / (Sim + Não)</span>
                </div>

                <div className="bg-[#0e1117] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Horas em Campo</span>
                  <span className="text-lg font-bold text-purple-400 font-mono mt-0.5 block">{totals.totalProspectingHours}h</span>
                  <span className="text-[10px] text-slate-500">Tempo dedicado</span>
                </div>

                <div className="bg-[#0e1117] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Rendimento/Hora</span>
                  <span className="text-lg font-bold text-cyan-400 font-mono mt-0.5 block">{formatCurrency(totals.revenuePerHour)}</span>
                  <span className="text-[10px] text-slate-500">R$ por hora</span>
                </div>

                <div className="bg-[#0e1117] p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Ticket Médio</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{formatCurrency(totals.averageTicket)}</span>
                  <span className="text-[10px] text-slate-500">Por venda</span>
                </div>
              </div>

              {/* Tabela Resumo dos Dias */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block mb-2">Desempenho por Dia:</span>
                {weekDates.map((wd) => {
                  const log = dailyLogs[wd.dateStr];
                  return (
                    <div
                      key={wd.dateStr}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#0e1117] border border-slate-800/60"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{wd.dayFull.split('-')[0]}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({wd.formatted})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{log?.accepted || 0} sim</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatCurrency(log?.revenue || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botão para gerenciar serviços */}
            <div className="text-center pt-2">
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="text-xs font-semibold text-slate-400 hover:text-white underline inline-flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Configurar Serviços & Preços Sugeridos
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTÃO FLUTUANTE (FAB) PARA INSERÇÃO RÁPIDA DE VENDA EM SEGUNDOS NA RUA */}
      {/* ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            setQuickDate(selectedDate);
            setIsQuickSaleOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-950 hover:scale-105 active:scale-95 transition"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>+ Venda Rápida</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL / BOTTOM SHEET: VENDA RÁPIDA (CADASTRO EM 5 SEGUNDOS) */}
      {/* ========================================================================= */}
      {isQuickSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151922] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cadastrar Venda Rápida</h3>
                  <p className="text-[11px] text-slate-400">Atualiza o dia selecionado na hora</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickSaleOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickSaleSubmit} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome do Cliente / Comércio *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Pastelaria do Zé, Salão Belas..."
                  value={quickClient}
                  onChange={(e) => setQuickClient(e.target.value)}
                  className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Data da Venda
                  </label>
                  <input
                    type="date"
                    required
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="50,00"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  O Que Foi Vendido
                </label>
                <select
                  value={quickItem}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuickItem(val);
                    const matched = services.find((s) => s.name === val);
                    if (matched && matched.defaultPrice > 0) {
                      setQuickAmount(String(matched.defaultPrice));
                    }
                  }}
                  className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.defaultPrice > 0 ? `(${formatCurrency(s.defaultPrice)})` : ''}
                    </option>
                  ))}
                  <option value="Plaquinha NFC/QR Google">Plaquinha NFC/QR Google</option>
                  <option value="Outro Serviço">Outro Serviço</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingQuickSale}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  {isSavingQuickSale ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Confirmar e Salvar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EDITAR VENDA DETALHADA */}
      {/* ========================================================================= */}
      {isEditSaleModalOpen && editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151922] border border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                Editar Venda
              </h3>
              <button
                onClick={() => setIsEditSaleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditSale} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={saleFormData.clientName}
                  onChange={(e) => setSaleFormData({ ...saleFormData, clientName: e.target.value })}
                  className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={saleFormData.saleDate}
                    onChange={(e) => setSaleFormData({ ...saleFormData, saleDate: e.target.value })}
                    className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={saleFormData.amount}
                    onChange={(e) => setSaleFormData({ ...saleFormData, amount: e.target.value })}
                    className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Item Vendido</label>
                <input
                  type="text"
                  required
                  value={saleFormData.itemSold}
                  onChange={(e) => setSaleFormData({ ...saleFormData, itemSold: e.target.value })}
                  className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Observações</label>
                <input
                  type="text"
                  value={saleFormData.notes}
                  onChange={(e) => setSaleFormData({ ...saleFormData, notes: e.target.value })}
                  className="w-full bg-[#0e1117] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditSaleModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: CATÁLOGO DE SERVIÇOS */}
      {/* ========================================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151922] border border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Catálogo de Serviços
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Novo Serviço */}
            <form onSubmit={handleAddService} className="mt-3 space-y-2 bg-[#0e1117] p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 block">Adicionar Serviço:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nome do serviço"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="flex-1 bg-[#151922] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="R$"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="w-20 bg-[#151922] border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-emerald-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
                >
                  +
                </button>
              </div>
            </form>

            {/* Lista Existente */}
            <div className="mt-3 space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e1117] border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-200 font-medium">{svc.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">
                      {svc.defaultPrice > 0 ? formatCurrency(svc.defaultPrice) : 'Sob Consulta'}
                    </span>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
