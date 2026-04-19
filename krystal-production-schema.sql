-- ================================================================
-- KRYSTAL VELAS — MÓDULO DE PRODUÇÃO INDUSTRIAL v1.0
-- Execute no Supabase SQL Editor
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. TABELA: raw_materials (Insumos/Matérias-Primas)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_materials (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT        NOT NULL,
  unit             TEXT        NOT NULL CHECK (unit IN ('kg', 'g', 'l', 'ml', 'un')),
  stock            DECIMAL(12,3) DEFAULT 0,
  min_stock        DECIMAL(12,3) DEFAULT 0,
  unit_cost        DECIMAL(10,2) DEFAULT 0, -- Custo médio do insumo
  notes            TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. TABELA: product_composition (BOM / Ficha Técnica)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_composition (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id  UUID        NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity         DECIMAL(12,3) NOT NULL, -- Qtd do insumo para 1 unidade do produto
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, raw_material_id)
);

-- ----------------------------------------------------------------
-- 3. TABELA: production_logs (Ordens de Produção Finalizadas)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_logs (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_produced INTEGER     NOT NULL,
  unit_cost_at_prod DECIMAL(10,2), -- Custo calculado no momento da produção
  notes            TEXT,
  created_by       UUID        REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------
ALTER TABLE raw_materials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_composition ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs     ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem gerenciar
CREATE POLICY "admins_full_access_raw_materials" ON raw_materials
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE POLICY "admins_full_access_composition" ON product_composition
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

CREATE POLICY "admins_full_access_production_logs" ON production_logs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- ----------------------------------------------------------------
-- 5. FUNCTION: execute_production (Baixa atômica de insumos + Entrada de produto)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION execute_production(
  p_product_id UUID, 
  p_quantity INTEGER, 
  p_user_id UUID,
  p_unit_cost DECIMAL
)
RETURNS VOID AS $$
DECLARE
    v_comp RECORD;
BEGIN
    -- 1. Verificar se há composição cadastrada
    IF NOT EXISTS (SELECT 1 FROM product_composition WHERE product_id = p_product_id) THEN
        RAISE EXCEPTION 'Produto não possui ficha técnica cadastrada.';
    END IF;

    -- 2. Decrementar estoque de cada insumo da receita
    FOR v_comp IN 
        SELECT raw_material_id, quantity 
        FROM product_composition 
        WHERE product_id = p_product_id
    LOOP
        -- Checa estoque disponível (opcional, aqui apenas retira)
        UPDATE raw_materials
        SET stock = stock - (v_comp.quantity * p_quantity)
        WHERE id = v_comp.raw_material_id;
    END LOOP;

    -- 3. Incrementar estoque do produto acabado
    UPDATE products
    SET stock = stock + p_quantity,
        unit_cost = p_unit_cost -- Atualiza o custo do produto com o calculado
    WHERE id = p_product_id;

    -- 4. Registrar log de produção
    INSERT INTO production_logs (product_id, quantity_produced, unit_cost_at_prod, created_by)
    VALUES (p_product_id, p_quantity, p_unit_cost, p_user_id);

    -- 5. Registrar log de inventário para o produto acabado (Entrada)
    INSERT INTO inventory_logs (product_id, type, quantity, unit_cost, notes, created_by)
    VALUES (p_product_id, 'entrada', p_quantity, p_unit_cost, 'Produção Industrial Automatizada', p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- 6. DADOS INICIAIS: Semente de Insumos (Opcional)
-- ----------------------------------------------------------------
-- INSERT INTO raw_materials (name, unit, stock, min_stock, unit_cost) 
-- VALUES ('Parafina Lentilhada', 'kg', 0, 10, 15.50);

COMMIT;
