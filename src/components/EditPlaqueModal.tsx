'use client';

import { useState } from 'react';
import { Plaque } from '@/lib/db';
import QRCodeDisplay from './QRCodeDisplay';
import { X, Save, Trash2, ExternalLink, Check, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { cleanGoogleReviewUrl } from '@/lib/utils';

interface EditPlaqueModalProps {
  plaque: Plaque | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditPlaqueModal({
  plaque,
  isOpen,
  onClose,
  onUpdated,
}: EditPlaqueModalProps) {
  if (!isOpen || !plaque) return null;

  const [title, setTitle] = useState(plaque.title || '');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(plaque.googleReviewUrl || '');
  const [placeName, setPlaceName] = useState(plaque.placeName || '');
  const [clientPhone, setClientPhone] = useState(plaque.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(plaque.clientEmail || '');
  const [notes, setNotes] = useState(plaque.notes || '');
  const [status, setStatus] = useState<string>(plaque.status);
  const [feedbackGate, setFeedbackGate] = useState<boolean>(plaque.feedbackGate);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/plaques/${plaque.code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          googleReviewUrl: googleReviewUrl ? cleanGoogleReviewUrl(googleReviewUrl) : null,
          placeName,
          clientPhone,
          clientEmail,
          notes,
          status,
          feedbackGate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        onUpdated();
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a plaquinha ${plaque.code}?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/plaques/${plaque.code}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">
              Gerenciar Plaquinha <span className="text-blue-400 font-mono">#{plaque.code}</span>
            </span>
            <span
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : status === 'PAUSED'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {status === 'ACTIVE' ? 'Ativa' : status === 'PAUSED' ? 'Pausada' : 'Virgem'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Lado Esquerdo: QR Code e Gravação NFC */}
          <div className="md:col-span-5 flex flex-col items-center justify-start bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
            <QRCodeDisplay code={plaque.code} title={title} size={180} />

            <div className="mt-6 w-full pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Total de Leituras:</span>
                <span className="font-semibold text-white">{plaque.totalScans} scans</span>
              </div>
              <div className="flex justify-between">
                <span>Última Leitura:</span>
                <span className="font-medium text-slate-300">
                  {plaque.lastScannedAt ? new Date(plaque.lastScannedAt).toLocaleDateString('pt-BR') : 'Nunca'}
                </span>
              </div>
              {plaque.batchTag && (
                <div className="flex justify-between">
                  <span>Lote de Origem:</span>
                  <span className="font-mono text-slate-300">{plaque.batchTag}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lado Direito: Formulário de Edição */}
          <form onSubmit={handleSave} className="md:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nome da Empresa / Cliente *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Pizzaria Bella Italia"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Link de Avaliação do Google *
                </label>
                {googleReviewUrl && (
                  <a
                    href={googleReviewUrl.startsWith('http') ? googleReviewUrl : `https://${googleReviewUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    Testar Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                required
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/.../review ou link do Google Meu Negócio"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Categoria / Subtítulo
                </label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="Ex: Restaurante"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Status da Plaquinha
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ACTIVE">Ativa (Redirecionando)</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="VIRGIN">Virgem (Sem vínculo)</option>
                </select>
              </div>
            </div>

            {/* Toggle Filtro Inteligente de Satisfação */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-3">
              <input
                type="checkbox"
                id="feedbackGateEdit"
                checked={feedbackGate}
                onChange={(e) => setFeedbackGate(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
              />
              <label htmlFor="feedbackGateEdit" className="text-xs cursor-pointer select-none">
                <span className="font-semibold text-slate-200 block mb-0.5">
                  Filtro Inteligente de Satisfação (5 Estrelas)
                </span>
                <span className="text-slate-400 block leading-tight">
                  Se ativado, clientes que avaliam com 4-5 estrelas vão para o Google. Avaliações de 1-3 estrelas abrem formulário privado interno.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  WhatsApp do Cliente
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  E-mail do Cliente
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Anotações Internas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais sobre o cliente..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Salvo com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
