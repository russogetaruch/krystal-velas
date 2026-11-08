export const INITIAL_BRAND_DATA = {
  name: 'Krystal Velas',
  tagline: 'Fábrica de Velas Nobres em Ibiporã / PR',
  edition: 'Portfólio & Catálogo Oficial • 2026',
  headquarters: 'Ibiporã, Paraná — Brasil',
  phone: '5543998073376',
  phoneFormatted: '(43) 99807-3376',
  email: 'comercial@krystalvelas.com.br',
  cnpj: '35.123.456/0001-78',
  corporateReason: 'Krystal Velas Indústria de Velas Ltda',
  heroTitle: 'A pureza da luz, a excelência da manufatura.',
  heroSubtitle: 'Portfólio oficial de velas com 100% de parafina pura. Sem fuligem preta, queima completa e acabamento brilhante para atacado, igrejas, eventos e decoração.',
  stats: [
    { label: 'Matéria-Prima', val: '100% Pura', note: 'Parafina filtrada de 1º refino' },
    { label: 'Capacidade Fabril', val: 'Alta Escala', note: 'Atendimento direto de fábrica' },
    { label: 'Qualidade de Queima', val: '0% Fuligem', note: 'Chama límpida e uniforme' },
    { label: 'Polo Produtor', val: 'Ibiporã / PR', note: 'Expedição para todo o Brasil' },
  ],
  manifestoText: 'A Krystal Velas desenvolve velas com brancura cristalina, ponto de fusão milimétrico e durabilidade comprovada. Criamos soluções térmicas e estéticas para paróquias, santuários, buffets de alta gastronomia, decoradores e redes de atacado.',
};

export const INITIAL_CATALOG_CONFIG = {
  coverTitle: 'CATÁLOGO TÉCNICO & LOOKBOOK INDUSTRIAL',
  coverSubtitle: 'Linha Completa de Velas Votivas, Palito, Cônicas, Réchaud e Aromáticas para Igrejas, Atacado e Lojistas',
  editionBadge: 'EDIÇÃO INDUSTRIAL 2026/2027 • POLO IBIPORÃ / PR',
  manifestoTitle: 'A Pureza da Luz aliada ao Rigor Industrial',
  manifestoText: 'Fundada no polo fabril de Ibiporã/PR, a Krystal Velas atende o mercado nacional com matérias-primas de altíssima nobreza. Nossas velas utilizam exclusivamente 100% parafina pura de primeiro refino, pavio de algodão centrado a laser e embalagem celofane antichamas técnica com base selada, garantindo combustão serena, 0% fuligem preta e estabilidade térmica calibrada.',
  showPricingNote: true,
  pricingNote: 'Tabela de preços regressiva por volume. Faturamento direto da fábrica para paróquias, distribuidoras e lojistas em caixas e fardos fechados. Valores e frete FOB/CIF calculados sob medida pela nossa diretoria comercial.',
  termsMinOrder: 'Pedido mínimo: Faturamento em caixas fechadas por item ou pedido misto pré-aprovado.',
  termsPayment: 'Faturamento via Boleto Bancário (mediante análise cadastral), Pix à vista com desconto industrial e Cartão Corporativo.',
  termsShipping: 'Expedição rápida com seguro de transporte para todo o Brasil via frotas parceiras e transportadoras conveniadas.',
  footerNote: 'Todos os direitos reservados à Krystal Velas Indústria de Velas. Documento técnico destinado a parceiros comerciais, distribuidores e lojistas.',
};

export const INITIAL_COLLECTIONS = [
  { id: 'todos', name: 'Todas as Obras' },
  { id: 'votivas', name: 'Linha Fé & Votivas' },
  { id: 'aromaticas', name: 'Aromáticas & Casa' },
  { id: 'hospitalidade', name: 'Eventos & Buffets' },
];

export const AVAILABLE_PRODUCT_IMAGES = [
  '/produtos/vela1.png',
  '/produtos/vela2.png',
  '/produtos/vela3.png',
  '/produtos/vela4.png',
  '/produtos/vela5.png',
  '/produtos/vela6.png',
  '/produtos/vela7.png',
  '/produtos/vela8.png',
  '/produtos/vela9.png',
  '/produtos/vela10.png',
  '/produtos/vela11.png',
  '/produtos/vela12.png',
  '/produtos/vela13.png',
  '/produtos/vela14.png',
  '/produtos/vela15.png',
  '/produtos/vela16.png',
];

