import { Suspense } from 'react';
import QuickRegisterClient from './QuickRegisterClient';

export default function QuickRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
          Carregando cadastro rápido...
        </div>
      }
    >
      <QuickRegisterClient />
    </Suspense>
  );
}
