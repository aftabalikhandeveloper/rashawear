import { NextRequest, NextResponse } from 'next/server';
import { addToCartMutation } from '@/lib/graphql';

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity, variationId } = await request.json();
    const session = request.headers.get('x-woo-session');

    const { data, sessionToken } = await addToCartMutation(
      productId,
      quantity || 1,
      session,
      variationId
    );

    return NextResponse.json({
      cart: data.addToCart.cart,
      sessionToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add to cart';
    console.error('Add to cart error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
