import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, routines = {} } = body || {};

    // Build printable HTML
    const DAYS: string[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const LABELS: Record<string,string> = { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom' };

    const content = DAYS.map(d => {
      const day = plan?.[d] || { routines: [], note: '' };
      const items = (day?.routines || []).map((id: string) => {
        const r = routines[id];
        const exercises = (r?.exercises || []).map((ex: any) => {
          const sets = Array.isArray(ex.sets) ? ex.sets.length : 0;
          const repsList = Array.isArray(ex.sets) ? ex.sets.map((s: any) => s.reps).join(' · ') : '';
          const rest = ex.restBetweenSets ?? r?.restBetweenSets ?? '';
          return `
            <div style="margin-left:10px;margin-bottom:6px;font-size:12px">
              <div style="font-weight:600">${ex.name}</div>
              <div style="color:#475569;font-size:11px">Series: ${sets} · Reps: ${repsList}${rest ? ` · Descanso: ${rest}s` : ''}</div>
            </div>`;
        }).join('');
        return `
          <div style="padding:10px;border-radius:6px;border:1px solid #e6e6e6;background:#fff;margin-bottom:8px;box-shadow:0 1px 0 rgba(16,24,40,0.02)">
            <div style="font-weight:700;color:#0f172a;margin-bottom:6px">${(r && r.name) || id} <span style="font-weight:400;color:#666">— ${(r && r.exercises && r.exercises.length) || 0} ejercicios</span></div>
            ${exercises}
          </div>`;
      }).join('');
      return `
        <article style="flex:1 1 45%; box-sizing:border-box; padding:12px; page-break-inside:avoid;">
          <h3 style="margin:0 0 8px 0;font-size:14px;color:#0f172a">${LABELS[d]}</h3>
          <div style="font-size:12px;color:#475569;margin-bottom:8px">Nota: ${day?.note || ''}</div>
          <div>${items || '<div style="color:#9ca3af;font-size:12px">(sin rutinas)</div>'}</div>
        </article>`;
    }).join('\n');

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Plan semanal</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>
      body{font-family:Inter,system-ui,Arial,Helvetica,sans-serif;margin:0;padding:60px 28px 80px;color:#0f172a;background:#f8fafc}
      h1{font-size:20px;margin:0 0 12px 0}
      main{display:flex;flex-wrap:wrap;gap:12px}
      article{background:transparent}
      .header{position:fixed;left:0;right:0;top:0;height:56px;background:linear-gradient(90deg,#ffffff00,#ffffff00);display:flex;align-items:center;justify-content:space-between;padding:12px 28px;border-bottom:1px solid #eee}
      .footer{position:fixed;left:0;right:0;bottom:0;height:56px;display:flex;align-items:center;justify-content:space-between;padding:8px 28px;border-top:1px solid #eee;font-size:12px;color:#6b7280}
      @media print{body{background:#fff} .header, .footer{position:fixed}}
    </style></head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:10px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#000000"/><path d="M7 12h10M7 16h10M7 8h10" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><strong>Gym Tracker</strong></div><div>${new Date().toLocaleString()}</div></div>
      <main>${content}</main>
      <div class="footer"><div>Gym Tracker</div><div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div></div>
    </body></html>`;

    // Launch puppeteer and render PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await browser.close();

    // Convert Node Buffer (Uint8Array) to ArrayBuffer for Response body to satisfy TypeScript
    // Ensure we produce a real ArrayBuffer (copy data to avoid SharedArrayBuffer issues)
    let u8: Uint8Array;
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(pdf)) {
      u8 = new Uint8Array(Buffer.from(pdf));
    } else if (pdf instanceof Uint8Array) {
      u8 = pdf;
    } else {
      u8 = new Uint8Array(Buffer.from(pdf as any));
    }

    // Copy into a fresh ArrayBuffer to guarantee it's a plain ArrayBuffer
    const copied = new Uint8Array(u8.length);
    copied.set(u8);
    const pdfArrayBuffer = copied.buffer;

    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="weekly-plan-${new Date().toISOString().slice(0,10)}.pdf"`
      }
    });
  } catch (e) {
    console.error('weekly-export error', e);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
