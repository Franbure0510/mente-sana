import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { getStripe } from '../stripe';

const router = Router();

router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET no configurado' });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, secret);
  } catch {
    return res.status(400).json({ error: 'Firma de webhook inválida' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const subId = session.subscription as string;
        const customerId = session.customer as string;
        if (userId && subId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subId,
              subscription: session.metadata?.plan === 'annual' ? 'premium_annual' : 'premium_monthly',
            },
          });
          console.log(`[Stripe] Usuario ${userId} suscrito (${subId})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: { subscription: 'free', stripeSubscriptionId: null },
        });
        console.log(`[Stripe] Suscripción cancelada para customer ${customerId}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = await getStripe().subscriptions.retrieve(invoice.subscription);
          const customerId = subscription.customer as string;
          const status = subscription.status;
          const plan = subscription.items.data[0]?.price?.recurring?.interval;
          const subValue = plan === 'year' ? 'premium_annual' : 'premium_monthly';
          if (status === 'active') {
            await prisma.user.update({
              where: { stripeCustomerId: customerId },
              data: { subscription: subValue },
            });
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook Error]', err);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

export default router;
