'use client';

import { useEffect, useState } from 'react';
import { Star, ExternalLink, MessageSquare, CheckCircle2, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RedirectClientProps {
  code: string;
  title: string;
  placeName?: string | null;
  destinationUrl: string;
  feedbackGate: boolean;
}

export default function RedirectClient({
  code,
  title,
  placeName,
  destinationUrl,
  feedbackGate,
}: RedirectClientProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Se o filtro de estrelas NÃO estiver ativado, redireciona imediatamente
    if (!feedbackGate) {
      const timer = setTimeout(() => {
        window.location.replace(destinationUrl);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [feedbackGate, destinationUrl]);

  const handleRatingSelect = (selectedStar: number) => {
    setRating(selectedStar);

    // Se a nota for 4 ou 5 estrelas -> Solta confetes e manda direto pro Google!
    if (selectedStar >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignora se não carregar
      }
      setTimeout(() => {
        window.location.replace(destinationUrl);
      }, 1200);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          rating,
          comment: feedbackComment,
          contactName: feedbackContact,
        }),
      });
      setSubmittedFeedback(true);
    } catch (err) {
      console.error(err);
      setSubmittedFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // CASO 1: Redirecionamento Direto (Modo Padrão)
  if (!feedbackGate) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Fundo com efeito glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />

          {/* Logo do Google & Ícone de Avaliação */}
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
          {placeName && <p className="text-xs text-slate-400 mb-6">{placeName}</p>}

          <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-800/80 rounded-2xl border border-slate-700/50 mb-6">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-200">Abrindo Google Avaliações...</span>
          </div>

          <a
            href={destinationUrl}
            className="text-xs text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
          >
            Clique aqui se a página não abrir automaticamente <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // CASO 2: Modo com Filtro de Estrelas Ativado
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {submittedFeedback ? (
          <div className="py-8">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Muito Obrigado!</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Sua opinião foi enviada diretamente para a gerência. Trabalhamos todos os dias para oferecer a melhor experiência possível.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              Equipe {title}
            </div>
          </div>
        ) : rating && rating >= 4 ? (
          <div className="py-8">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-8 h-8 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Que excelente! 🎉</h3>
            <p className="text-slate-300 text-sm mb-6">
              Ficamos muito felizes! Estamos abrindo sua avaliação no Google...
            </p>
            <div className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-800 rounded-2xl">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-amber-300">Direcionando para o Google...</span>
            </div>
          </div>
        ) : rating && rating <= 3 ? (
          <div>
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Como podemos melhorar?</h3>
            <p className="text-slate-400 text-xs mb-6">
              Sentimos muito por não termos superado suas expectativas. Deixe seu feedback diretamente para nossa gerência:
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  O que aconteceu ou o que podemos melhorar?
                </label>
                <textarea
                  required
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Conte-nos o que você achou..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Seu Nome ou WhatsApp (Opcional - para contato)
                </label>
                <input
                  type="text"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                  placeholder="Ex: João - (11) 99999-9999"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
            {placeName && <p className="text-xs text-slate-400 mb-4">{placeName}</p>}

            <h3 className="text-sm font-medium text-slate-300 mb-6">
              Como você avalia sua experiência hoje?
            </h3>

            {/* Estrelas Interativas */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => {
                const isHovered = hoverRating !== null && star <= hoverRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => handleRatingSelect(star)}
                    className="p-2 transition-transform hover:scale-125 focus:outline-none active:scale-95"
                    aria-label={`${star} estrelas`}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                        isHovered ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-amber-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-slate-500">
              Toque nas estrelas para avaliar instantaneamente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
