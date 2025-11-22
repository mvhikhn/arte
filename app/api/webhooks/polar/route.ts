import { NextResponse } from 'next/server';
import { grantEmailAccess } from '@/lib/kvAccess';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    console.log('Polar webhook received:', JSON.stringify(payload, null, 2));

    const eventType = payload.type || payload.event;
    
    // Handle order.created (fires after successful payment)
    if (eventType === 'order.created') {
      const customerEmail = payload.data?.customer?.email || 
                           payload.data?.user?.email ||
                           payload.data?.customer_email ||
                           payload.customer_email;

      if (customerEmail) {
        console.log('Order created - Granting access to email:', customerEmail);
        
        await grantEmailAccess(customerEmail);
        
        console.log('Access granted successfully to:', customerEmail);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Access granted',
          email: customerEmail 
        });
      } else {
        console.error('No customer email in order.created event. Payload:', JSON.stringify(payload, null, 2));
        return NextResponse.json(
          { error: 'No customer email in order' },
          { status: 400 }
        );
      }
    }
    
    // Handle checkout.updated (fires when customer enters email)
    if (eventType === 'checkout.updated') {
      const customerEmail = payload.data?.customer_email;
      const status = payload.data?.status;
      
      // Only process if email is present and checkout is confirmed/succeeded
      // Free products use "succeeded", paid products may use "confirmed"
      if (customerEmail && (status === 'confirmed' || status === 'succeeded')) {
        console.log('Checkout completed - Granting access to email:', customerEmail);
        
        await grantEmailAccess(customerEmail);
        
        console.log('Access granted successfully to:', customerEmail);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Access granted',
          email: customerEmail 
        });
      } else {
        console.log('Checkout updated but not completed. Status:', status, 'Email:', customerEmail);
      }
    }

    // For other event types, just acknowledge receipt
    console.log('Webhook received but not processed:', eventType);
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received',
      eventType 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', message: String(error) },
      { status: 500 }
    );
  }
}
