import { NextResponse } from 'next/server';
import { grantEmailAccess } from '@/lib/kvAccess';

// Temporary test endpoint to manually grant access
// DELETE THIS AFTER TESTING!
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('TEST: Manually granting access to:', email);
    
    await grantEmailAccess(email);
    
    console.log('TEST: Access granted successfully to:', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Access granted',
      email 
    });
  } catch (error) {
    console.error('TEST: Error granting access:', error);
    return NextResponse.json(
      { error: 'Failed to grant access', message: String(error) },
      { status: 500 }
    );
  }
}
