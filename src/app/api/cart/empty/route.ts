import { NextRequest, NextResponse } from 'next/server';
import { emptyCartMutation } from '@/lib/graphql';

export async function POST(request: NextRequest) {
  try {
    const session = request.headers.get('x-woo-session');
    if (!session) return NextResponse.json({ error: 'No session' }, { status: 400 });

    const { data, sessionToken } = await emptyCartMutation(session);
    return NextResponse.json({
      cart: data.emptyCart.cart,
      sessionToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to empty cart';
    console.error('Empty cart error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
