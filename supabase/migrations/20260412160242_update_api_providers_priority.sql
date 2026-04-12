DO $$
BEGIN
  UPDATE public.api_providers SET priority = 1 WHERE provider_name = 'groq';
  UPDATE public.api_providers SET priority = 2 WHERE provider_name = 'gemini';
  UPDATE public.api_providers SET priority = 3 WHERE provider_name = 'cohere';
  UPDATE public.api_providers SET priority = 4 WHERE provider_name = 'together';
END $$;
