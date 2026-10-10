'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Zap, Layers, BarChart3, HelpCircle, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin/gestao', label: '📊 Gestão Solus', icon: BarChart3, highlight: true },
    { href: '/admin', label: 'Plaquinhas & QR', icon: QrCode },
    { href: '/admin/quick-register', label: '⚡ Cadastro em 5s', icon: Zap },
    { href: '/admin/batch-generate', label: 'Lotes & Impressão', icon: Layers },
    { href: '/admin/nfc-guide', label: 'Gravar NFC', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                Solus <span className="text-blue-400">Plaquinhas NFC</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
                QR Code Dinâmico Google Reviews
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : link.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={link.highlight && !isActive ? 'font-semibold' : ''}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
