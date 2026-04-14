-- SEGURANÇA AVANÇADA: KRYSTAL VELAS
-- IMPLEMENTAÇÃO DE AUDITORIA E CONTROLE DE ACESSO INTERNO

BEGIN;

-- 1. TABELA DE AUDITORIA (LOGS)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    event TEXT NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'BRUTE_FORCE_ALERT', etc.
    email TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip TEXT,
    severity TEXT DEFAULT 'INFO' -- 'INFO', 'WARNING', 'CRITICAL'
);

-- Ativar RLS nos Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas Super Admin pode ler os logs
CREATE POLICY "SuperAdmin ve logs" ON public.audit_logs
FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Permitir inserção de logs (público para tentativas de login)
CREATE POLICY "Inserção pública de logs" ON public.audit_logs
FOR INSERT WITH CHECK (true);

-- 2. TABELA DE E-MAILS AUTORIZADOS (WHITELIST)
CREATE TABLE IF NOT EXISTS public.authorized_emails (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    authorized_by UUID REFERENCES auth.users(id)
);

-- Ativar RLS na Whitelist
ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

-- Apenas Super Admin gerencia a whitelist
CREATE POLICY "SuperAdmin gerencia whitelist" ON public.authorized_emails
FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Leitura pública para o Setup de primeiro acesso
CREATE POLICY "Leitura pública whitelist" ON public.authorized_emails
FOR SELECT USING (true);

-- 3. FUNÇÃO DE LIMPEZA (RETENÇÃO DE 60 DIAS)
CREATE OR REPLACE FUNCTION public.cleanup_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO PARA REGISTRO DE EVENTO (FACILITADOR)
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event TEXT,
    p_email TEXT,
    p_details JSONB,
    p_ip TEXT,
    p_severity TEXT DEFAULT 'INFO'
) RETURNS void AS $$
BEGIN
    INSERT INTO public.audit_logs (event, email, details, ip, severity)
    VALUES (p_event, p_email, p_details, p_ip, p_severity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
