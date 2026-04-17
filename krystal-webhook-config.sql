-- CONFIGURAÇÃO DE WEBHOOK DE SEGURANÇA (SQL)
-- Execute este comando no SQL Editor do Supabase

BEGIN;

-- 1. Habilitar a extensão para requisições HTTP (se disponível via painel é mais simples, 
-- mas aqui preparamos o gatilho nativo do Supabase Webhooks)

-- Nota: O Supabase gerencia webhooks via uma interface própria, 
-- mas você pode criar o gatilho manualmente se preferir:

DROP TRIGGER IF EXISTS on_critical_log ON public.audit_logs;

-- Criamos um gatilho que dispara sempre que um log CRITICAL for inserido
CREATE TRIGGER on_critical_log
AFTER INSERT ON public.audit_logs
FOR EACH ROW
WHEN (NEW.severity = 'CRITICAL')
EXECUTE FUNCTION supabase_functions.http_request(
  'URL_DA_SUA_EDGE_FUNCTION', -- Você substituirá isso após o deploy da função
  'POST',
  '{"Content-Type": "application/json", "Authorization": "Bearer SUA_SERVICE_ROLE_KEY"}',
  '{}', -- Body será preenchido automaticamente com o record
  '5000'
);

COMMIT;

-- DIRETRIZES DE CONFIGURAÇÃO VIA PAINEL (MAIS RECOMENDADO):
-- 1. Vá em Database > Webhooks.
-- 2. Nome: "security-alert-webhook".
-- 3. Tabela: "audit_logs".
-- 4. Eventos: "Insert".
-- 5. URL: Cole a URL da sua Edge Function.
-- 6. HTTP Method: "POST".
-- 7. Headers: Adicione "Authorization: Bearer [SUA_ANON_KEY]".
