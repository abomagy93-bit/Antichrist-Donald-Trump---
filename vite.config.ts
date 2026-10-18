import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function devCounterPlugin() {
  return {
    name: 'dev-counter-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/counter')) {
          const BASE_VISITS = 1000;
          const NAMESPACE = 'kareem_ashmawy_research';
          const KEY_TOTAL = 'antichrist_trump_visits_total';
          const todayStr = new Date().toISOString().slice(0, 10);
          const KEY_TODAY = `antichrist_trump_visits_${todayStr}`;
          const isGet = req.url.includes('action=get');

          try {
            let serverTotal = 1;
            let serverToday = 1;
            const op = isGet ? 'get' : 'hit';

            const [r1, r2] = await Promise.allSettled([
              fetch(`https://abacus.jasoncameron.dev/${op}/${NAMESPACE}/${KEY_TOTAL}`, {
                signal: AbortSignal.timeout(4000),
              }),
              fetch(`https://abacus.jasoncameron.dev/${op}/${NAMESPACE}/${KEY_TODAY}`, {
                signal: AbortSignal.timeout(4000),
              }),
            ]);

            if (r1.status === 'fulfilled' && r1.value.ok) {
              const d1: any = await r1.value.json();
              if (typeof d1.value === 'number') serverTotal = d1.value;
            }
            if (r2.status === 'fulfilled' && r2.value.ok) {
              const d2: any = await r2.value.json();
              if (typeof d2.value === 'number') serverToday = d2.value;
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(
              JSON.stringify({
                success: true,
                total: BASE_VISITS + Math.max(1, serverTotal),
                today: Math.max(1, serverToday),
                live: true,
              })
            );
            return;
          } catch (e: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: e?.message }));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), devCounterPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
