"use client";
"use client";

import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export default function InfoTooltip({
  title,
  content,
}: {
  title?: string;
  content: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; placement: 'top' | 'bottom' } | null>(null);

  const updatePos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    // Preferir mostrar encima si hay espacio, si no abajo
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: 'top' | 'bottom' = spaceAbove > 120 || spaceAbove > spaceBelow ? 'top' : 'bottom';
    const top = placement === 'top' ? rect.top - 8 : rect.bottom + 8;
    setPos({ left, top, placement });
  };

  useLayoutEffect(() => {
    if (!show) return;
    updatePos();
    const onResize = () => updatePos();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [show]);

  const tooltip = (
    <div
      role="tooltip"
      className="z-50 max-w-[320px] bg-gray-900 dark:bg-gray-950 text-white p-3 rounded-lg text-xs shadow-lg"
      style={
        pos
          ? {
              position: 'fixed' as const,
              left: pos.left,
              top: pos.top,
              transform: pos.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            }
          : { display: 'none' }
      }
    >
      {title && <div className="font-semibold text-sm mb-1">{title}</div>}
      <div className="text-gray-200 text-xs">{content}</div>
      <div
        style={pos ? undefined : { display: 'none' }}
        className={`absolute ${pos?.placement === 'top' ? 'top-full' : 'bottom-full'} left-1/2 -translate-x-1/2 w-0 h-0`}
      >
        {pos?.placement === 'top' ? (
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #111827' }} />
        ) : (
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid #111827' }} />
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={title ?? 'Información'}
        className="ml-2 text-blue-400 hover:text-blue-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow(s => !s)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" className="text-blue-400" />
          <path d="M11.1 10.4h1.8v6.6h-1.8zM12 7.5a1.05 1.05 0 100 2.1 1.05 1.05 0 000-2.1z" fill="currentColor" />
        </svg>
      </button>
      {show && pos && typeof document !== 'undefined' ? createPortal(tooltip, document.body) : null}
    </>
  );
}
