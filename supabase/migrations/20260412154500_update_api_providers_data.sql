DO $$
BEGIN
  -- Atualiza o provedor Gemini
  INSERT INTO public.api_providers (provider_name, endpoint, rate_limit, priority, is_active)
  VALUES ('gemini', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', 60, 1, true)
  ON CONFLICT (provider_name) DO UPDATE
  SET endpoint = EXCLUDED.endpoint,
      rate_limit = EXCLUDED.rate_limit,
      priority = EXCLUDED.priority,
      is_active = EXCLUDED.is_active;

  -- Atualiza o provedor Groq
  INSERT INTO public.api_providers (provider_name, endpoint, rate_limit, priority, is_active)
  VALUES ('groq', 'https://api.groq.com/openai/v1/chat/completions', 30, 2, true)
  ON CONFLICT (provider_name) DO UPDATE
  SET endpoint = EXCLUDED.endpoint,
      rate_limit = EXCLUDED.rate_limit,
      priority = EXCLUDED.priority,
      is_active = EXCLUDED.is_active;

  -- Atualiza o provedor Cohere
  INSERT INTO public.api_providers (provider_name, endpoint, rate_limit, priority, is_active)
  VALUES ('cohere', 'https://api.cohere.ai/v1/generate', 100, 3, true)
  ON CONFLICT (provider_name) DO UPDATE
  SET endpoint = EXCLUDED.endpoint,
      rate_limit = EXCLUDED.rate_limit,
      priority = EXCLUDED.priority,
      is_active = EXCLUDED.is_active;

  -- Atualiza o provedor Together
  INSERT INTO public.api_providers (provider_name, endpoint, rate_limit, priority, is_active)
  VALUES ('together', 'https://api.together.xyz/v1/chat/completions', 50, 4, true)
  ON CONFLICT (provider_name) DO UPDATE
  SET endpoint = EXCLUDED.endpoint,
      rate_limit = EXCLUDED.rate_limit,
      priority = EXCLUDED.priority,
      is_active = EXCLUDED.is_active;
END $$;
