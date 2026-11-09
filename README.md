# Krystal Velas — Catálogo Oficial & Gestão Comercial v2.0

Plataforma oficial da **Krystal Velas** (Ibiporã, Paraná - Brasil), especializada na fabricação artesanal e industrial de velas votivas e decorativas em 100% parafina pura.

---

## 💎 Funcionalidades Principais

- **Catálogo Interativo & Luxo:** Apresentação refinada de produtos com fotos em alta resolução, dimensões, tempo de queima e especificações técnicas.
- **Cotação Rápida WhatsApp:** Botão direto em cada produto com mensagem pré-formatada para atendimento comercial ágil.
- **Deep Linking:** Compartilhamento direto de links com âncoras para produtos específicos (`#vela-{id}`).
- **Impressão Editorial em PDF:** Módulo isolado de impressão em folha A4 com chancela B2B, CNPJ e formato catálogo comercial sem vazamento de elementos de interface.
- **Blindagem & Segurança:**
  - Acesso restrito ao painel administrativo via rota direta (`#/admin`), sem links ou botões visíveis publicamente.
  - Criptografia SHA-256 via Web Crypto API nativa do navegador (nenhuma senha trafega em texto puro).
  - Proteção anti-força bruta: bloqueio automático temporário (10 minutos) após 5 tentativas incorretas consecutivas.
  - Code Splitting dinâmico via `React.lazy()`: visitantes comuns nunca baixam os scripts do painel de administração.
  - Encerramento automático de sessão após 30 minutos de inatividade.
  - Cabeçalhos de segurança estritos (CSP, X-Frame-Options, X-Content-Type-Options) configurados na Vercel.
- **Motor de Métricas & Analytics:** Contabilização de visualizações e cliques de cotação com filtros por período (Dia, Quinzena, Mês, Geral) e reset sob demanda.

---

## 🛠️ Stack Tecnológica

- **Frontend:** React 19 + Vite
- **Estilização:** Tailwind CSS + Framer Motion + Lucide Icons
- **Otimização de Imagens:** Browser Image Compression (conversão e redimensionamento em WebP)
- **Hospedagem & Deploy:** Vercel (CI/CD automático via GitHub)

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento local
npm run dev

# Gerar build otimizado para produção
npm run build
```

---

© 2026 Krystal Velas. Todos os direitos reservados.

