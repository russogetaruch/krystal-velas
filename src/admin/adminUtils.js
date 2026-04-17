import { supabase } from '../lib/supabase';

/**
 * Registra uma ação administrativa na tabela audit_logs.
 */
export async function logAudit(session, event, details = {}, severity = 'INFO') {
  if (!session?.user) return;
  
  try {
    await supabase.from('audit_logs').insert({
      email: session.user.email,
      user_id: session.user.id,
      event,
      severity,
      details,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Falha ao registrar log de auditoria:', err);
  }
}

/**
 * Remove arquivos do Supabase Storage associados a um produto ou galeria.
 * @param {string[]} urls Lista de URLs públicas das imagens a serem removidas.
 */
export async function cleanupStorage(urls) {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return;

  const pathsToDelete = urls
    .map(url => {
      try {
        const parts = url.split('/public/gallery/');
        return parts.length > 1 ? parts[1] : null;
      } catch (e) {
        return null;
      }
    })
    .filter(path => path && !path.startsWith('local/'));

  if (pathsToDelete.length === 0) return;

  try {
    const { error } = await supabase.storage
      .from('gallery')
      .remove(pathsToDelete);
    
    if (error) throw error;
    console.log(`[StorageCleanup] Removidos ${pathsToDelete.length} arquivos.`);
  } catch (err) {
    console.error('[StorageCleanup] Erro ao remover arquivos do storage:', err);
  }
}

/**
 * Baixa automática de estoque ao confirmar pagamento de um pedido.
 * Usa a RPC decrement_stock (GREATEST 0) para operação atômica.
 * @param {object} session   - Sessão do admin autenticado
 * @param {string} orderId   - UUID do pedido
 * @param {Array}  items     - order_items rows [{product_id, product_name, quantity, price_at_purchase}]
 * @returns {Array}          - Resultados [{product_id, newStock}]
 */
export async function deductStock(session, orderId, items) {
  if (!items || items.length === 0) return [];

  const results = [];

  for (const item of items) {
    try {
      // 1. Decrement atômico via RPC (evita race condition)
      const { data: newStock, error: rpcErr } = await supabase.rpc('decrement_stock', {
        p_product_id : item.product_id,
        p_quantity   : item.quantity,
      });

      if (rpcErr) throw rpcErr;

      // 2. Busca custo unitário atual para o CMV
      const { data: product } = await supabase
        .from('products')
        .select('unit_cost')
        .eq('id', item.product_id)
        .single();

      // 3. Registra movimentação em inventory_logs
      await supabase.from('inventory_logs').insert({
        product_id  : item.product_id,
        order_id    : orderId,
        type        : 'saida',
        quantity    : -item.quantity,
        unit_cost   : product?.unit_cost || item.price_at_purchase,
        notes       : `Baixa automática · Pedido #${orderId.slice(0, 8)}`,
        created_by  : session?.user?.id,
      });

      results.push({ product_id: item.product_id, newStock });
    } catch (err) {
      console.error(`[deductStock] Produto ${item.product_id}:`, err);
    }
  }

  return results;
}

