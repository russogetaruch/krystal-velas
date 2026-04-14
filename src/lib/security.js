import { supabase } from './supabase';

/**
 * Busca o IP público do visitante
 */
export async function getVisitorIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Registra um evento de segurança no banco de dados
 */
export async function logSecurityEvent(event, email, details = {}, severity = 'INFO') {
  try {
    const ip = await getVisitorIP();
    
    // Chama a função RPC do Postgres configurada no SQL de blindagem
    await supabase.rpc('log_security_event', {
      p_event: event,
      p_email: email,
      p_details: details,
      p_ip: ip,
      p_severity: severity
    });
  } catch (e) {
    console.error('Falha ao registrar log de segurança:', e);
  }
}
