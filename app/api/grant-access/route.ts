import { NextResponse } from 'next/server';
import { grantEmailAccess } from '@/lib/kvAccess';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Grant access in KV store
    await grantEmailAccess(email);

    return NextResponse.json({
      success: true,
      message: 'Access granted successfully',
    });
  } catch (error) {
    console.error('Error granting access:', error);
    return NextResponse.json(
      { error: 'Failed to grant access' },
      { status: 500 }
    );
  }
}
