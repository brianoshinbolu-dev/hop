'use client';
import React from 'react';
import { usePaystackPayment } from 'react-paystack';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({ email, amount, reference, onSuccess, onClose }) => {
  const config = {
    reference,
    email,
    amount: amount * 100, // Convert to kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      onClick={() => {
        initializePayment({
          onSuccess: (response) => onSuccess(response.reference),
          onClose,
        });
      }}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Pay Now
    </button>
  );
};

export default PaystackPayment;
