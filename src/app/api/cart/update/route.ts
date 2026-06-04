import { NextRequest, NextResponse } from 'next/server';
import { updateCartItemMutation } from '@/lib/graphql';

export async function POST(request: NextRequest) {
  try {
    const { key, quantity } = await request.json();
    const session = request.headers.get('x-woo-session');
    if (!session) return NextResponse.json({ error: 'No session' }, { status: 400 });

    const { data, sessionToken } = await updateCartItemMutation(key, quantity, session);
    return NextResponse.json({
      cart: data.updateItemQuantities.cart,
      sessionToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update cart';
    console.error('Update cart error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
