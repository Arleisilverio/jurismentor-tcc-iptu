import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------
// KEEP-ALIVE DO SUPABASE
// O plano gratuito do Supabase PAUSA o projeto após ~7 dias sem atividade.
// O Vercel Cron (ver vercel.json) chama esta rota 1x por dia, executando
// uma consulta leve no Postgres para manter o banco "acordado".
// Não lê nem altera nenhum dado do app.
// ---------------------------------------------------------------------
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Se CRON_SECRET estiver definido na Vercel, só o Cron oficial pode chamar.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'Supabase não configurado' }, { status: 500 });
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  try {
    // 1) Caminho principal: função public.keep_alive() (ver schema.sql)
    const rpc = await fetch(`${url}/rest/v1/rpc/keep_alive`, {
      method: 'POST',
      headers,
      body: '{}',
      cache: 'no-store',
    });

    if (rpc.ok) {
      return NextResponse.json({ ok: true, via: 'rpc', db_time: await rpc.json() });
    }

    // 2) Fallback: consulta leve numa tabela. Mesmo que o RLS negue acesso
    //    ao anon, a requisição chega ao Postgres e conta como atividade.
    const fallback = await fetch(`${url}/rest/v1/study_notes?select=id&limit=1`, {
      headers,
      cache: 'no-store',
    });

    return NextResponse.json({
      ok: true,
      via: 'fallback',
      rpc_status: rpc.status,
      fallback_status: fallback.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
