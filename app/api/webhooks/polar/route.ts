import { NextResponse } from 'next/server';
import { grantEmailAccess } from '@/lib/kvAccess';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    console.log('Polar webhook received:', payload);

    // Verify this is a checkout.created or order.created event
    const eventType = payload.type || payload.event;
    
    if (eventType === 'checkout.created' || eventType === 'order.created') {
      // Extract customer email from the payload
      const customerEmail = payload.data?.customer_email || 
                           payload.data?.customer?.email ||
                           payload.customer_email ||
                           payload.email;

      if (customerEmail) {
        console.log('Granting access to email:', customerEmail);
        
        // Grant access in Redis
        await grantEmailAccess(customerEmail);
        
        console.log('Access granted successfully to:', customerEmail);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Access granted',
          email: customerEmail 
        });
      } else {
        console.error('No customer email found in webhook payload:', payload);
        return NextResponse.json(
          { error: 'No customer email in webhook' },
          { status: 400 }
        );
      }
    }

    // For other event types, just acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received' 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
