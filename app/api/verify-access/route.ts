import { NextResponse } from 'next/server';
import { checkEmailAccess, getEmailAccessData } from '@/lib/kvAccess';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    console.log('Verification request received for email:', email);

    if (!email || typeof email !== 'string') {
      console.log('Invalid email format');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email has access
    console.log('Checking access for:', email);
    const hasAccess = await checkEmailAccess(email);
    console.log('Access check result:', hasAccess);

    if (hasAccess) {
      const accessData = await getEmailAccessData(email);
      console.log('Access data retrieved:', accessData);
      return NextResponse.json({
        hasAccess: true,
        grantedAt: accessData?.grantedAt,
      });
    }

    console.log('No access found for email:', email);
    return NextResponse.json({
      hasAccess: false,
    });
  } catch (error) {
    console.error('Error verifying access:', error);
    console.error('Error details:', String(error));
    return NextResponse.json(
      { error: 'Failed to verify access', message: String(error) },
      { status: 500 }
    );
  }
}
