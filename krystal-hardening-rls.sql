-- BLINDAGEM DE SEGURANÇA: KRYSTAL VELAS
-- Este script garante que apenas administradores autenticados possam modificar o site.

BEGIN;

-- 1. FUNÇÃO AUXILIAR DE ROLE
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABELA PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de perfis" ON profiles;
CREATE POLICY "Leitura pública de perfis" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "SuperAdmin gerencia todos os perfis" ON profiles;
CREATE POLICY "SuperAdmin gerencia todos os perfis" ON profiles 
FOR ALL USING (get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "Usuários editam próprio perfil" ON profiles;
CREATE POLICY "Usuários editam próprio perfil" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
  -- Impede que o usuário mude sua própria role
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = role
);

DROP POLICY IF EXISTS "Usuários criam próprio perfil" ON profiles;
CREATE POLICY "Usuários criam próprio perfil" ON profiles
FOR INSERT WITH CHECK (
  auth.uid() = id AND 
  role = 'pending' -- Obriga a ser pendente na criação
);

-- 3. TABELA GALLERY (GALERIA)
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Galeria pública" ON gallery;
CREATE POLICY "Galeria pública" ON gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gerencia galeria" ON gallery;
CREATE POLICY "Admin gerencia galeria" ON gallery 
FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- 4. TABELA TESTIMONIALS (DEPOIMENTOS)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Depoimentos públicos" ON testimonials;
CREATE POLICY "Depoimentos públicos" ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gerencia depoimentos" ON testimonials;
CREATE POLICY "Admin gerencia depoimentos" ON testimonials 
FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- 5. TABELA SITE_CONTENT (CONTEÚDO DINÂMICO)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conteúdo público" ON site_content;
CREATE POLICY "Conteúdo público" ON site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin gerencia conteúdo" ON site_content;
CREATE POLICY "Admin gerencia conteúdo" ON site_content 
FOR ALL USING (get_user_role() IN ('admin', 'super_admin'));

-- 6. STORAGE POLICIES (POLÍTICAS DE ARQUIVOS)
-- Nota: Estas políticas são aplicadas na tabela storage.objects

-- Permitir leitura pública de arquivos no bucket 'gallery'
DROP POLICY IF EXISTS "Acesso público galeria" ON storage.objects;
CREATE POLICY "Acesso público galeria" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery');

-- Permitir que apenas Admins façam upload/delete no bucket 'gallery'
DROP POLICY IF EXISTS "Admin gerencia arquivos galeria" ON storage.objects;
CREATE POLICY "Admin gerencia arquivos galeria" ON storage.objects
FOR ALL USING (
  bucket_id = 'gallery' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

COMMIT;
