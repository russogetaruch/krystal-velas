-- ================================================================
-- KRYSTAL VELAS — ERP INDUSTRIAL SCHEMA v1.0
-- Execute no Supabase SQL Editor (em blocos se necessário)
-- ================================================================

-- ----------------------------------------------------------------
-- 0. Adicionar custo unitário nos produtos (base do CMV)
-- ----------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0;

-- ----------------------------------------------------------------
-- 1. TABELA: suppliers (Fornecedores)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  cnpj       TEXT,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  notes      TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. TABELA: inventory_logs (Movimentações de Estoque)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_logs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID        NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
  supplier_id UUID                 REFERENCES suppliers(id) ON DELETE SET NULL,
  order_id    UUID                 REFERENCES orders(id)    ON DELETE SET NULL,
  type        TEXT        NOT NULL
                          CHECK (type IN ('entrada','saida','ajuste','cancelamento')),
  quantity    INTEGER     NOT NULL,  -- positivo=entrada; negativo=saída/ajuste
  unit_cost   DECIMAL(10,2),         -- custo unitário → base do CMV
  notes       TEXT,
  created_by  UUID                 REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para queries do Dashboard Financeiro
CREATE INDEX IF NOT EXISTS idx_inv_logs_product  ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_logs_order    ON inventory_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_inv_logs_type     ON inventory_logs(type);
CREATE INDEX IF NOT EXISTS idx_inv_logs_created  ON inventory_logs(created_at DESC);

-- ----------------------------------------------------------------
-- 3. TABELA: invoices (Notas Fiscais)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID        NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'aguardando'
                             CHECK (status IN ('aguardando','processando','autorizada','rejeitada','cancelada')),
  nfe_ref        TEXT,        -- referência interna do emissor fiscal
  numero_nota    TEXT,
  serie          TEXT        DEFAULT '1',
  chave_acesso   TEXT        UNIQUE,
  danfe_url      TEXT,
  xml_url        TEXT,
  error_message  TEXT,
  emitted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order  ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ----------------------------------------------------------------
-- 4. FUNCTION: decrement_stock (atômica — evita race condition)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_stock INTEGER;
BEGIN
  UPDATE products
  SET    stock = GREATEST(0, stock - p_quantity)
  WHERE  id = p_product_id
  RETURNING stock INTO new_stock;

  RETURN COALESCE(new_stock, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------
ALTER TABLE suppliers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices        ENABLE ROW LEVEL SECURITY;

-- suppliers: admin + super_admin têm acesso total
CREATE POLICY "admins_full_access_suppliers" ON suppliers
  FOR ALL TO authenticated
  USING     (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')))
  WITH CHECK(EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- inventory_logs: leitura para admin, escrita para todos os admins
CREATE POLICY "admins_full_access_inventory_logs" ON inventory_logs
  FOR ALL TO authenticated
  USING     (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')))
  WITH CHECK(EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- invoices: admin + super_admin têm acesso total
CREATE POLICY "admins_full_access_invoices" ON invoices
  FOR ALL TO authenticated
  USING     (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')))
  WITH CHECK(EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- ================================================================
-- FIM — Execute o bloco acima no SQL Editor do Supabase
-- ================================================================
