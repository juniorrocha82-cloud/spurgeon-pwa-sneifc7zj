ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
