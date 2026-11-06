import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
let stripeInstance: Stripe | null = null;

if (key) {
  stripeInstance = new Stripe(key, { apiVersion: '2025-03-31' as any });
}

export function getStripe(): Stripe {
  if (!stripeInstance) {
    throw new Error('Stripe no configurado. Define STRIPE_SECRET_KEY en .env');
  }
  return stripeInstance;
}

export function hasStripe(): boolean {
  return !!stripeInstance;
}
