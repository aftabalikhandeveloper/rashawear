import { NextRequest, NextResponse } from 'next/server';
import { getCartQuery } from '@/lib/graphql';

export async function GET(request: NextRequest) {
  const session = request.headers.get('x-woo-session');
  if (!session) return NextResponse.json({ cart: null });

  try {
    const { data, sessionToken } = await getCartQuery(session);
    return NextResponse.json({ cart: data.cart, sessionToken });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ cart: null, error: 'Failed to get cart' }, { status: 500 });
  }
}
