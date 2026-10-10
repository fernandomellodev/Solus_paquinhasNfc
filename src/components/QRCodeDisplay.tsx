'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, Nfc, ExternalLink } from 'lucide-react';
import { formatPlaqueUrl } from '@/lib/utils';

interface QRCodeDisplayProps {
  code: string;
  title?: string | null;
  size?: number;
  showActions?: boolean;
}

export default function QRCodeDisplay({
  code,
  title,
  size = 200,
  showActions = true,
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const url = formatPlaqueUrl(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR-${code.toUpperCase()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleDownloadPNG = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1000, 1000);
      ctx.drawImage(img, 50, 50, 900, 900);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-${code.toUpperCase()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center justify-center relative group"
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
            x: undefined,
            y: undefined,
            height: Math.floor(size * 0.22),
            width: Math.floor(size * 0.22),
            excavate: true,
          }}
        />
        <span className="text-[11px] font-mono font-bold text-slate-800 mt-1 uppercase tracking-wider">
          {code}
        </span>
      </div>

      {showActions && (
        <div className="w-full mt-4 space-y-2">
          {/* Link da Tag NFC */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
            <Nfc className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-mono text-slate-300 truncate flex-1">{url}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1"
              title="Copiar URL para gravação NFC"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`/r/${code}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              title="Testar Redirecionamento"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Botões de Download */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadPNG}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Baixar PNG</span>
            </button>
            <button
              onClick={handleDownloadSVG}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Baixar SVG</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
