import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, amount, reference } = await req.json();

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: (amount * 100).toString(), // Convert to kobo
      reference,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
