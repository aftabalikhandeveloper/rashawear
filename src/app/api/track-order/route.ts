import { NextRequest, NextResponse } from 'next/server';

const WC_BASE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://dash.rashawear.com';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || '';

async function fetchWCOrder(orderId: string) {
  const url = `${WC_BASE_URL}/wp-json/wc/v3/orders/${orderId}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`WC API error: ${res.status}`);
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required.' },
        { status: 400 }
      );
    }

    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return NextResponse.json(
        { error: 'Order tracking is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Fetch order from WooCommerce REST API
    const wcOrder = await fetchWCOrder(orderNumber);

    if (!wcOrder) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number.' },
        { status: 404 }
      );
    }

    // Verify billing email for security
    if (wcOrder.billing?.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match the order. Please verify your billing email.' },
        { status: 403 }
      );
    }

    // Map WC REST API response to our order format
    const order = {
      id: String(wcOrder.id),
      databaseId: wcOrder.id,
      orderNumber: String(wcOrder.number || wcOrder.id),
      status: wcOrder.status || 'processing',
      total: `₨ ${wcOrder.total}`,
      subtotal: `₨ ${wcOrder.line_items?.reduce((sum: number, item: { subtotal: string }) => sum + parseFloat(item.subtotal || '0'), 0) || '0'}`,
      shippingTotal: `₨ ${wcOrder.shipping_total || '0'}`,
      totalTax: `₨ ${wcOrder.total_tax || '0'}`,
      paymentMethodTitle: wcOrder.payment_method_title || 'COD',
      date: wcOrder.date_created || '',
      billing: {
        firstName: wcOrder.billing?.first_name || '',
        lastName: wcOrder.billing?.last_name || '',
        email: wcOrder.billing?.email || '',
        phone: wcOrder.billing?.phone || '',
        address1: wcOrder.billing?.address_1 || '',
        city: wcOrder.billing?.city || '',
        state: wcOrder.billing?.state || '',
        postcode: wcOrder.billing?.postcode || '',
        country: wcOrder.billing?.country || '',
      },
      lineItems: {
        nodes: (wcOrder.line_items || []).map((item: {
          name: string;
          quantity: number;
          total: string;
          image?: { src: string };
          product_id: number;
        }) => ({
          quantity: item.quantity,
          total: `₨ ${item.total}`,
          product: {
            node: {
              name: item.name,
              slug: '',
              image: item.image?.src
                ? { sourceUrl: item.image.src }
                : { sourceUrl: '' },
            },
          },
        })),
      },
    };

    return NextResponse.json({ order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to track order';
    console.error('Track order error:', message);
    return NextResponse.json({ error: 'Unable to look up order. Please try again later.' }, { status: 500 });
  }
}
