-- Adiciona coluna is_featured na tabela products (se ainda não existir)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Atualiza o schema cache do Supabase (PostgREST)
-- (isso é feito automaticamente, mas o NOTIFY força a atualização imediata)
NOTIFY pgrst, 'reload schema';
