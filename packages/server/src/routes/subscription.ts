import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { getStripe, hasStripe } from '../stripe';

const router = Router();

const PLANS = {
  monthly: { amount: 999, interval: 'month' as const, label: 'premium_monthly' },
  annual: { amount: 5999, interval: 'year' as const, label: 'premium_annual' },
};

router.post('/create-checkout', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { plan } = req.body;
  if (!plan || !['monthly', 'annual'].includes(plan)) {
    return res.status(400).json({ error: 'Plan inválido. Usa: monthly, annual' });
  }
  if (!hasStripe()) {
    return res.status(503).json({ error: 'Pasarela de pago no disponible (Stripe no configurado)' });
  }

  const p = PLANS[plan as keyof typeof PLANS];
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const origin = req.headers.origin || 'http://localhost:3006';

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Mente Sana Premium',
            description: plan === 'annual' ? 'Plan Anual' : 'Plan Mensual',
          },
          unit_amount: p.amount,
          recurring: { interval: p.interval },
        },
        quantity: 1,
      }],
      customer_email: user.email,
      metadata: {
        userId,
        plan,
      },
      success_url: `${origin}/subscribe?success=true`,
      cancel_url: `${origin}/subscribe?cancelled=true`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe Checkout Error]', err);
    res.status(500).json({ error: err.message || 'Error al crear sesión de pago' });
  }
});

router.post('/create-portal', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  if (!hasStripe()) {
    return res.status(503).json({ error: 'Stripe no configurado' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeCustomerId) {
    return res.status(400).json({ error: 'No tienes una suscripción activa en Stripe' });
  }

  const origin = req.headers.origin || 'http://localhost:3006';

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/subscribe`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe Portal Error]', err);
    res.status(500).json({ error: err.message || 'Error al crear portal de administración' });
  }
});

router.post('/cancel', async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (user.stripeSubscriptionId && hasStripe()) {
    try {
      await getStripe().subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (err: any) {
      console.error('[Stripe Cancel Error]', err);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { subscription: 'free', stripeSubscriptionId: null },
  });

  res.json({ subscription: 'free' });
});

export default router;
