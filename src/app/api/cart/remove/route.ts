import { NextRequest, NextResponse } from 'next/server';
import { removeCartItemMutation } from '@/lib/graphql';

export async function POST(request: NextRequest) {
  try {
    const { keys } = await request.json();
    const session = request.headers.get('x-woo-session');
    if (!session) return NextResponse.json({ error: 'No session' }, { status: 400 });

    const { data, sessionToken } = await removeCartItemMutation(keys, session);
    return NextResponse.json({
      cart: data.removeItemsFromCart.cart,
      sessionToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove item';
    console.error('Remove cart error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
