import { Flame, ShieldCheck, Check, Clock, Factory, Phone, Mail, MapPin } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function PrintableCatalog({ previewMode = false }) {
  const { brand, projects, standards, catalogConfig } = usePortfolio();

  const activeProjects = (projects || []).filter(p => p.isActive !== false);

  return (
    <div className={previewMode ? "p-4 sm:p-8 bg-white text-black font-sans" : "printable-catalog-document text-black bg-white font-sans"}>
      
      {/* ══════════════════════════════════════════════════════════════════════
          PÁGINA 1: CAPA EDITORIAL DE ALTO LUXO
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="page-break-after p-12 min-h-[1020px] flex flex-col justify-between text-center relative border-4 border-double border-amber-600/90 rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFDF9] m-2">
        
        {/* Topo da Capa */}
        <div className="space-y-4 pt-4">
          <div className="inline-block border border-amber-500/80 text-amber-900 text-[10px] font-bold uppercase tracking-[0.35em] px-6 py-2 rounded-full bg-amber-50/80">
            INDÚSTRIA BRASILEIRA &bull; POLO INDUSTRIAL IBIPORÃ / PR
          </div>

          <div className="pt-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white mb-4 shadow-md">
              <Flame className="w-8 h-8 fill-white" />
            </div>
            <h1 className="font-serif text-5xl font-black text-[#5C1917] tracking-[0.25em] uppercase">
              {brand.name}
            </h1>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-800 font-semibold mt-2">
              {brand.tagline}
            </p>
          </div>
        </div>

        {/* Centro da Capa */}
        <div className="py-12 space-y-6 max-w-xl mx-auto">
          <div className="inline-block px-5 py-1.5 rounded-full bg-[#5C1917] text-white text-[10px] font-bold uppercase tracking-[0.25em]">
            {catalogConfig?.editionBadge || 'EDIÇÃO INDUSTRIAL 2026/2027 • POLO IBIPORÃ / PR'}
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#5C1917] leading-tight">
            {catalogConfig?.coverTitle || 'CATÁLOGO TÉCNICO & LOOKBOOK INDUSTRIAL'}
          </h2>

          <div className="w-24 h-0.5 bg-amber-500 mx-auto" />

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-serif italic max-w-lg mx-auto">
            "{catalogConfig?.coverSubtitle || 'Linha Completa de Velas Votivas, Palito, Cônicas, Réchaud e Aromáticas para Igrejas, Atacado e Lojistas'}"
          </p>
        </div>

        {/* Rodapé da Capa com Selos de Pureza */}
        <div className="border-t-2 border-amber-500/50 pt-8 space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase font-bold tracking-wider text-amber-950">
            <div className="p-2.5 border border-amber-300 rounded-xl bg-amber-50/70">
              100% Parafina Pura
            </div>
            <div className="p-2.5 border border-amber-300 rounded-xl bg-amber-50/70">
              Pavio Algodão Laser
            </div>
            <div className="p-2.5 border border-amber-300 rounded-xl bg-amber-50/70">
              0% Fuligem Preta
            </div>
            <div className="p-2.5 border border-amber-300 rounded-xl bg-amber-50/70">
              Celofane Antichamas
            </div>
          </div>

          <p className="text-[11px] text-gray-500 tracking-wider">
            {brand.headquarters} &bull; Diretoria Comercial: {brand.phoneFormatted || brand.phone}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PÁGINA 2: MANIFESTO & PADRÕES TÉCNICOS LABORATORIAIS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="page-break-after p-10 min-h-[1020px] flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="border-b-2 border-amber-600 pb-4 flex items-center justify-between">
            <div>
              <span className="font-serif font-bold text-2xl text-[#5C1917] uppercase tracking-wider">{brand.name}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Catálogo Oficial de Engenharia</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
              Página 02 &bull; Critérios Técnicos
            </span>
          </div>

          {/* Manifesto de Qualidade */}
          <div className="p-6 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-2">
            <h3 className="font-serif text-xl font-bold text-[#5C1917]">
              {catalogConfig?.manifestoTitle || 'A Pureza da Luz aliada ao Rigor Industrial'}
            </h3>
            <p className="text-xs text-gray-800 leading-relaxed text-justify">
              {catalogConfig?.manifestoText || brand.manifestoText}
            </p>
          </div>

          {/* Tabela de Padrões Técnicos da Fábrica */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#5C1917] border-b border-amber-200 pb-2">
              Parâmetros Laboratoriais de Qualidade Aplicados em Cada Lote
            </h4>

            <div className="space-y-2.5">
              {(standards || []).map((std, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="sm:w-1/3">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Parâmetro 0{idx + 1}</span>
                    <strong className="text-[#5C1917] font-serif text-sm">{std.param}</strong>
                  </div>
                  <div className="sm:w-1/3">
                    <span className="inline-block px-2.5 py-1 rounded bg-amber-100 font-bold text-amber-950 text-[11px]">
                      {std.standard}
                    </span>
                  </div>
                  <div className="sm:w-1/3 text-gray-600 text-[11px] leading-relaxed">
                    {std.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 text-center text-[10px] text-gray-500">
          Documentação Técnica Oficial de Fábrica &bull; {brand.name} Ibiporã/PR
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PÁGINAS 3+: FICHAS TÉCNICAS DAS VELAS (ACERVO EM ALTO PADRÃO)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="page-break-after p-10 min-h-[1020px] space-y-6">
        <div className="border-b-2 border-amber-600 pb-4 flex items-center justify-between">
          <div>
            <span className="font-serif font-bold text-2xl text-[#5C1917] uppercase tracking-wider">{brand.name}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Acervo Fabril &bull; Obras em Produção</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
            Página 03 &bull; Velas Ativas
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {activeProjects.map((p, idx) => (
            <div 
              key={p.id || idx} 
              className="avoid-break border border-amber-300/80 rounded-2xl p-4 bg-white shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-3 mb-3">
                  <div className="w-24 h-24 bg-gradient-to-b from-[#FFFDF7] to-[#FFF6E5] border border-amber-200 rounded-xl flex items-center justify-center p-2 shrink-0">
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                        {p.badge || 'Linha Nobre'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 font-bold">{p.ref}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#5C1917] mt-1 leading-snug">
                      {p.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 italic">{p.collectionLabel}</p>
                  </div>
                </div>

                {/* Detalhes Técnicos */}
                <div className="space-y-1 bg-[#FFFDF7] p-2.5 rounded-lg border border-amber-100 text-[10px]">
                  <div className="flex justify-between py-0.5 border-b border-amber-100/60">
                    <span className="text-gray-500">Duração de Queima:</span>
                    <strong className="text-[#5C1917]">{p.duration}</strong>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-amber-100/60">
                    <span className="text-gray-500">Dimensões / Peso:</span>
                    <strong className="text-gray-800">{p.dimensions}</strong>
                  </div>
                  {p.packaging && (
                    <div className="flex justify-between py-0.5 border-b border-amber-100/60">
                      <span className="text-gray-500">Embalagem:</span>
                      <strong className="text-amber-900 font-bold">{p.packaging}</strong>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5 border-b border-amber-100/60">
                    <span className="text-gray-500">Matéria-Prima:</span>
                    <strong className="text-gray-800">{p.material}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-gray-500">Mercado-Alvo:</span>
                    <span className="text-orange-800 font-semibold text-right max-w-[60%] truncate">{p.target}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between text-[9px] text-gray-500">
                <span>Cores sob Encomenda: Branca, Amarela, Azul, Vermelha, Bicolor</span>
                <span className="font-bold text-[#5C1917]">100% Pura</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PÁGINA FINAL: POLÍTICAS DE ATACADO & CONTATOS COMERCIAIS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-10 min-h-[1020px] flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div className="border-b-2 border-amber-600 pb-4 flex items-center justify-between">
            <div>
              <span className="font-serif font-bold text-2xl text-[#5C1917] uppercase tracking-wider">{brand.name}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Diretoria Comercial & Logística</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
              Página Final &bull; Atacado
            </span>
          </div>

          {/* Condições Gerais de Atacado */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#5C1917]">
              Condições Comerciais & Faturamento de Fábrica
            </h3>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-1">
              <strong>💡 Nota sobre Tabela e Precificação:</strong>
              <p className="text-gray-800 leading-relaxed">
                {catalogConfig?.pricingNote || 'Tabela de preços regressiva por volume. Faturamento direto de fábrica por caixas e fardos fechados.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 border border-gray-300 rounded-xl bg-gray-50 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-orange-700 block">1. Pedido Mínimo</span>
                <p className="text-gray-700 leading-relaxed">
                  {catalogConfig?.termsMinOrder || 'Faturamento em caixas fechadas por item.'}
                </p>
              </div>

              <div className="p-4 border border-gray-300 rounded-xl bg-gray-50 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-orange-700 block">2. Faturamento</span>
                <p className="text-gray-700 leading-relaxed">
                  {catalogConfig?.termsPayment || 'Boleto bancário, Pix com desconto e Cartão corporativo.'}
                </p>
              </div>

              <div className="p-4 border border-gray-300 rounded-xl bg-gray-50 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-orange-700 block">3. Logística Nacional</span>
                <p className="text-gray-700 leading-relaxed">
                  {catalogConfig?.termsShipping || 'Expedição com seguro para todo o Brasil.'}
                </p>
              </div>
            </div>
          </div>

          {/* Contatos Oficiais */}
          {/* Canais de Atendimento da Indústria & Dados Legais */}
          <div className="p-6 bg-[#5C1917] text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
              <h4 className="font-serif text-lg font-bold text-amber-300">
                Diretoria Comercial & Expedição Industrial
              </h4>
              <span className="text-[10px] font-mono text-amber-200/90 font-bold bg-white/10 px-2.5 py-1 rounded-md">
                CNPJ: {brand.cnpj || '35.123.456/0001-78'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-amber-200/70 block uppercase text-[10px] font-bold">WhatsApp de Faturamento:</span>
                <strong className="text-white text-sm block mt-0.5">{brand.phoneFormatted || brand.phone}</strong>
              </div>
              <div>
                <span className="text-amber-200/70 block uppercase text-[10px] font-bold">E-mail Comercial:</span>
                <strong className="text-white text-sm block mt-0.5">{brand.email}</strong>
              </div>
              <div>
                <span className="text-amber-200/70 block uppercase text-[10px] font-bold">Polo Fabril:</span>
                <strong className="text-white text-sm block mt-0.5">{brand.headquarters}</strong>
              </div>
            </div>
          </div>

          {/* Chancela de Autenticidade B2B de Fábrica */}
          <div className="p-4 rounded-xl border border-dashed border-amber-400 bg-amber-50/50 flex items-center justify-between gap-4 text-[11px] text-amber-950">
            <div className="space-y-0.5">
              <strong className="font-serif text-xs text-[#5C1917] block">CHANCELA DE FORNECIMENTO DIRETO DE INDÚSTRIA</strong>
              <p className="text-gray-700">Documento técnico e comercial para faturamento corporativo, atacado e ordens paroquiais.</p>
            </div>
            <div className="shrink-0 text-right font-mono text-[10px] text-gray-500">
              <span>{brand.corporateReason || 'Krystal Velas Indústria de Velas Ltda'}</span>
              <span className="block text-emerald-800 font-bold">EMISSÃO OFICIAL 2026/2027</span>
            </div>
          </div>
        </div>

        {/* Rodapé Final com NexusThink */}
        <div className="pt-4 border-t-2 border-amber-600 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-2">
          <div>
            <p className="text-[10px] text-gray-500">
              {catalogConfig?.footerNote || 'Todos os direitos reservados à Krystal Velas Indústria.'}
            </p>
          </div>
          <div className="text-right text-[11px]">
            <span>Desenvolvido por <strong>NexusThink</strong> &bull; Catálogo via krystalvelas.com.br</span>
          </div>
        </div>
      </div>

    </div>
  );
}
