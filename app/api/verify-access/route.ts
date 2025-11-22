import { NextResponse } from 'next/server';
import { checkEmailAccess, getEmailAccessData } from '@/lib/kvAccess';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email has access
    const hasAccess = await checkEmailAccess(email);

    if (hasAccess) {
      const accessData = await getEmailAccessData(email);
      return NextResponse.json({
        hasAccess: true,
        grantedAt: accessData?.grantedAt,
      });
    }

    return NextResponse.json({
      hasAccess: false,
    });
  } catch (error) {
    console.error('Error verifying access:', error);
    return NextResponse.json(
      { error: 'Failed to verify access' },
      { status: 500 }
    );
  }
}
