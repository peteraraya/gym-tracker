'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const FloatingCreateRoutine: React.FC = () => {
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <Link href="/routines?create=1" aria-label="Crear rutina" className="group">
        <div className="flex items-center gap-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transform transition">
          <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full">
            <Plus className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold">Crea tu primera rutina</div>
            <div className="text-xs opacity-90">Empieza a registrar tus entrenos</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCreateRoutine;