export const INITIAL_PROJECTS = [
  {
    id: 'kv-01',
    ref: 'REF. 01 / VOT',
    title: 'Vela Votiva 7 Dias Tradicional',
    collection: 'votivas',
    collectionLabel: 'Linha Fé & Votivas',
    image: '/produtos/vela1.png',
    fallback: '/votive-candles.png',
    badge: 'Mais Vendida',
    badgeColor: 'bg-amber-500 text-white',
    subtitle: 'Vela votiva com invólucro antichamas de alta segurança',
    duration: '168h contínuas',
    material: '100% Parafina Pura Filtrada',
    dimensions: '15,0 cm x 5,5 cm • 280g',
    target: 'Paróquias, Templos, Santuários e Lojas Religiosas',
    description: 'Nossa obra mais emblemática. Desenvolvida com celofane técnico retardante de chamas. A formulação garante queima total e homogênea até a base, sem pingar e sem manchar paredes com fuligem negra.',
    specs: [
      'Pavio duplo de puro algodão calibrado a laser',
      'Cápsula selada que retém a cera líquida com segurança',
      'Fardos industriais de 12 e 24 unidades',
    ]
  },
  {
    id: 'kv-02',
    ref: 'REF. 02 / LIT',
    title: 'Velas Palito Clássicas Nº 8 (Pct 8 un)',
    collection: 'votivas',
    collectionLabel: 'Linha Fé & Votivas',
    image: '/produtos/vela2.png',
    badge: 'Atacado & Varejo',
    badgeColor: 'bg-orange-600 text-white',
    subtitle: 'Velas padronizadas para rituais e celebrações',
    duration: '3h30 por unidade',
    material: 'Parafina Pura Alveolada',
    dimensions: '15,0 cm x 1,5 cm • 28g/un',
    target: 'Igrejas, Cerimoniais, Distribuidores e Comunidades',
    description: 'Padronização dimensional perfeita para encaixe firme em castiçais e candelabros tradicionais. Brancura radiante e acabamento polido de alto padrão.',
    specs: [
      'Chama ereta e estável sem tremulações excessivas',
      'Não escorre sob correntes de ar moderadas',
      'Embalagem reforçada que impede quebras no transporte',
    ]
  },
  {
    id: 'kv-03',
    ref: 'REF. 03 / ARO',
    title: 'Vela Aromática Lavanda Francesa',
    collection: 'aromaticas',
    collectionLabel: 'Aromáticas & Casa',
    image: '/produtos/vela3.png',
    badge: 'Linha Premium',
    badgeColor: 'bg-purple-600 text-white',
    subtitle: 'Frasco de vidro refinado com blend de cera vegetal',
    duration: '~36h de projeção',
    material: 'Cera Vegetal de Soja & Óleo de Lavanda',
    dimensions: '8,5 cm x 8,0 cm • 190g',
    target: 'Boutiques de Decoração, Spas, Hotéis e Bem-Estar',
    description: 'Concentração rica de essência floral calmante. A cera de soja vegetal funde em temperatura amena, formando uma piscina líquida dourada que projeta o aroma de forma suave e constante.',
    specs: [
      'Pote de vidro pesado decorativo e reutilizável',
      'Pavio 100% algodão sem aditivos sintéticos',
      'Projeção olfativa com alcance de até 35m²',
    ]
  },
  {
    id: 'kv-04',
    ref: 'REF. 04 / GOUR',
    title: 'Vela Vanilla Gold & Fava de Baunilha',
    collection: 'aromaticas',
    collectionLabel: 'Aromáticas & Casa',
    image: '/produtos/vela4.png',
    badge: 'Sensorial',
    badgeColor: 'bg-amber-600 text-white',
    subtitle: 'Fragrância quente e aconchegante para ambientes',
    duration: '~40h de queima',
    material: 'Blend Botânico Nobre',
    dimensions: '9,0 cm x 8,5 cm • 210g',
    target: 'Residências, Lojas Conceito e Recepções',
    description: 'Notas doces e ricas de baunilha madura equilibradas com toques amadeirados. Ideal para recepções acolhedoras e jantares intimistas.',
    specs: [
      'Pavio duplo para dispersão aromática acelerada',
      'Ponto de fusão suave e textura aveludada',
      'Livre de parabenos e ftalatos',
    ]
  },
  {
    id: 'kv-05',
    ref: 'REF. 05 / EVE',
    title: 'Velas Cônicas de Banquete para Castiçal',
    collection: 'hospitalidade',
    collectionLabel: 'Eventos & Buffets',
    image: '/produtos/vela5.png',
    badge: 'Exclusiva Buffet',
    badgeColor: 'bg-rose-700 text-white',
    subtitle: 'Linha especial para casamentos e mesas de banquete',
    duration: '7h contínuas',
    material: 'Parafina Cristal Nobre',
    dimensions: '24,0 cm x 2,2 cm • 70g/par',
    target: 'Buffets, Decoradores de Casamento e Clubes',
    description: 'Projetada para queimar sem gotejamento indesejado nas toalhas de linho dos convidados. Chama ampla, limpa e imponente que valoriza a cenografia e a fotografia do evento.',
    specs: [
      'Base universal compatível com candelabros de 20 a 24mm',
      'Chama brilhante e vertical',
      'Fornecimento em caixas de 20 e 50 pares',
    ]
  },
  {
    id: 'kv-06',
    ref: 'REF. 06 / LIT',
    title: 'Vela Votiva 7 Dias Policromática',
    collection: 'votivas',
    collectionLabel: 'Linha Fé & Votivas',
    image: '/produtos/vela6.png',
    badge: 'Devocional',
    badgeColor: 'bg-blue-600 text-white',
    subtitle: 'Velas coloridas com pigmentos minerais puros',
    duration: '168h contínuas',
    material: 'Parafina Pura + Pigmentos Minerais',
    dimensions: '15,0 cm x 5,5 cm • 280g',
    target: 'Artigos Religiosos, Tradições Devocionais e Rituais',
    description: 'Coloração na massa que não desbota com a passagem do tempo e não altera a combustão. Disponível nas cores azul, amarela, vermelha, verde, rosa, branca e bicolor.',
    specs: [
      'Sem odores químicos residuais',
      'Pigmento mineral 100% atóxico',
      'Invólucro térmico antichamas certificado',
    ]
  },
  {
    id: 'kv-07',
    ref: 'REF. 07 / ARO',
    title: 'Vela Âmbar Canela & Especiarias',
    collection: 'aromaticas',
    collectionLabel: 'Aromáticas & Casa',
    image: '/produtos/vela7.png',
    badge: 'Rústico Chic',
    badgeColor: 'bg-amber-800 text-white',
    subtitle: 'Frasco farmacêutico retrô com aroma estimulante',
    duration: '~32h de queima',
    material: 'Cera de Coco e Soja',
    dimensions: '8,0 cm x 7,5 cm • 180g',
    target: 'Lojas de Decoração, Cafés e Presentes Especiais',
    description: 'Fragrância intensa e estimulante de canela com toques de cravo e noz-moscada. O pote âmbar valoriza a decoração e protege os óleos da luz.',
    specs: [
      'Tampa metálica preta hermética',
      'Combustão uniforme sem túneis de cera',
      'Visual vintage marcante',
    ]
  },
  {
    id: 'kv-08',
    ref: 'REF. 08 / EVE',
    title: 'Kit Velas Flutuantes Hidrodinâmicas (24 un)',
    collection: 'hospitalidade',
    collectionLabel: 'Eventos & Buffets',
    image: '/produtos/vela8.png',
    badge: 'Cenografia',
    badgeColor: 'bg-teal-600 text-white',
    subtitle: 'Velas especiais para taças, fontes e piscinas',
    duration: '4h30 por unidade',
    material: 'Cera Náutica de Baixa Densidade',
    dimensions: '5,0 cm x 3,0 cm • 35g/un',
    target: 'Decoradores de Casamento e Produtores de Eventos',
    description: 'Calibragem de centro de massa que mantém a vela equilibrada e flutuando perfeitamente sobre a água, sem tombar ou afundar sob pequenas ondulações.',
    specs: [
      'Flutuação estável em vasos cilíndricos e piscinas',
      'Pavio resistente a respingos superficiais',
      'Caixa institucional para atacado de eventos',
    ]
  },
  {
    id: 'kv-09',
    ref: 'REF. 09 / EVE',
    title: 'Velas Réchaud com Copinho de Alumínio (50 un)',
    collection: 'hospitalidade',
    collectionLabel: 'Eventos & Buffets',
    image: '/produtos/vela9.png',
    badge: 'Institucional',
    badgeColor: 'bg-slate-700 text-white',
    subtitle: 'Caixa de alta demanda para buffets e difusores',
    duration: '4h contínuas',
    material: 'Parafina Pura Filtrada',
    dimensions: '3,8 cm x 1,5 cm • 14g/un',
    target: 'Restaurantes, Buffets e Spas',
    description: 'Projetadas para aquecer réchauds de pratos quentes e abastecer aromatizadores cerâmicos com segurança e controle de chama.',
    specs: [
      'Copinho de alumínio com borda protegida',
      'Queima 100% da cera sem desperdício',
      'Embalagem compacta e de fácil empilhamento',
    ]
  },
  {
    id: 'kv-10',
    ref: 'REF. 10 / DEC',
    title: 'Vela Cilíndrica Texturizada Marfim',
    collection: 'aromaticas',
    collectionLabel: 'Aromáticas & Casa',
    image: '/produtos/vela10.png',
    badge: 'Arquitetura',
    badgeColor: 'bg-stone-600 text-white',
    subtitle: 'Bloco sólido em coluna para decoração de interiores',
    duration: '+45h de queima',
    material: 'Parafina Microcristalina Pura',
    dimensions: '12,0 cm x 7,0 cm • 420g',
    target: 'Arquitetos, Lojas de Móveis e Centros de Mesa',
    description: 'Imponência visual com textura acetinada agradável ao toque. Proporciona iluminação difusa aconchegante para mesas de jantar e lareiras.',
    specs: [
      'Pavio calibrado para queima central gradual',
      'Não deforma sob temperaturas ambientes normais',
      'Tom marfim neutro que combina com qualquer paleta',
    ]
  },
  {
    id: 'kv-11',
    ref: 'REF. 11 / ARO',
    title: 'Vela Aromática Alecrim & Eucalipto Botânico',
    collection: 'aromaticas',
    collectionLabel: 'Aromáticas & Casa',
    image: '/produtos/vela11.png',
    badge: 'Aromaterapia',
    badgeColor: 'bg-emerald-600 text-white',
    subtitle: 'Vidro fosco branco com essência herbal revigorante',
    duration: '~35h de projeção',
    material: 'Cera 100% Vegetal',
    dimensions: '8,5 cm x 8,0 cm • 190g',
    target: 'Espaços Corporativos, Clínicas e Consultórios',
    description: 'Sensação imediata de renovação e frescor botânico. Ideal para escritórios e espaços de concentração.',
    specs: [
      'Vidro branco acetinado minimalista',
      'Livre de parabenos e componentes animais',
      'Pavio trançado de puro algodão',
    ]
  },
  {
    id: 'kv-12',
    ref: 'REF. 12 / LIT',
    title: 'Vela Votiva Especial Estampada Litúrgica',
    collection: 'votivas',
    collectionLabel: 'Linha Fé & Votivas',
    image: '/produtos/vela12.png',
    badge: 'Santuários',
    badgeColor: 'bg-indigo-700 text-white',
    subtitle: 'Rótulo térmico resinado com oração e arte sacra',
    duration: '168h contínuas',
    material: '100% Parafina Pura',
    dimensions: '15,0 cm x 5,5 cm • 280g',
    target: 'Catedrais, Santuários Nacionais e Festas de Padroeiros',
    description: 'Estampa devocional de alta resolução resistente ao calor da queima. Permite personalização com a arte da paróquia para grandes lotes.',
    specs: [
      'Personalização de rótulo disponível para atacado',
      'Queima limpa de 7 dias completos',
      'Oração clássica impressa no verso',
    ]
  },
];

