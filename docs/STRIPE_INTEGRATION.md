# Stripe Payment Integration Guide

## Overview

This guide covers the complete Stripe integration for handling subscriptions, payments, and user access level management in the Chapter Analysis Tool (Tome IQ).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Flow                            │
├─────────────────────────────────────────────────────────┤
│  1. User clicks "Upgrade" button                        │
│  2. Frontend calls createCheckoutSession()              │
│  3. API creates Stripe Checkout session                 │
│  4. User redirected to Stripe hosted checkout           │
│  5. User completes payment                              │
│  6. Stripe sends webhook to your server                 │
│  7. Webhook updates user's access_level in Supabase     │
│  8. User returns to app with new access                 │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Stripe account (https://stripe.com)
- Supabase project set up with auth and profiles table
- Vercel or similar hosting platform for API routes

## Step 1: Create Stripe Products

### 1. Create Products in Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**

**Product 1: Premium Tier**

- **Name**: Tome IQ Premium
- **Description**: Full analysis suite with exports and custom domains
- **Pricing**: $9/month (or your chosen price)
- **Billing**: Recurring monthly
- **Copy the Price ID**: Starts with `price_...`

**Product 2: Professional Tier**

- **Name**: Tome IQ Professional
- **Description**: Unlimited analyses with Writer Mode and AI templates
- **Pricing**: $29/month (or your chosen price)
- **Billing**: Recurring monthly
- **Copy the Price ID**: Starts with `price_...`

### 2. Update Price IDs in Code

Edit `src/utils/stripe.ts`:

```typescript
export const STRIPE_PRICES = {
  premium: "price_1234567890abcdef", // Your actual Premium price ID
  professional: "price_abcdef1234567890", // Your actual Professional price ID
};
```

## Step 2: Set Up API Routes

Stripe Checkout requires server-side API endpoints. Here's how to set them up on Vercel.

### Create API Directory

```bash
mkdir -p api
```

### Create Checkout Session Endpoint

**File**: `api/create-checkout-session.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, userId, email } = req.body;

    if (!priceId || !userId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get or create Stripe customer
    let customerId: string;

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || req.headers.origin
      }/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || req.headers.origin}/`,
      metadata: {
        supabase_user_id: userId,
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ error: error.message });
  }
}
```

### Create Customer Portal Endpoint

**File**: `api/create-portal-session.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    // Get Stripe customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(404).json({ error: "No subscription found" });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: process.env.NEXT_PUBLIC_APP_URL || req.headers.origin,
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Portal session error:", error);
    res.status(500).json({ error: error.message });
  }
}
```

## Step 3: Set Up Webhook Handler

Webhooks notify your app when subscription status changes.

### Create Webhook Endpoint

**File**: `api/stripe-webhook.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: error.message });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const priceId = subscription.items.data[0].price.id;
  const accessLevel = getAccessLevelFromPrice(priceId);

  await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      access_level: accessLevel,
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    // Find user by customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", subscription.customer)
      .single();

    if (!profile) return;
  }

  const priceId = subscription.items.data[0].price.id;
  const accessLevel = getAccessLevelFromPrice(priceId);

  await supabase
    .from("profiles")
    .update({
      subscription_status: subscription.status,
      subscription_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      access_level: accessLevel,
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      access_level: "free",
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Payment succeeded - subscription remains active
  if (invoice.subscription) {
    await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
      })
      .eq("stripe_subscription_id", invoice.subscription);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Payment failed - mark as past_due
  if (invoice.subscription) {
    await supabase
      .from("profiles")
      .update({
        subscription_status: "past_due",
      })
      .eq("stripe_subscription_id", invoice.subscription);
  }
}

function getAccessLevelFromPrice(priceId: string): string {
  // Map your Stripe price IDs to access levels
  const PRICE_MAPPINGS: Record<string, string> = {
    price_premium_id_here: "premium",
    price_professional_id_here: "professional",
  };

  return PRICE_MAPPINGS[priceId] || "free";
}
```

## Step 4: Configure Environment Variables

### Add to Vercel/Netlify

Add these environment variables to your hosting platform:

```bash
# Stripe Keys (from Stripe Dashboard -> Developers -> API keys)
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Already in your .env

