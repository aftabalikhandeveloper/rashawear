import { NextRequest, NextResponse } from 'next/server';
import { checkoutMutation } from '@/lib/graphql';

export async function POST(request: NextRequest) {
  try {
    const { billing, shipping, paymentMethod, customerNote } = await request.json();
    const session = request.headers.get('x-woo-session');
    if (!session) return NextResponse.json({ error: 'No session. Please add items to cart first.' }, { status: 400 });

    const { data, sessionToken } = await checkoutMutation(
      session,
      billing,
      shipping,
      paymentMethod || 'cod',
      customerNote
    );

    return NextResponse.json({
      order: data.checkout.order,
      result: data.checkout.result,
      sessionToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    console.error('Checkout error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
