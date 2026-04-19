-- ================================================================
-- KRYSTAL VELAS — INFRAESTRUTURA COMPLETA ERP INDUSTRIAL
-- Execute este script no Supabase SQL Editor para criar tudo do zero
-- ================================================================

BEGIN;

-- 0. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. BASE: CATEGORIAS E PRODUTOS
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock       INTEGER     NOT NULL DEFAULT 0,
  unit_cost   DECIMAL(10,2) DEFAULT 0,
  category_id UUID        REFERENCES categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. FORNECEDORES
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
-- 3. MÓDULO INDUSTRIAL: MATÉRIAS-PRIMAS E RECEITAS
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS raw_materials (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT        NOT NULL,
  unit             TEXT        NOT NULL CHECK (unit IN ('kg', 'g', 'l', 'ml', 'un')),
  stock            DECIMAL(12,3) DEFAULT 0,
  min_stock        DECIMAL(12,3) DEFAULT 0,
  unit_cost        DECIMAL(10,2) DEFAULT 0,
  notes            TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garantir que a coluna supplier_id existe (Schema Evolution)
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS product_composition (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id  UUID        NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity         DECIMAL(12,3) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, raw_material_id)
);

-- ----------------------------------------------------------------
-- 4. LOGS DE INVENTÁRIO (UNIFICADO)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS inventory_logs (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID        REFERENCES products(id)  ON DELETE CASCADE,
  supplier_id      UUID        REFERENCES suppliers(id) ON DELETE SET NULL,
  type             TEXT        NOT NULL CHECK (type IN ('entrada','saida','ajuste','cancelamento')),
  quantity         DECIMAL(12,3) NOT NULL,
  unit_cost        DECIMAL(10,2),
  notes            TEXT,
  created_by       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garantir colunas para Insumos (Schema Evolution)
ALTER TABLE inventory_logs ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------
-- 5. PRODUÇÃO E FUNÇÕES
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS production_logs (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_produced INTEGER     NOT NULL,
  unit_cost_at_prod DECIMAL(10,2),
  notes            TEXT,
  created_by       UUID        REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
    FOR v_comp IN SELECT raw_material_id, quantity FROM product_composition WHERE product_id = p_product_id
    LOOP
        UPDATE raw_materials SET stock = stock - (v_comp.quantity * p_quantity) WHERE id = v_comp.raw_material_id;
    END LOOP;
    UPDATE products SET stock = stock + p_quantity, unit_cost = p_unit_cost WHERE id = p_product_id;
    INSERT INTO production_logs (product_id, quantity_produced, unit_cost_at_prod, created_by)
    VALUES (p_product_id, p_quantity, p_unit_cost, p_user_id);
    INSERT INTO inventory_logs (product_id, type, quantity, unit_cost, notes, created_by)
    VALUES (p_product_id, 'entrada', p_quantity, p_unit_cost, 'Produção Industrial Automatizada', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- 6. DADOS DE DEMONSTRAÇÃO (SEED DATA)
-- ----------------------------------------------------------------

INSERT INTO categories (name, slug) VALUES 
('Velas Aromáticas', 'velas-aromaticas'), ('Velas Decorativas', 'velas-decorativas') ON CONFLICT DO NOTHING;

INSERT INTO suppliers (name, email, phone) VALUES 
('Parafinas Brasil', 'contato@parafinas.com', '11999999999'),
('Essências Lux', 'vendas@essencias.com', '11888888888') ON CONFLICT DO NOTHING;

WITH supp_p AS (SELECT id FROM suppliers WHERE name = 'Parafinas Brasil' LIMIT 1),
     supp_e AS (SELECT id FROM suppliers WHERE name = 'Essências Lux' LIMIT 1)
INSERT INTO raw_materials (name, unit, stock, min_stock, unit_cost, supplier_id) VALUES 
('Parafina de Soja', 'kg', 50, 10, 18.50, (SELECT id FROM supp_p)),
('Essência Lavanda', 'ml', 1000, 100, 0.85, (SELECT id FROM supp_e)),
('Pavio Algodão', 'un', 100, 20, 0.50, (SELECT id FROM supp_p));

WITH cat_a AS (SELECT id FROM categories WHERE slug = 'velas-aromaticas' LIMIT 1)
INSERT INTO products (name, slug, price, category_id, stock, unit_cost) VALUES 
('Vela Lavanda Relax', 'vela-lavanda-relax', 59.90, (SELECT id FROM cat_a), 20, 22.50) ON CONFLICT DO NOTHING;

WITH prod_l AS (SELECT id FROM products WHERE slug = 'vela-lavanda-relax' LIMIT 1),
     mat_p AS (SELECT id FROM raw_materials WHERE name = 'Parafina de Soja' LIMIT 1),
     mat_e AS (SELECT id FROM raw_materials WHERE name = 'Essência Lavanda' LIMIT 1)
INSERT INTO product_composition (product_id, raw_material_id, quantity) VALUES 
((SELECT id FROM prod_l), (SELECT id FROM mat_p), 0.200),
((SELECT id FROM prod_l), (SELECT id FROM mat_e), 15.000) ON CONFLICT DO NOTHING;

COMMIT;
