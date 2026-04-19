-- ================================================================
-- KRYSTAL VELAS — INTEGRAÇÃO TOTAL E SEED DATA
-- Execute no Supabase SQL Editor
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. REFINAMENTO DO SCHEMA
-- ----------------------------------------------------------------

-- Vincular Insumos a Fornecedores
ALTER TABLE raw_materials 
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- Expandir logs de inventário para suportar insumos
ALTER TABLE inventory_logs 
  ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE inventory_logs 
  ADD COLUMN IF NOT EXISTS raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------
-- 2. CARGA DE DADOS (SEED DATA)
-- ----------------------------------------------------------------

-- 2.1 Categorias (Limpando e inserindo novas se necessário)
INSERT INTO categories (name, slug) 
VALUES 
  ('Velas Aromáticas', 'velas-aromaticas'),
  ('Velas Decorativas', 'velas-decorativas'),
  ('Acessórios', 'acessorios')
ON CONFLICT (slug) DO NOTHING;

-- 2.2 Fornecedores
INSERT INTO suppliers (name, email, phone, notes)
VALUES 
  ('Parafinas Brasil Ltda', 'contato@parafinasbrasil.com.br', '11999999999', 'Fornecedor principal de parafina de soja'),
  ('Essências Premium Lux', 'vendas@essenciaslux.com.br', '11888888888', 'Fragrâncias importadas de alta concentração'),
  ('Vidros & Cia', 'comercial@vidroscia.com.br', '11777777777', 'Copos e potes de vidro para velas')
ON CONFLICT DO NOTHING;

-- 2.3 Matérias-Primas (Insumos)
-- Nota: uuid_generate_v4() é usado, então pegaremos IDs via subquery ou fixos para demo
WITH supp_parafina AS (SELECT id FROM suppliers WHERE name = 'Parafinas Brasil Ltda' LIMIT 1),
     supp_essencia AS (SELECT id FROM suppliers WHERE name = 'Essências Premium Lux' LIMIT 1),
     supp_vidro AS (SELECT id FROM suppliers WHERE name = 'Vidros & Cia' LIMIT 1)
INSERT INTO raw_materials (name, unit, stock, min_stock, unit_cost, supplier_id)
VALUES 
  ('Parafina de Soja Eco', 'kg', 50.000, 10.000, 18.50, (SELECT id FROM supp_parafina)),
  ('Essência de Lavanda Francesa', 'ml', 1000.000, 200.000, 0.85, (SELECT id FROM supp_essencia)),
  ('Essência de Bamboo', 'ml', 500.000, 100.000, 0.92, (SELECT id FROM supp_essencia)),
  ('Pavio de Algodão (Rolo)', 'un', 100.000, 20.000, 0.50, (SELECT id FROM supp_parafina)),
  ('Copo de Vidro 200ml', 'un', 48.000, 12.000, 4.20, (SELECT id FROM supp_vidro));

-- 2.4 Produtos Acabados (Velas)
WITH cat_aromatica AS (SELECT id FROM categories WHERE slug = 'velas-aromaticas' LIMIT 1)
INSERT INTO products (name, description, price, category_id, stock, unit_cost)
VALUES 
  ('Vela de Lavanda Relaxante', 'Vela artesanal com essência de lavanda e parafina de soja.', 59.90, (SELECT id FROM cat_aromatica), 24, 22.50),
  ('Vela Bamboo Fresh', 'Frescor cítrico e elegância para seu ambiente.', 64.90, (SELECT id FROM cat_aromatica), 12, 24.80)
ON CONFLICT DO NOTHING;

-- 2.5 Fichas Técnicas (BOM)
-- Vincula Insumos aos Produtos
WITH prod_lavanda AS (SELECT id FROM products WHERE name = 'Vela de Lavanda Relaxante' LIMIT 1),
     prod_bamboo AS (SELECT id FROM products WHERE name = 'Vela Bamboo Fresh' LIMIT 1),
     mat_parafina AS (SELECT id FROM raw_materials WHERE name = 'Parafina de Soja Eco' LIMIT 1),
     mat_lavanda AS (SELECT id FROM raw_materials WHERE name = 'Essência de Lavanda Francesa' LIMIT 1),
     mat_bamboo AS (SELECT id FROM raw_materials WHERE name = 'Essência de Bamboo' LIMIT 1),
     mat_pavio AS (SELECT id FROM raw_materials WHERE name = 'Pavio de Algodão (Rolo)' LIMIT 1),
     mat_copo AS (SELECT id FROM raw_materials WHERE name = 'Copo de Vidro 200ml' LIMIT 1)
INSERT INTO product_composition (product_id, raw_material_id, quantity)
VALUES 
  ((SELECT id FROM prod_lavanda), (SELECT id FROM mat_parafina), 0.200),
  ((SELECT id FROM prod_lavanda), (SELECT id FROM mat_lavanda), 15.000),
  ((SELECT id FROM prod_lavanda), (SELECT id FROM mat_pavio), 1.000),
  ((SELECT id FROM prod_lavanda), (SELECT id FROM mat_copo), 1.000),
  
  ((SELECT id FROM prod_bamboo), (SELECT id FROM mat_parafina), 0.180),
  ((SELECT id FROM prod_bamboo), (SELECT id FROM mat_bamboo), 18.000),
  ((SELECT id FROM prod_bamboo), (SELECT id FROM mat_pavio), 1.000),
  ((SELECT id FROM prod_bamboo), (SELECT id FROM mat_copo), 1.000)
ON CONFLICT DO NOTHING;

COMMIT;
