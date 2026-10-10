import { Nfc, Smartphone, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NfcGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
          <Nfc className="w-3.5 h-3.5" />
          Manual de Gravação NFC
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Como Gravar as Plaquinhas NFC
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Grave o link dinâmico nas tags NFC (NTAG213 / NTAG215 / NTAG216) em menos de 3 segundos por plaquinha.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dica de Ouro */}
        <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">A Regra de Ouro do NFC Dinâmico</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Você só precisa gravar o NFC <b>uma única vez na vida da plaquinha</b>! Como o sistema usa URLs dinâmicas (ex: <code className="text-amber-300 font-mono">seusite.com/r/PLQ-1234</code>), mesmo que o cliente mude de endereço ou de link no Google, o chip físico continua funcionando porque o destino é alterado no seu painel.
              </p>
            </div>
          </div>
        </div>

        {/* Passo a Passo com Celular */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-blue-400" />
            Passo a Passo: Gravando com o Celular (Android ou iPhone)
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </span>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Baixe o App &quot;NFC Tools&quot;</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Disponível gratuitamente na Google Play Store e Apple App Store. É o aplicativo padrão mais rápido e confiável do mercado.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </span>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Selecione &quot;Escrever&quot; → &quot;Adicionar um registro&quot;</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No menu do app, toque na opção <b>URL / URI</b>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </span>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Cole a URL Dinâmica da Plaquinha</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cole o link gerado pelo painel (ex: <code className="text-blue-400 font-mono">https://seusite.com/r/PLQ-8932</code>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-8 h-8 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                4
              </span>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Aproxime o celular da Tag NFC</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toque em <b>Escrever</b> e encoste o topo do celular na plaquinha. Em menos de 1 segundo aparecerá a mensagem &quot;Escrita concluída com sucesso!&quot;.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tipos de Tags Recomendadas */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Qual chip NFC comprar para as plaquinhas?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Recomendamos adesivos ou moedas NFC com chips <b>NTAG213</b> ou <b>NTAG215</b> (frequência 13.56 MHz). Eles são 100% compatíveis com todos os modelos de iPhone e celulares Android modernos.
          </p>
          <div className="flex gap-4">
            <Link
              href="/admin/quick-register"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              <span>Ir para Cadastro Rápido</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
