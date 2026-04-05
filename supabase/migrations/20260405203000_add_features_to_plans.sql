ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

UPDATE public.subscription_plans
SET features = '["3 gerações em 7 dias", "Acesso básico aos recursos", "Suporte comunitário"]'::jsonb
WHERE id = 'free';

UPDATE public.subscription_plans
SET features = '["15 gerações por mês", "Exportação em PDF e PPTX", "Acesso a todas as ferramentas", "Suporte prioritário"]'::jsonb
WHERE id = 'pro';

UPDATE public.subscription_plans
SET features = '["Gerações ilimitadas", "Recursos exclusivos", "Treinamento dedicado", "Acesso antecipado a novas funções"]'::jsonb
WHERE id = 'enterprise';
