import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const signature = req.headers.get('x-paystack-signature');
  const body = await req.text();
  
  if (!signature) {
    return NextResponse.json({ message: 'No signature' }, { status: 400 });
  }

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Handle the event
  if (event.event === 'charge.success') {
    // Update subscription status in database
    console.log('Payment successful:', event.data.reference);
  }

  return NextResponse.json({ message: 'OK' }, { status: 200 });
}
