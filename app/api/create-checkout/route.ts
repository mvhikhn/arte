import { NextResponse } from 'next/server';
import { Polar } from '@polar-sh/sdk';

export async function POST(request: Request) {
  try {
    // Get Polar access token from environment
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Polar access token not configured' },
        { status: 500 }
      );
    }

    // Get product ID from environment
    const productId = process.env.POLAR_PRODUCT_ID;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Polar product ID not configured' },
        { status: 500 }
      );
    }

    // Initialize Polar SDK
    const polar = new Polar({
      accessToken: accessToken,
    });

    // Create checkout session with embed mode
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: process.env.POLAR_SUCCESS_URL || 'http://localhost:3000?payment=success',
      embedOrigin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    });

    console.log('Polar checkout created:', checkout.id);

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error',  details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