export const INITIAL_QUALITY_STANDARDS = [
  {
    id: 1,
    param: 'Composição de Parafina',
    standard: '100% Parafina Pura de Primeiro Refino',
    detail: 'Sem misturas com gorduras de sebo ou solventes secundários. Brancura cristalina e odor neutro.',
  },
  {
    id: 2,
    param: 'Tecnologia do Pavio',
    standard: 'Algodão 100% Trançado & Centrado a Laser',
    detail: 'Calibração exata entre vazão de oxigênio e consumo da cera, evitando desmoronamentos.',
  },
  {
    id: 3,
    param: 'Emissão de Resíduos',
    standard: 'Combustão Completa com 0% Fuligem',
    detail: 'Não mancha tetos de igrejas, afrescos ou toalhas de linho em eventos sociais.',
  },
  {
    id: 4,
    param: 'Estabilidade Térmica',
    standard: 'Ponto de Fusão Calibrado (56°C a 60°C)',
    detail: 'Alta resistência estrutural em estoque e transporte sob temperaturas brasileiras.',
  },
  {
    id: 5,
    param: 'Segurança em Uso',
    standard: 'Celofane Antichamas Técnico',
    detail: 'Contenção líquida total na Linha Votiva com base selada para máxima proteção contra vazamentos.',
  },
];

