'use client';

import RichText from '@/components/rich-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RegistryItem, RegistryPurchase } from '@/payload-types';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { submitRegistryPurchase } from './actions';

type Props = {
  purchasedCount: number;
  item: RegistryItem;
};

type ViewState =
  | 'initial'
  | 'already-purchased'
  | 'store'
  | 'purchased'
  | 'submitted';

type Flow = 'new-purchase' | 'existing-purchase';

export function RegistryItemDialog({ item, purchasedCount }: Props) {
  const [viewState, setViewState] = useState<ViewState>('initial');
  const [flow, setFlow] = useState<Flow>('new-purchase');

  return (
    <DialogContent className="flex flex-col justify-evenly gap-8 p-8 sm:grid sm:max-w-xl sm:grid-cols-2 md:max-w-2xl lg:max-w-3xl">
      {typeof item.image === 'object' && (
        <Image
          src={item.image.url!}
          alt={item.image.alt}
          width={item.image.width!}
          height={item.image.height!}
          className="basis-1/2"
        />
      )}
      <form action={submitRegistryPurchase}>
        <input type="hidden" name="registryItem" value={item.id} />
        <div
          className={cn('flex flex-col', viewState !== 'initial' && 'hidden')}
        >
          <InitialView
            purchasedCount={purchasedCount}
            item={item}
            flow={flow}
            setFlow={setFlow}
            setViewState={setViewState}
          />
        </div>
        <div
          className={cn(
            'flex flex-col',
            viewState !== 'already-purchased' && 'hidden',
          )}
        >
          <AlreadyPurchasedView
            purchasedCount={purchasedCount}
            item={item}
            flow={flow}
            setFlow={setFlow}
            setViewState={setViewState}
          />
        </div>
        <div className={cn('flex flex-col', viewState !== 'store' && 'hidden')}>
          <StoreView
            purchasedCount={purchasedCount}
            item={item}
            flow={flow}
            setFlow={setFlow}
            setViewState={setViewState}
          />
        </div>
        <div
          className={cn('flex flex-col', viewState !== 'purchased' && 'hidden')}
        >
          <ContactInfoView
            purchasedCount={purchasedCount}
            item={item}
            flow={flow}
            setFlow={setFlow}
            setViewState={setViewState}
          />
        </div>
        <div
          className={cn('flex flex-col', viewState !== 'submitted' && 'hidden')}
        >
          <SubmittedView />
        </div>
      </form>
    </DialogContent>
  );
}

type ViewStateProps = {
  item: RegistryItem;
  purchasedCount: number;
  flow: Flow;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  setFlow: React.Dispatch<React.SetStateAction<Flow>>;
};

function InitialView({
  item,
  purchasedCount,
  setFlow,
  setViewState,
}: ViewStateProps) {
  const formatPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item.title}</DialogTitle>
        <DialogDescription asChild>
          {item.description && <RichText data={item.description} />}
        </DialogDescription>
      </DialogHeader>
      <div className="mt-auto">
        {item.price && (
          <span className="text-sm font-semibold">
            {formatPrice.format(item.price)}
          </span>
        )}
        {item.quantityRequested != null && (
          <>
            <div className="mb-1 flex justify-between pt-2 text-sm">
              <span>Requested: {item.quantityRequested}</span>
              <span>
                Received: {purchasedCount} of {item.quantityRequested}
              </span>
            </div>
            <Progress
              value={(purchasedCount / item.quantityRequested) * 100}
              className="mb-6 h-2"
            />
          </>
        )}
        <Button
          type="button"
          className="mt-auto w-full"
          onClick={() => {
            setViewState('already-purchased');
            setFlow('new-purchase');
          }}
        >
          Purchase This Gift
          {typeof item.store === 'object' && (
            <span className="text-sm font-semibold">
              From {item.store?.label}
            </span>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full"
          onClick={() => {
            setViewState('already-purchased');
            setFlow('existing-purchase');
          }}
        >
          I Already Purchased This Gift
        </Button>
      </div>
    </>
  );
}