# Webhook Secret (from Stripe Dashboard -> Developers -> Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (for server-side operations)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # NOT the anon key!

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**⚠️ Security Note**: Never expose `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client-side code!

## Step 5: Register Webhook in Stripe

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://your-app.vercel.app/api/stripe-webhook`
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **Copy the signing secret** (starts with `whsec_...`)
7. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 6: Update Stripe Configuration

Edit `src/utils/stripe.ts` to use the correct price IDs:

```typescript
// Replace these with your actual Stripe Price IDs
export const STRIPE_PRICES = {
  premium: "price_1234567890", // From Step 1
  professional: "price_abcdef1234", // From Step 1
};
```

## Testing the Integration

### Test Mode (Development)

1. **Use Test Keys**

   - Use `pk_test_...` and `sk_test_...` keys
   - Test cards won't charge real money

2. **Test Card Numbers** (Stripe provides these):

   ```
   Success: 4242 4242 4242 4242
   Declined: 4000 0000 0000 0002
   3D Secure: 4000 0025 0000 3155
   ```

3. **Test Workflow**:
   ```
   1. Sign in to app
   2. Click "Upgrade to Professional"
   3. Use test card: 4242 4242 4242 4242
   4. Expiry: Any future date
   5. CVC: Any 3 digits
   6. ZIP: Any 5 digits
   7. Complete checkout
   8. Verify user access_level updated in Supabase
   ```

### Test Webhooks Locally

Use Stripe CLI to test webhooks on localhost:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

### Verify Database Updates

After successful checkout, check Supabase:

```sql
SELECT
  email,
  access_level,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id
FROM profiles
WHERE email = 'test@example.com';
```

Should show:

- `access_level`: `premium` or `professional`
- `subscription_status`: `active`
- `stripe_customer_id`: `cus_...`
- `stripe_subscription_id`: `sub_...`

## Production Checklist

Before going live:

- [ ] Replace test keys with live keys (`pk_live_...`, `sk_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Test with real small payment (then refund)
- [ ] Verify webhook events are being received
- [ ] Test customer portal (manage subscription)
- [ ] Test cancellation flow
- [ ] Set up Stripe email receipts
- [ ] Configure Stripe billing settings
- [ ] Add Terms of Service URL in Stripe settings
- [ ] Add Privacy Policy URL in Stripe settings
- [ ] Test failed payment handling
- [ ] Verify access revoked when subscription expires

## Troubleshooting

### "No such price" Error

- Verify price IDs in `stripe.ts` match Stripe Dashboard
- Ensure you're using test prices with test keys, live prices with live keys

### Webhook Not Firing

- Check webhook endpoint URL is publicly accessible
- Verify webhook secret in environment variables
- Check Stripe Dashboard -> Webhooks -> Event logs
- Ensure correct events are selected in webhook config

### Access Level Not Updating

- Check webhook handler logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)
- Check `getAccessLevelFromPrice()` function has correct price mappings
- Verify user's `stripe_customer_id` is saved correctly

### "Payment method required" Error

- User must add payment method in checkout
- Verify checkout session includes `line_items`
- Check Stripe Dashboard for more details

### Users Stuck on "Loading" After Checkout

- Verify success_url is correct
- Check that access_level is being updated
- Ensure frontend refetches user profile after redirect

## Customer Portal

The customer portal allows users to:

- View subscription details
- Update payment method
- View invoice history
- Cancel subscription

Accessed via `createCustomerPortalSession()` in `stripe.ts`.

## Next Steps

1. ✅ Create Stripe products and prices
2. ✅ Set up API routes
3. ✅ Configure environment variables
4. ✅ Register webhook endpoint
5. ✅ Test with test cards
6. ✅ Verify database updates
7. ✅ Deploy to production
8. ✅ Switch to live keys

## Additional Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Supabase Auth: https://supabase.com/docs/guides/auth
