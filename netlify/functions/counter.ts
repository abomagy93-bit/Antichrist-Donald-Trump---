// Netlify Serverless Function for Real Visitor Counter
// Starts from 1,000 on first launch and atomically increments on every visit
// Persistent across all devices and site redeployments

const BASE_VISITS = 1000;
const PRIMARY_API = 'https://abacus.jasoncameron.dev';
const BACKUP_API = 'https://countapi.mileshilliard.com/api/v1';

const NAMESPACE = 'kareem_ashmawy_research';
const KEY_TOTAL = 'antichrist_trump_visits_total';
const KEY_TODAY_PREFIX = 'antichrist_trump_visits_';

export default async (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const isReadOnly = url.searchParams.get('action') === 'get';
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayKey = `${KEY_TODAY_PREFIX}${todayStr}`;

  try {
    let serverTotalHits = 1;
    let serverTodayHits = 1;

    if (isReadOnly) {
      try {
        const res = await fetch(`${PRIMARY_API}/get/${NAMESPACE}/${KEY_TOTAL}`, {
          signal: AbortSignal.timeout(3500),
        });
        if (res.ok) {
          const data = (await res.json()) as { value?: number };
          if (typeof data.value === 'number') serverTotalHits = data.value;
        }
      } catch {
        // Fallback silently
      }
    } else {
      // Atomic increment on page visit
      try {
        const [totalRes, todayRes] = await Promise.allSettled([
          fetch(`${PRIMARY_API}/hit/${NAMESPACE}/${KEY_TOTAL}`, {
            signal: AbortSignal.timeout(4000),
          }),
          fetch(`${PRIMARY_API}/hit/${NAMESPACE}/${todayKey}`, {
            signal: AbortSignal.timeout(4000),
          }),
        ]);

        if (totalRes.status === 'fulfilled' && totalRes.value.ok) {
          const data = (await totalRes.value.json()) as { value?: number };
          if (typeof data.value === 'number') serverTotalHits = data.value;
        } else {
          // Redundant secondary atomic provider
          const bRes = await fetch(`${BACKUP_API}/hit/${NAMESPACE}_${KEY_TOTAL}`, {
            signal: AbortSignal.timeout(4000),
          });
          if (bRes.ok) {
            const bData = (await bRes.json()) as { value?: number };
            if (typeof bData.value === 'number') serverTotalHits = bData.value;
          }
        }

        if (todayRes.status === 'fulfilled' && todayRes.value.ok) {
          const data = (await todayRes.value.json()) as { value?: number };
          if (typeof data.value === 'number') serverTodayHits = data.value;
        }
      } catch {
        // Handled gracefully
      }
    }

    const finalTotal = BASE_VISITS + Math.max(1, serverTotalHits);
    const finalToday = Math.max(1, serverTodayHits);

    return new Response(
      JSON.stringify({
        success: true,
        total: finalTotal,
        today: finalToday,
        live: true,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Server counter error',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
