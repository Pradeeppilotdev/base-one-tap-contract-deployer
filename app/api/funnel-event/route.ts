import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'wallet_connect_started',
  'wallet_connected',
  'example_prompt_selected',
  'ai_prompt_submitted',
  'ai_generated',
  'ai_generation_failed',
  'generated_code_used',
  'draft_saved',
  'draft_loaded',
  'pre_deploy_share_started',
  'pre_deploy_share_completed',
  'compile_started',
  'compile_succeeded',
  'compile_failed',
  'deploy_summary_opened',
  'deploy_confirmed',
  'deploy_tx_submitted',
  'deploy_succeeded',
  'deploy_failed',
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = typeof body.event === 'string' ? body.event : '';

    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    await addDoc(collection(db, 'funnelEvents'), {
      event,
      sessionId: String(body.sessionId || 'anonymous'),
      walletAddress: body.walletAddress ? String(body.walletAddress).toLowerCase() : null,
      fid: typeof body.fid === 'number' ? body.fid : null,
      walletHost: body.walletHost || null,
      network: body.network || null,
      selectedContract: body.selectedContract || null,
      metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
      userAgent: request.headers.get('user-agent') || '',
      createdAt: serverTimestamp(),
      createdAtMs: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to track funnel event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track event' },
      { status: 500 }
    );
  }
}