function AlreadyPurchasedView({
  item,
  flow,
  setViewState,
  purchasedCount,
}: ViewStateProps) {
  return (
    <>
      <DialogHeader>
        <Button
          type="button"
          variant="ghost"
          className="self-start p-0 font-bold"
          onClick={() => setViewState('initial')}
        >
          <ArrowLeft />
          Back
        </Button>
        <DialogTitle>{item.title}</DialogTitle>
        {flow === 'new-purchase' && (
          <Button variant="outline" asChild className="my-4 w-full">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              View Gift
              {typeof item.store === 'object' && <> On {item.store?.label}</>}
              <ExternalLink />
            </a>
          </Button>
        )}
        <DialogDescription>
          Let’s update their registry! How many of these did you buy?
        </DialogDescription>
        <div className="my-4">
          I bought
          <Select name="quantity" defaultValue="1">
            <SelectTrigger className="mx-2 inline-flex w-16">
              <SelectValue placeholder="1" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: (item.quantityRequested || 1) - purchasedCount },
                (_, i) => (
                  <SelectItem key={i} value={`${i + 1}`}>
                    {i + 1}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </DialogHeader>
      <Button
        type="button"
        onClick={() => setViewState('store')}
        className="my-4 w-full"
      >
        Continue
      </Button>
    </>
  );
}

function StoreView({ item, setViewState }: ViewStateProps) {
  const [purchasedAt, setPurchasedAt] =
    useState<RegistryPurchase['purchasedAt']>('online');
  const [orderNumber, setOrderNumber] = useState('');
  const [noOrderNumber, setNoOrderNumber] = useState(false);

  return (
    <>
      <DialogHeader>
        <Button
          type="button"
          variant="ghost"
          className="self-start p-0 font-bold"
          onClick={() => setViewState('already-purchased')}
        >
          <ArrowLeft />
          Back
        </Button>
        <DialogTitle>Did you buy it online or in store?</DialogTitle>
      </DialogHeader>
      <RadioGroup
        defaultValue="online"
        name="purchasedAt"
        className="my-4 flex"
        onValueChange={(value) =>
          setPurchasedAt(value as RegistryPurchase['purchasedAt'])
        }
        value={purchasedAt}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="online" id="online" />
          <Label htmlFor="online">Online</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="in-store" id="in-store" />
          <Label htmlFor="in-store">In Store</Label>
        </div>
      </RadioGroup>
      {purchasedAt === 'online' && (
        <>
          <span className="text-sm font-semibold">
            What was your order number{' '}
            {typeof item.store === 'object' && `from ${item.store?.label}`}?
          </span>
          <span className="text-xs font-semibold">
            Your order number can be found on your email confirmation
          </span>
          <div className="my-4 grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="order-number">Order Number</Label>
            <Input
              id="order-number"
              name="orderNumber"
              type="text"
              disabled={noOrderNumber}
              className="w-full"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
            />
          </div>
          <div className="my-4 flex items-center space-x-2">
            <Checkbox
              id="no-order-number"
              checked={noOrderNumber}
              onCheckedChange={(checked) =>
                setNoOrderNumber(checked as boolean)
              }
            />
            <Label htmlFor="no-order-number">
              I don’t have an order number
            </Label>
          </div>
        </>
      )}
      <Button
        type="button"
        className="mt-auto w-full"
        disabled={!orderNumber && !noOrderNumber && purchasedAt === 'online'}
        onClick={() => setViewState('purchased')}
      >
        Continue
      </Button>
    </>
  );
}

function ContactInfoView({ setViewState }: ViewStateProps) {
  return (
    <>
      <DialogHeader>
        <Button
          type="button"
          variant="ghost"
          className="self-start p-0 font-bold"
          onClick={() => setViewState('store')}
        >
          <ArrowLeft />
          Back
        </Button>
        <DialogTitle>Who should we say this gift is from?</DialogTitle>
      </DialogHeader>
      <div className="my-4 grid grid-cols-2 gap-4">
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="purchaser-name">Name</Label>
          <Input
            id="purchaser-name"
            name="purchaserName"
            type="text"
            className="mb-2 w-full"
            required
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="purchaser-email">Email</Label>
          <Input
            id="purchaser-email"
            name="purchaserEmail"
            type="email"
            className="mb-2 w-full"
          />
        </div>
      </div>
      <Button
        className="mt-auto w-full"
        type="submit"
        onClick={() => setViewState('submitted')}
      >
        Submit
      </Button>
    </>
  );
}

function SubmittedView() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Thank you!</DialogTitle>
        <DialogDescription>
          <br />
          Your purchase has been recorded! We’re so grateful for your support as
          we start this exciting new chapter together. Your generosity truly
          means the world to us. We can't wait to celebrate with you soon!
          <br />
          <br />
          Love, Rachel and Jack
        </DialogDescription>
      </DialogHeader>
    </>
  );
}