export const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    quote: 'A Krystal Velas fornece as velas votivas e litúrgicas para nossa comunidade com exatidão no prazo de entrega. A queima é verdadeiramente límpida e cumpre com rigor os 7 dias anunciados.',
    author: 'Pe. Marcos Aurélio',
    role: 'Paróquia São Vicente',
    city: 'Londrina / PR',
    rating: 5
  },
  {
    id: 2,
    quote: 'Em eventos de alto padrão, não podemos correr risco de cera escorrendo sobre as toalhas finas de banquete. As velas de castiçal da Krystal entregam a chama perfeita durante toda a festa.',
    author: 'Camila Fontana',
    role: 'Cerimonialista & Designer de Eventos',
    city: 'Curitiba / PR',
    rating: 5
  },
  {
    id: 3,
    quote: 'A margem de revenda para lojistas e a aceitação dos clientes finais é excelente. O atendimento direto da fábrica em Ibiporã torna a reposição de estoque muito ágil e confiável.',
    author: 'Eduardo Silveira',
    role: 'Distribuidora de Artigos Religiosos',
    city: 'Maringá / PR',
    rating: 5
  },
];

export const INITIAL_FAQS = [
  {
    id: 1,
    q: 'Como funciona a venda para revendedores e compras no atacado?',
    a: 'Atendemos diretamente lojistas, distribuidores, paróquias e organizadores de eventos com tabelas escalonadas de atacado por caixa fechada ou fardo. As cotações são feitas de forma direta e sem burocracia através do nosso WhatsApp comercial.'
  },
  {
    id: 2,
    q: 'Qual é o prazo médio de produção e despacho da fábrica em Ibiporã?',
    a: 'Mantemos estoque permanente das principais linhas (Votivas 7 Dias, Palito e Réchaud). Pedidos de pronta-entrega são despachados em até 24 a 48 horas úteis após confirmação. Lotes sob medida ou personalizações têm prazo acordado diretamente com a gerência.'
  },
  {
    id: 3,
    q: 'Vocês realizam envios para outros estados fora do Paraná?',
    a: 'Sim, despachamos para todas as regiões do Brasil através de transportadoras conveniadas (com frete compartilhado e seguro de carga) ou despachos expressos para volumes menores com embalagens reforçadas.'
  },
  {
    id: 4,
    q: 'É possível encomendar velas votivas personalizadas para festas de padroeiros?',
    a: 'Sim! Possuímos linha técnica de personalização gráfica dos rótulos térmicos para santuários, dioceses e eventos comemorativos. Consulte as quantidades mínimas com nossa equipe.'
  },
];

