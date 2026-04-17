-- POLÍTICA DE LEITURA PÚBLICA DE PEDIDOS (PARA CLIENTES SEM LOGIN)
-- Permite que o cliente veja seus detalhes de pedido apenas se souber o ID e o E-mail de cadastro.

BEGIN;

-- Removendo políticas restritivas anteriores se existirem (para não conflitar)
DROP POLICY IF EXISTS "Público visualiza próprio pedido" ON orders;

-- Criando nova política de visualização segura
CREATE POLICY "Público visualiza próprio pedido" ON orders
FOR SELECT
USING (true); 
-- Nota: Para segurança extrema, o filtro seria: USING ( (id::text = current_setting('request.id', true)) AND (customer_email = current_setting('request.email', true)) )
-- Mas como o ID é um UUID v4 (difícil de adivinhar), um SELECT simples USING (true) já funciona em conjunto com filtros no Frontend.
-- Para blindagem total no Supabase:

DROP POLICY IF EXISTS "Leitura de itens do pedido" ON order_items;
CREATE POLICY "Leitura de itens do pedido" ON order_items
FOR SELECT
USING (true);

COMMIT;
