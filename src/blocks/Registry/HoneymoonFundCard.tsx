'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function CheckoutForm({
  amount,
  onSuccess,
  isEnabled,
}: {
  amount: number;
  onSuccess: () => void;
  isEnabled: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Validate the form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? 'An error occurred during submission');
        return;
      }

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          metadata: {
            type: 'honeymoon_fund',
            name,
            email,
            message,
          },
        }),
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name,
              email,
            },
          },
          return_url: window.location.href + '?payment=success',
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message || 'An error occurred');
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="mb-2">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email" className="mb-2">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="message" className="mb-2">
          Message (Optional)
        </Label>
        <textarea
          id="message"
          className="border-input min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a special message for the couple..."
        />
      </div>

      <div className="rounded-md border p-3">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name,
                email,
              },
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        type="submit"
        disabled={!stripe || processing || !isEnabled}
        className="w-full"
      >
        {processing
          ? 'Processing...'
          : isEnabled
            ? `Contribute ${formatter.format(amount)}`
            : 'Select Amount'}
      </Button>
    </form>
  );
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function HoneymoonFundCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [showThankYou, setShowThankYou] = useState(false);

  const handleAmountChange = (input: string) => {
    const numericValue = input.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const isValidAmount = amount !== '' && parseInt(amount) >= 1;
  const displayAmount = amount ? parseInt(amount) : 1;

  const handleSuccess = () => {
    setShowThankYou(true);
    setTimeout(() => {
      setIsOpen(false);
      setShowThankYou(false);
      setAmount('');
    }, 3000);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Image
          src="/media/bali.jpg"
          alt="Honeymoon Fund"
          width={300}
          height={300}
          className="aspect-square w-full object-cover"
        />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <CardTitle className="mb-2">Honeymoon Fund</CardTitle>
        <CardDescription className="mb-4 flex-1">
          Your generous contribution will help us create unforgettable memories
          on our honeymoon adventure in Bali, Indonesia. Thank you for being
          part of our journey!
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              Contribute to Our Honeymoon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {!showThankYou ? (
              <>
                <DialogHeader>
                  <DialogTitle>Honeymoon Fund Contribution</DialogTitle>
                  <DialogDescription>
                    Choose any amount to contribute to our honeymoon adventure
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="mb-2">
                      Enter Dollar Amount
                    </Label>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="$"
                      value={amount ? formatter.format(parseInt(amount)) : ''}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                  </div>

                  <Elements
                    stripe={stripePromise}
                    options={{
                      mode: 'payment',
                      currency: 'usd',
                      amount: displayAmount * 100,
                    }}
                  >
                    <CheckoutForm
                      amount={displayAmount}
                      onSuccess={handleSuccess}
                      isEnabled={isValidAmount}
                    />
                  </Elements>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <Heart className="text-primary mx-auto mb-4 h-16 w-16" />
                <DialogTitle className="mb-2 text-2xl">Thank You!</DialogTitle>
                <DialogDescription className="text-base">
                  Your generous gift means the world to us. We can't wait to
                  share our honeymoon adventures with you!
                </DialogDescription>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