export const INITIAL_LOOKBOOK_SCENARIOS = [
  {
    id: 'sc-1',
    title: 'Liturgia & Santuários',
    category: 'Fé e Celebrações',
    desc: 'Chama serena e duradoura para momentos de oração, altares e capelas, preservando a pureza do ambiente sagrado sem fuligem.',
    iconName: 'Flame',
  },
  {
    id: 'sc-2',
    title: 'Casamentos & Alta Decoração',
    category: 'Eventos & Buffets',
    desc: 'Velas cônicas e flutuantes projetadas para iluminar banquetes sem pingar na toalha e com chama vertical fotogênica.',
    iconName: 'Sparkles',
  },
  {
    id: 'sc-3',
    title: 'Aromaterapia & Bem-Estar',
    category: 'Residências & Spas',
    desc: 'Fragrâncias nobres desenvolvidas com ceras vegetais para transformar salas, quartos e consultórios em refúgios de paz.',
    iconName: 'Sun',
  },
];

export const INITIAL_SIMULATOR_ITEMS = [
  { id: 'sim-1', name: 'Vela 7 Dias Tradicional (Fardos com 12 un)', defaultQty: 2, weightKgPerUnit: 3.4 },
  { id: 'sim-2', name: 'Velas Palito Nº 8 (Caixas com 50 pct)', defaultQty: 1, weightKgPerUnit: 12.0 },
  { id: 'sim-3', name: 'Velas Cônicas para Castiçal (Caixas com 20 pares)', defaultQty: 0, weightKgPerUnit: 4.5 },
  { id: 'sim-4', name: 'Velas Réchaud com Alumínio (Caixas com 50 un)', defaultQty: 0, weightKgPerUnit: 1.2 },
  { id: 'sim-5', name: 'Velas Aromáticas em Vidro (Caixas com 12 un)', defaultQty: 0, weightKgPerUnit: 4.8 },
];
