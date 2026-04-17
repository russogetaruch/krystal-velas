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
 * Remove arquivros do Supabase Storage associados a um produto ou galeria.
 * @param {string[]} urls Lista de URLs públicas das imagens a serem removidas.
 */
export async function cleanupStorage(urls) {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return;

  const pathsToDelete = urls
    .map(url => {
      // Extrai o caminho relativo do bucket 'gallery'
      // Ex: https://.../storage/v1/object/public/gallery/products/123.webp -> products/123.webp
      try {
        const parts = url.split('/public/gallery/');
        return parts.length > 1 ? parts[1] : null;
      } catch (e) {
        return null;
      }
    })
    .filter(path => path && !path.startsWith('local/')); // Não deleta placeholders locais

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
