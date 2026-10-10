'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, RefreshCw } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode: Html5Qrcode | null = null;
    setIsStarting(true);
    setError(null);

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Sucesso na leitura
            let code = decodedText.trim();
            // Se for uma URL /r/CODIGO, extrai apenas o código
            if (code.includes('/r/')) {
              const parts = code.split('/r/');
              if (parts[1]) {
                code = parts[1].split('?')[0].split('/')[0];
              }
            }

            if (scannerRef.current) {
              scannerRef.current.stop().catch(() => {});
            }

            onScanSuccess(code.toUpperCase());
            onClose();
          },
          () => {
            // Frame sem QR code (esperado enquanto procura)
          }
        );
        setIsStarting(false);
      } catch (err: any) {
        console.error('Camera error:', err);
        setError('Não foi possível acessar a câmera. Verifique se concedeu permissão.');
        setIsStarting(false);
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Camera className="w-5 h-5 text-blue-400" />
            <span>Escanear QR Code da Plaquinha</span>
          </div>
          <button
            onClick={() => {
              if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {});
              }
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[300px] bg-black rounded-2xl overflow-hidden border-2 border-blue-500/50 flex items-center justify-center shadow-inner">
            <div id="qr-reader" className="w-full h-full" />
            {isStarting && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 text-slate-300">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                <span className="text-xs">Iniciando câmera...</span>
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-4 text-center">
              Aponte a câmera para o QR Code da plaquinha física para preencher o código instantaneamente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
