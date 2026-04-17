/**
 * nfeService.js — Interface de Integração com Emissor Fiscal
 * =============================================================
 * Este arquivo é o ÚNICO ponto de contato entre o admin da Krystal Velas
 * e o seu emissor de NF-e. Quando você tiver as credenciais da API do
 * seu emissor, configure as variáveis abaixo e implemente os TODOs.
 *
 * Variáveis de ambiente necessárias (.env):
 *   VITE_NFE_API_URL=https://api.seuemissor.com.br
 *   VITE_NFE_API_TOKEN=seu_token_aqui
 *   VITE_NFE_AMBIENTE=homologacao   (ou: producao)
 */

const NFE_CONFIG = {
  endpoint : import.meta.env.VITE_NFE_API_URL   || null,
  token    : import.meta.env.VITE_NFE_API_TOKEN  || null,
  ambiente : import.meta.env.VITE_NFE_AMBIENTE   || 'homologacao',
};

/**
 * Verifica se a integração está configurada.
 * @returns {boolean}
 */
export function isNFeConfigured() {
  return !!(NFE_CONFIG.endpoint && NFE_CONFIG.token);
}

/**
 * Emite uma NF-e para um pedido.
 * @param {object} order    - Objeto completo do pedido (orders row)
 * @param {Array}  items    - Array de itens do pedido (order_items rows)
 * @returns {{ success: boolean, data?: object, error?: string, stub?: boolean }}
 */
export async function emitirNFe(order, items) {
  if (!isNFeConfigured()) {
    return {
      success : false,
      stub    : true,
      error   : 'API fiscal não configurada. Defina VITE_NFE_API_URL e VITE_NFE_API_TOKEN no .env.',
    };
  }

  const payload = buildNFePayload(order, items);

  try {
    const response = await fetch(`${NFE_CONFIG.endpoint}/nfe`, {
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${NFE_CONFIG.token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data?.message || `HTTP ${response.status}`, data };
    }

    // TODO: Adaptar os campos abaixo ao schema de resposta do seu emissor
    return {
      success      : true,
      nfe_ref      : data.ref         || data.id         || null,
      numero_nota  : data.numero_nota || data.numero     || null,
      chave_acesso : data.chave       || data.chave_acesso || null,
      danfe_url    : data.danfe_url   || data.url_danfe  || null,
      xml_url      : data.xml_url     || data.url_xml    || null,
    };

  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Monta o payload da NF-e.
 * TODO: Adaptar ao schema do seu emissor fiscal.
 * @param {object} order
 * @param {Array}  items
 */
function buildNFePayload(order, items) {
  return {
    // ── Configuração ────────────────────────────────────────────
    ambiente: NFE_CONFIG.ambiente,

    // ── Destinatário ────────────────────────────────────────────
    destinatario: {
      nome     : order.customer_name,
      cpf_cnpj : order.customer_document,
      email    : order.customer_email,
      endereco : {
        logradouro  : order.address_street,
        numero      : order.address_number,
        complemento : order.address_complement || '',
        bairro      : order.address_neighborhood,
        municipio   : order.address_city,
        uf          : order.address_state,
        cep         : (order.address_zip || '').replace(/\D/g, ''),
        pais        : 'Brasil',
      },
    },

    // ── Itens da Nota ───────────────────────────────────────────
    // TODO: Adicionar NCM, CFOP, CST etc. conforme exigido pelo seu emissor
    itens: items.map((item, idx) => ({
      numero           : idx + 1,
      descricao        : item.product_name,
      quantidade       : item.quantity,
      valor_unitario   : item.price_at_purchase,
      valor_total      : item.quantity * item.price_at_purchase,
    })),

    // ── Totais ─────────────────────────────────────────────────
    total: {
      produtos     : order.total_items_price,
      frete        : order.shipping_price,
      nota_fiscal  : order.total_amount,
    },

    // ── Método de Pagamento ────────────────────────────────────
    pagamento: {
      forma : order.payment_method === 'pix' ? '17' : '01', // 17=PIX, 01=Dinheiro/Cartão
      valor : order.total_amount,
    },
  };
}
