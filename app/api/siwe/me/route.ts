import { NextRequest, NextResponse } from 'next/server';
import { getSiweSession, requireSiweSecret } from '@/lib/siwe';

export async function GET(request: NextRequest) {
  try {
    requireSiweSecret();
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const session = getSiweSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  return NextResponse.json(session);
}
