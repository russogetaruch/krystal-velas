import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const payload = await req.json()
    const { record } = payload

    // Formatação do E-mail
    const emailBody = {
      from: "Krystal Velas Security <onboarding@resend.dev>", // Usar domínio verificado se tiver
      to: ["g.getaruch@gmail.com"],
      subject: `🚨 ALERTA CRÍTICO: ${record.event}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d32f2f;">Evento de Segurança Crítico Detectado</h2>
          <p>Um novo alerta do nível <strong>CRITICAL</strong> foi registrado no sistema Krystal Velas.</p>
          <hr />
          <p><strong>Evento:</strong> ${record.event}</p>
          <p><strong>E-mail:</strong> ${record.email || 'Não identificado'}</p>
          <p><strong>IP:</strong> ${record.ip}</p>
          <p><strong>Horário:</strong> ${new Date(record.created_at).toLocaleString('pt-BR')}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; margin-top: 15px;">
            <strong>Detalhes:</strong><br />
            ${JSON.stringify(record.details, null, 2)}
          </div>
          <hr />
          <p style="font-size: 11px; color: #999;">Esta é uma mensagem automática do sistema de auditoria blindado.</p>
        </div>
      `,
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    })

    const result = await response.json()
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
