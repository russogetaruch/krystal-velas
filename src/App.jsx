import { useState, useMemo, useEffect, Component, lazy, Suspense } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import PrintableCatalog from './components/PrintableCatalog';

// ── Isolamento de Segurança: O código do AdminPanel NÃO é baixado por visitantes do site
const AdminPanel = lazy(() => import('./admin/AdminPanel'));
import { 
  Flame, 
  Sparkles, 
  ArrowUpRight, 
  MapPin, 
  Check, 
  X, 
  Eye, 
  MessageCircle, 
  Clock, 
  Factory, 
  Download, 
  Mail, 
  Phone,
  ShieldCheck,
  Sun,
  Star,
  Plus,
  Minus,
  ChevronDown,
  Lock,
  Printer,
  FileText,
  Palette,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Package,
  Truck,
  Building2,
  Award,
  Zap,
  Share2,
  Copy
} from 'lucide-react';

// Critérios Técnicos de Qualidade da Fábrica
const QUALITY_STANDARDS = [
  {
    param: 'Composição de Parafina',
    standard: '100% Parafina Pura de Primeiro Refino',
    detail: 'Sem misturas com gorduras de sebo ou solventes secundários. Brancura cristalina e odor neutro.',
  },
  {
    param: 'Tecnologia do Pavio',
    standard: 'Algodão 100% Trançado & Centrado a Laser',
    detail: 'Calibração exata entre vazão de oxigênio e consumo da cera, evitando desmoronamentos.',
  },
  {
    param: 'Emissão de Resíduos',
    standard: 'Combustão Completa com 0% Fuligem',
    detail: 'Não mancha tetos de igrejas, afrescos ou toalhas de linho em eventos sociais.',
  },
  {
    param: 'Estabilidade Térmica',
    standard: 'Ponto de Fusão Calibrado (56°C a 60°C)',
    detail: 'Alta resistência estrutural em estoque e transporte sob temperaturas brasileiras.',
  },
  {
    param: 'Segurança em Uso',
    standard: 'Celofane Antichamas Técnico',
    detail: 'Contenção líquida total na Linha Votiva com base selada para máxima proteção contra vazamentos.',
  },
];

// Paleta de Cores Disponíveis para Produção sob Encomenda
const CANDLE_COLORS = [
  { id: 'branca', name: 'Branca (Padrão)', dotClass: 'bg-white border border-gray-300' },
  { id: 'amarela', name: 'Amarela', dotClass: 'bg-amber-400 border border-amber-500' },
  { id: 'azul', name: 'Azul Celeste', dotClass: 'bg-sky-400 border border-sky-500' },
  { id: 'vermelha', name: 'Vermelha', dotClass: 'bg-red-600 border border-red-700' },
  { id: 'verde', name: 'Verde Esmeralda', dotClass: 'bg-emerald-600 border border-emerald-700' },
  { id: 'rosa', name: 'Rosa Magnólia', dotClass: 'bg-pink-400 border border-pink-500' },
  { id: 'roxa', name: 'Roxa / Lilás', dotClass: 'bg-purple-600 border border-purple-700' },
  { id: 'preta', name: 'Preta', dotClass: 'bg-zinc-900 border border-zinc-950' },
  { id: 'bicolor', name: 'Bicolor (Vermelha/Preta)', dotClass: 'bg-gradient-to-r from-red-600 to-zinc-900 border border-red-800' },
  { id: '7cores', name: 'Sete Cores (7 Linhas)', dotClass: 'bg-gradient-to-r from-red-500 via-amber-400 via-emerald-500 to-sky-500 border border-amber-400' },
];

// Rotas de Logística a partir de Ibiporã/PR
const LOGISTICS_ROUTES = [
  { region: 'Paraná & Região Metropolitana', time: '24 horas', desc: 'Despacho prioritário para Curitiba, Londrina, Maringá e cidades polos.' },
  { region: 'São Paulo & Região Sul (SC / RS)', time: '24h a 48h', desc: 'Linhas diárias de carretas conveniadas e entrega rápida em centros de distribuição.' },
  { region: 'Centro-Oeste & Sudeste (MG / RJ / ES / GO / DF)', time: '48h a 72h', desc: 'Frotas parceiras com seguro total de carga para fardos e caixas fechadas.' },
  { region: 'Norte & Nordeste', time: 'Sob consulta', desc: 'Embarques com proteção térmica e embalagens reforçadas para longas distâncias.' },
];

// Componente Principal do Site Público
function PortfolioSite({ onOpenAdmin }) {
  const { 
    brand, 
    collections, 
    projects, 
    standards, 
    testimonials, 
    faqs, 
    lookbookScenarios,
    simulatorItems,
    trackEvent,
    trackPageView 
  } = usePortfolio();

  // Contabiliza acesso real no carregamento do site público
  useEffect(() => {
    trackPageView();
  }, []);

  const [activeCollection, setActiveCollection] = useState('todos');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogSort, setCatalogSort] = useState('padrao');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedColor, setSelectedColor] = useState('Branca (Padrão)');
  const [openFaq, setOpenFaq] = useState(0);

  // Estado das quantidades do Simulador de Atacado
  const [quoteItems, setQuoteItems] = useState({});

  useEffect(() => {
    if (Array.isArray(simulatorItems) && simulatorItems.length > 0) {
      setQuoteItems(prev => {
        const next = { ...prev };
        simulatorItems.forEach(item => {
          if (next[item.name] === undefined) {
            next[item.name] = item.defaultQty || 0;
          }
        });
        return next;
      });
    }
  }, [simulatorItems]);

  const updateQuantity = (itemName, delta) => {
    setQuoteItems(prev => ({
      ...prev,
      [itemName]: Math.max(0, (prev[itemName] || 0) + delta)
    }));
  };

  const totalEstimateUnits = useMemo(() => {
    return Object.values(quoteItems).reduce((acc, curr) => acc + curr, 0);
  }, [quoteItems]);

  const totalEstimateWeightKg = useMemo(() => {
    return (simulatorItems || []).reduce((acc, item) => {
      const qty = quoteItems[item.name] || 0;
      return acc + (qty * (item.weightKgPerUnit || 1.0));
    }, 0);
  }, [simulatorItems, quoteItems]);

  // Lista dinâmica de categorias mesclando opção "Todas" com as cadastradas no admin
  const collectionsList = useMemo(() => {
    const list = [{ id: 'todos', name: 'Todas as Obras' }];
    if (Array.isArray(collections)) {
      collections.forEach(c => {
        if (!list.some(item => item.id === c.id)) {
          list.push(c);
        }
      });
    }
    return list;
  }, [collections]);

  // Filtra apenas projetos ativos (não pausados)
  const activeProjects = useMemo(() => {
    return projects.filter(p => p.isActive !== false);
  }, [projects]);

  // Filtro de Categoria, Busca em tempo real e Ordenação
  const filteredProjects = useMemo(() => {
    let list = activeProjects;
    
    // Filtro por coleção
    if (activeCollection !== 'todos') {
      list = list.filter(p => p.collection === activeCollection);
    }

    // Busca textual em tempo real
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.ref && p.ref.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.packaging && p.packaging.toLowerCase().includes(q))
      );
    }

    // Ordenação
    if (catalogSort === 'duracao') {
      list = [...list].sort((a, b) => {
        const getH = (str) => {
          const match = (str || '').match(/(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        return getH(b.duration) - getH(a.duration);
      });
    } else if (catalogSort === 'nome') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (catalogSort === 'ref') {
      list = [...list].sort((a, b) => a.ref.localeCompare(b.ref));
    }

    return list;
  }, [activeCollection, catalogSearch, catalogSort, activeProjects]);

  const getWhatsAppContact = (customMessage) => {
    const text = customMessage || `Olá! Vim pelo Portfólio Oficial da Krystal Velas e gostaria de receber a Tabela de Preços e Catálogo da Fábrica em Ibiporã/PR.`;
    return `https://wa.me/${brand.phone}?text=${encodeURIComponent(text)}`;
  };

  const generateQuoteWhatsApp = () => {
    const selected = (simulatorItems || []).filter(item => (quoteItems[item.name] || 0) > 0);
    if (selected.length === 0) {
      return getWhatsAppContact('Olá! Gostaria de falar com o time comercial da Krystal Velas sobre atacado.');
    }
    let msg = `Olá! Montei uma pré-cotação de atacado no Portfólio da Krystal Velas:\n\n`;
    selected.forEach(item => {
      const qty = quoteItems[item.name] || 0;
      const weight = (qty * (item.weightKgPerUnit || 1.0)).toFixed(1);
      msg += `• *${item.name}*: ${qty} volume(s) (~${weight} kg)\n`;
    });
    msg += `\n📦 *Total estimado da carga*: ${totalEstimateUnits} volumes (~${totalEstimateWeightKg.toFixed(1)} kg)\n`;
    msg += `Poderiam me enviar os valores atualizados e a estimativa de frete para a minha cidade?`;
    return `https://wa.me/${brand.phone}?text=${encodeURIComponent(msg)}`;
  };

  const handlePrintCatalog = () => {
    trackEvent('catalogDownloads');
    window.print();
  };

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleShareCandle = (project) => {
    const url = `${window.location.origin}${window.location.pathname}#vela-${project.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast(`Link de "${project.title}" copiado para envio!`);
      }).catch(() => {
        showToast(`Link copiado: ${url}`);
      });
    } else {
      showToast(`Link: ${url}`);
    }
  };

  // Suporte a abertura direta de vela via link #vela-{id}
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#vela-')) {
        const cId = hash.replace('#vela-', '');
        const found = projects.find(p => p.id === cId);
        if (found) {
          setSelectedProject(found);
          setSelectedColor('Branca (Padrão)');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [projects]);

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setSelectedColor('Branca (Padrão)');
    window.history.replaceState(null, '', `${window.location.pathname}#vela-${project.id}`);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    if (window.location.hash.startsWith('#vela-')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#2D1407] font-sans selection:bg-amber-400/40 selection:text-[#2D1407]">
      
      {/* Toast Flutuante de Compartilhamento / Confirmação */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#5C1917] text-white px-5 py-3 rounded-full shadow-2xl border border-amber-400 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* ── Topbar Luminosa & Dourada ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl sm:text-2xl tracking-wider text-[#5C1917] block leading-none">
                {brand.name}
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-amber-700 font-semibold block mt-1">
                Portfólio &bull; {brand.headquarters}
              </span>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden xl:flex items-center gap-6 text-xs font-semibold text-amber-900/80 tracking-wider">
              <a href="#catalogo" className="hover:text-orange-600 transition-colors">Acervo</a>
              <a href="#fabrica" className="hover:text-orange-600 transition-colors">Nossa Fábrica</a>
              <a href="#padrao-tecnico" className="hover:text-orange-600 transition-colors">Padrão Técnico</a>
              <a href="#logistica" className="hover:text-orange-600 transition-colors">Logística</a>
              <a href="#simulador" className="hover:text-orange-600 transition-colors">Simulador</a>
              <a href="#depoimentos" className="hover:text-orange-600 transition-colors">Parcerias</a>
              <a href="#faq" className="hover:text-orange-600 transition-colors">Dúvidas</a>
            </div>

            {/* Botão Baixar Catálogo PDF */}
            <button
              onClick={handlePrintCatalog}
              className="hidden sm:inline-flex items-center gap-2 bg-[#FFF9EE] hover:bg-amber-100/80 text-amber-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full border border-amber-300 shadow-xs transition-all cursor-pointer"
              title="Exportar catálogo oficial em PDF ou Imprimir"
            >
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              <span>Catálogo PDF</span>
            </button>

            <a
              href={getWhatsAppContact()}
              onClick={() => trackEvent('whatsappClicks')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-widest px-5 sm:px-6 py-3 rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Pedir Orçamento</span>
            </a>
          </div>

        </div>
      </header>

      {/* ── Hero Chamativo & Iluminado ────────────────────────────────────── */}
      <section className="relative pt-16 sm:pt-20 pb-20 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#FFF9EE] via-[#FFFDF7] to-white border-b border-amber-200/50 no-print">
        
        {/* Luz de Fundo Quente & Convidativa */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-amber-400/20 via-orange-300/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-amber-300/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Pill Chamativo */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300/70 text-amber-900 text-xs uppercase tracking-[0.25em] font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>{brand.tagline}</span>
            </div>

            {/* Título Principal */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#5C1917] tracking-tight leading-[1.12]">
              {brand.heroTitle || (
                <>A pureza da luz, a excelência da <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">manufatura.</span></>
              )}
            </h1>

            {/* Subtítulo Descritivo */}
            <p className="text-base sm:text-xl text-[#2D1407]/80 font-normal leading-relaxed max-w-2xl mx-auto">
              {brand.heroSubtitle || brand.manifestoText}
            </p>

            {/* Botões Chamativos */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#catalogo"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#5C1917] hover:bg-[#431210] text-white font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full shadow-xl shadow-[#5C1917]/20 hover:scale-105 transition-all duration-300"
              >
                <span>Ver Portfólio ({activeProjects.length} Obras)</span>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </a>

              <button
                onClick={handlePrintCatalog}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FFFBF2] hover:bg-amber-100 text-[#5C1917] border border-amber-300 font-bold text-xs uppercase tracking-[0.2em] px-7 py-4 rounded-full shadow-sm hover:scale-105 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-orange-600" />
                <span>Baixar Catálogo PDF</span>
              </button>

              <a
                href="#simulador"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full shadow-lg shadow-orange-500/20 hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simular Atacado</span>
              </a>
            </div>

          </div>

          {/* Cards de Métricas em Destaque Solar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-16 pt-12 border-t border-amber-200/60">
            {brand.stats.map((s, idx) => (
              <div 
                key={idx} 
                className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-amber-200/70 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <Flame className="w-4 h-4" />
                  <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800">
                    {s.label}
                  </span>
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#5C1917] mb-1">
                  {s.val}
                </div>
                <div className="text-xs text-[#2D1407]/70 font-medium">
                  {s.note}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Ambientes de Aplicação (Lookbook Real Dinâmico) ────────────────── */}
      <section className="py-16 sm:py-20 bg-white border-b border-amber-200/60 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-orange-600 font-bold block mb-2">
              Lookbook &bull; A Chama em Ação
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#5C1917]">
              Presença e Elegância em Cada Ambiente
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {(lookbookScenarios || []).map((sc, i) => {
              const Icon = sc.iconName === 'Flame' ? Flame : sc.iconName === 'Sparkles' ? Sparkles : Sun;
              return (
                <div
                  key={sc.id || i}
                  className="bg-gradient-to-b from-[#FFFDF7] to-[#FFF8EA] p-8 rounded-3xl border border-amber-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mb-6 shadow-md shadow-orange-500/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-orange-600 block mb-1">
                      {sc.category}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#5C1917] mb-3">
                      {sc.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2D1407]/75 font-normal leading-relaxed">
                      {sc.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Seção Institucional: Nossa Fábrica em Ibiporã ──────────────────── */}
      <section id="fabrica" className="py-20 sm:py-24 bg-gradient-to-b from-[#FFF9EE] via-[#FFFDF7] to-white border-b border-amber-200/60 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Lado Esquerdo: História e Compromisso */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs uppercase font-bold tracking-widest">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>Polo Fabril &bull; Ibiporã / Paraná</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#5C1917] leading-tight">
                Engenharia de precisão na manufatura de velas industriais.
              </h2>

              <p className="text-[#2D1407]/80 text-base leading-relaxed">
                Localizada estrategicamente no norte do Paraná, a <strong>Krystal Velas</strong> opera com maquinário de alta capacidade produtiva para fornecer grandes lotes padronizados para atacado, distribuidores de artigos religiosos, buffets e redes varejistas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                    <Factory className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#5C1917]">Alta Escala</h4>
                  <p className="text-xs text-gray-600">Produção contínua para atendimento de fardos e pallets fechados.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#5C1917]">100% Pura</h4>
                  <p className="text-xs text-gray-600">Parafina de primeiro refino sem sebo ou misturas impuras.</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#5C1917]">Pronta Entrega</h4>
                  <p className="text-xs text-gray-600">Estoque permanente das linhas Votiva 7 Dias, Palito e Réchaud.</p>
                </div>
              </div>
            </div>

            {/* Lado Direito: Card em Destaque Visual */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#5C1917] to-[#802220] text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
                  <Flame className="w-6 h-6 fill-amber-300" />
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
                  Parceria sólida direto com a indústria.
                </h3>

                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  Eliminamos intermediários e garantimos pontualidade na reposição de estoque do seu negócio com suporte direto da nossa diretoria comercial.
                </p>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-amber-200">
                  <span>Ibiporã / PR &bull; Atendimento Nacional</span>
                  <a 
                    href={getWhatsAppContact()}
                    onClick={() => trackEvent('whatsappClicks')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white hover:text-amber-300 transition-colors flex items-center gap-1"
                  >
                    Falar com a Fábrica &rarr;
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Acervo / Obras do Portfólio (Com Busca & Ordenação) ─────────────── */}
      <section id="catalogo" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-amber-200/70">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-orange-600 font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Coleções Oficiais em Produção</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#5C1917]">
              Portfólio de Velas Krystal
            </h2>
          </div>

          {/* Filtros em Abas Elegantes */}
          <div className="flex flex-wrap items-center gap-2">
            {collectionsList.map((c) => {
              const active = activeCollection === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCollection(c.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#5C1917] to-[#802220] text-white shadow-md shadow-[#5C1917]/20 scale-105'
                      : 'bg-white text-amber-900/80 hover:bg-amber-100/60 border border-amber-200'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de Busca em Tempo Real e Ordenação */}
        <div className="mb-10 bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Input de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-700/60 absolute left-4 top-3.5" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Buscar vela pelo nome, referência (ex: REF. 01), 7 dias, palito, cônica..."
              className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-xs sm:text-sm text-[#2D1407] placeholder:text-gray-400 focus:outline-none focus:border-orange-500"
            />
            {catalogSearch && (
              <button
                onClick={() => setCatalogSearch('')}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-black cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Seletor de Ordenação */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-800 shrink-0" />
            <span className="text-xs font-bold text-amber-900 shrink-0 hidden sm:inline">Ordenar por:</span>
            <select
              value={catalogSort}
              onChange={(e) => setCatalogSort(e.target.value)}
              className="bg-[#FFFBF2] border border-amber-200 text-xs font-semibold text-[#5C1917] py-2 px-3 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="padrao">Destaques da Fábrica</option>
              <option value="duracao">Maior Duração de Queima</option>
              <option value="nome">Nome (A - Z)</option>
              <option value="ref">Código de Referência</option>
            </select>
          </div>

        </div>

        {/* Resultado Vazio */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-amber-200 p-8 space-y-3">
            <Package className="w-10 h-10 text-amber-600/50 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#5C1917]">Nenhuma vela encontrada para sua busca</h3>
            <p className="text-xs text-gray-500">Tente buscar por termos mais genéricos como "votiva", "palito", "cônica" ou "rechaud".</p>
            <button
              onClick={() => { setCatalogSearch(''); setActiveCollection('todos'); }}
              className="mt-2 text-xs font-bold uppercase text-orange-600 hover:underline cursor-pointer"
            >
              Limpar Filtros e Ver Todas as Obras
            </button>
          </div>
        )}

        {/* Grade de Cards Luminosos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => openProjectDetails(project)}
              className="group bg-white rounded-3xl border border-amber-200/80 hover:border-amber-400 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1.5"
            >
              <div>
                {/* Imagem do Produto em Fundo Claro e Limpo */}
                <div className="relative aspect-[4/3] bg-gradient-to-b from-[#FFFBF2] to-[#FFF4DE] p-6 sm:p-8 flex items-center justify-center overflow-hidden border-b border-amber-100">
                  
                  {/* Badge de Categoria */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-xs ${project.badgeColor || 'bg-amber-500 text-white'}`}>
                      {project.badge}
                    </span>
                  </div>

                  {/* Duração */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/90 backdrop-blur-md text-[#5C1917] px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3 text-orange-600" />
                      {project.duration}
                    </span>
                  </div>

                  <img
                    src={project.image}
                    alt={project.title}
                    className="max-h-full max-w-full object-contain drop-shadow-lg transform group-hover:scale-108 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = project.fallback || '/produtos/vela1.png';
                    }}
                  />

                  {/* Overlay de Hover com Ação Rápida */}
                  <div className="absolute inset-0 bg-[#5C1917]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-white text-center">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-amber-300">
                        <Eye className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-300 block">
                        Ver Especificações Técnicas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6 sm:p-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-orange-600 font-bold">
                      {project.collectionLabel}
                    </span>
                    <span className="text-[10px] font-mono text-amber-800/60 font-semibold">
                      {project.ref}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#5C1917] leading-snug group-hover:text-orange-600 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs text-[#2D1407]/75 font-normal leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {/* Embalagem Coletiva */}
                  {project.packaging && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 w-fit">
                      <Package className="w-3.5 h-3.5 text-orange-600" />
                      <span>{project.packaging}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé & Botões de Ação Imediata do Card */}
              <div className="p-5 sm:p-6 pt-3 border-t border-amber-100/80 mt-2 space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-900/70">
                  <span className="font-medium truncate max-w-[60%]">{project.material}</span>
                  <span className="font-bold text-[#5C1917] shrink-0">{project.duration}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openProjectDetails(project)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#FFF8EB] hover:bg-amber-100/80 text-[#5C1917] font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-600" />
                    <span>Detalhes</span>
                  </button>

                  <a
                    href={getWhatsAppContact(`Olá! Vim pelo catálogo da Krystal Velas e gostaria de cotar a vela *${project.title}* (${project.ref}) direto de fábrica.`)}
                    onClick={(e) => {
                      e.stopPropagation();
                      trackEvent('whatsappClicks');
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                    title="Cotar no WhatsApp da fábrica"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Cotar</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareCandle(project);
                    }}
                    className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-amber-50 rounded-xl border border-amber-200 transition-colors cursor-pointer shrink-0"
                    title="Copiar link desta vela para envio"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── Padrão Técnico de Qualidade Krystal ───────────────────────────── */}
      <section id="padrao-tecnico" className="py-20 sm:py-24 bg-gradient-to-b from-[#FFF7E8] to-[#FFFDF7] border-y border-amber-200/70 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-orange-600 font-bold block mb-2">
              Engenharia & Rigor &bull; {brand.headquarters}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#5C1917] leading-tight mb-4">
              Os Critérios de Qualidade da Fábrica
            </h2>
            <p className="text-[#2D1407]/80 text-base sm:text-lg font-normal leading-relaxed">
              Conheça os parâmetros laboratoriais e fabris que aplicamos em cada lote de produção para assegurar pureza, segurança e durabilidade.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md overflow-hidden">
            <div className="divide-y divide-amber-100">
              {(standards || QUALITY_STANDARDS).map((std, idx) => (
                <div key={idx} className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FFFDF7] transition-colors">
                  <div className="md:w-1/3">
                    <span className="text-xs uppercase font-bold tracking-wider text-amber-800 block mb-1">
                      Parâmetro 0{idx + 1}
                    </span>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-[#5C1917]">
                      {std.param}
                    </h4>
                  </div>
                  <div className="md:w-1/3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-orange-600" />
                      <span>{std.standard}</span>
                    </div>
                  </div>
                  <div className="md:w-1/3 text-xs sm:text-sm text-[#2D1407]/75 font-normal leading-relaxed">
                    {std.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Seção de Logística & Malha de Envio Nacional ───────────────────── */}
      <section id="logistica" className="py-20 bg-white border-b border-amber-200/60 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs uppercase font-bold tracking-widest mb-3">
              <Truck className="w-4 h-4 text-orange-600" />
              <span>Expedição Segura</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#5C1917]">
              Distribuição a partir de Ibiporã / PR para todo o Brasil
            </h2>
            <p className="text-xs sm:text-sm text-[#2D1407]/75 font-normal mt-2">
              Embalagens reforçadas para absorção de impacto térmico e mecânico durante o frete rodoviário interestadual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LOGISTICS_ROUTES.map((route, idx) => (
              <div 
                key={idx} 
                className="bg-[#FFFDF7] p-6 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      Rota 0{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#5C1917] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {route.time}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#5C1917] mb-2">
                    {route.region}
                  </h4>
                  <p className="text-xs text-[#2D1407]/75 leading-relaxed">
                    {route.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Simulador Interativo com Estimador de Carga & Peso (kg) ────────── */}
      <section id="simulador" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-amber-300 shadow-xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Esquerda: Explicação */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs uppercase tracking-widest font-bold">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Simulador de Atacado</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#5C1917] leading-tight">
                Monte sua estimativa de pedido para cotação.
              </h3>

              <p className="text-xs sm:text-sm text-[#2D1407]/80 leading-relaxed font-normal">
                Indique os volumes aproximados que seu estabelecimento necessita. Nosso sistema calcula a carga estimada e envia sua lista completa no WhatsApp para cálculo imediato de frete e tabela regressiva.
              </p>

              <div className="p-4 bg-[#FFF9EE] rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p><strong>💡 Dica para Lojistas:</strong> Faturamos com condições especiais por caixas fechadas direto da fábrica.</p>
              </div>
            </div>

            {/* Direita: Seletores de Quantidade */}
            <div className="lg:col-span-7 bg-[#FFFDF7] p-6 sm:p-8 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
              
              <div className="space-y-3">
                {(simulatorItems || []).map((item) => {
                  const qty = quoteItems[item.name] || 0;
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-amber-100 shadow-2xs gap-3"
                    >
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-[#5C1917] block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Peso unitário: ~{item.weightKgPerUnit || 1.0} kg
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                          title="Diminuir"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-[#5C1917]">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.name, 1)}
                          className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition-colors cursor-pointer"
                          title="Aumentar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão de Envio para WhatsApp com Peso Estimado */}
              <div className="pt-4 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-amber-900 space-y-0.5">
                  <div>Volumes selecionados: <strong className="text-[#5C1917] text-sm">{totalEstimateUnits}</strong></div>
                  <div>Peso total estimado: <strong className="text-orange-700 font-bold">~{totalEstimateWeightKg.toFixed(1)} kg</strong></div>
                </div>

                <a
                  href={generateQuoteWhatsApp()}
                  onClick={() => {
                    trackEvent('quoteSimulator');
                    trackEvent('whatsappClicks');
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full shadow-lg shadow-orange-500/20 hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Gerar Cotação no WhatsApp</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── Parcerias & Confiança (Depoimentos Dinâmicos) ──────────────────── */}
      <section id="depoimentos" className="py-20 bg-white border-y border-amber-200/70 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-orange-600 font-bold block mb-2">
              Confiança Comprovada &bull; Relações de Longo Prazo
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#5C1917]">
              O que dizem os parceiros da Krystal Velas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-[#FFFDF7] p-8 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between relative"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#2D1407]/80 leading-relaxed font-normal italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-amber-200/60">
                  <h4 className="font-serif font-bold text-base text-[#5C1917]">
                    {t.author}
                  </h4>
                  <div className="text-xs text-amber-900 font-medium">
                    {t.role} &bull; <span className="text-[#2D1407]/60">{t.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ Comercial Dinâmico ─────────────────────────────────────────── */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-orange-600 font-bold block mb-2">
            Perguntas Frequentes
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#5C1917]">
            Dúvidas Comerciais & Logística
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-amber-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#5C1917] hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-orange-600 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#2D1407]/80 leading-relaxed border-t border-amber-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Banner de Atacado & Conversão Vibrante ─────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-print">
        <div className="bg-gradient-to-r from-[#5C1917] via-[#731f1c] to-[#5C1917] rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs uppercase tracking-widest font-bold">
              <Factory className="w-4 h-4" />
              <span>Diretoria Comercial &bull; Atacado e Lojistas</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Precisa de fornecimento contínuo para o seu negócio?
            </h3>

            <p className="text-white/85 text-sm sm:text-base font-normal leading-relaxed">
              Atendemos paróquias, santuários, distribuidores de artigos religiosos, buffets para eventos e lojistas com preços diretos da indústria e suporte logístico.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <a
                href={getWhatsAppContact()}
                onClick={() => trackEvent('whatsappClicks')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-[#2D1407] font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full shadow-xl hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 fill-[#2D1407]" />
                <span>Falar no WhatsApp da Fábrica</span>
              </a>

              <a
                href={`mailto:${brand.email}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all"
              >
                <Mail className="w-4 h-4 text-amber-300" />
                <span>{brand.email}</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── Modal da Obra com Variações de Cores & Embalagem ──────────────── */}
      {selectedProject && (
        <div
          onClick={closeProjectDetails}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn no-print"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-[#2D1407] rounded-3xl max-w-4xl w-full border border-amber-300 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
          >
            {/* Lado Esquerdo: Imagem Clara do Produto */}
            <div className="md:w-1/2 bg-gradient-to-b from-[#FFFDF7] to-[#FFF4DE] p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-amber-200 relative">
              <span className={`absolute top-4 left-4 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-xs ${selectedProject.badgeColor || 'bg-amber-500 text-white'}`}>
                {selectedProject.badge}
              </span>

              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="max-h-72 md:max-h-96 max-w-full object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = selectedProject.fallback || '/produtos/vela1.png';
                }}
              />
            </div>

            {/* Lado Direito: Especificações e Contato */}
            <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <span className="text-xs uppercase tracking-wider text-orange-600 font-bold">
                    {selectedProject.collectionLabel} &bull; {selectedProject.ref}
                  </span>
                  <button
                    onClick={closeProjectDetails}
                    className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Fechar ficha técnica"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#5C1917] mt-3 mb-1">
                  {selectedProject.title}
                </h3>
                
                <p className="text-xs text-amber-800 font-semibold mb-3">
                  {selectedProject.subtitle}
                </p>

                <p className="text-xs sm:text-sm text-[#2D1407]/80 leading-relaxed mb-4">
                  {selectedProject.description}
                </p>

                {/* Seletor de Variações de Cores Disponíveis */}
                <div className="mb-4 p-3.5 bg-[#FFF9EE] rounded-2xl border border-amber-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#5C1917] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-orange-600" />
                      <span>Cores sob Encomenda:</span>
                    </span>
                    <span className="text-xs font-semibold text-orange-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                      {selectedColor}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {CANDLE_COLORS.map(col => {
                      const isSelected = selectedColor === col.name;
                      return (
                        <button
                          key={col.id}
                          onClick={() => setSelectedColor(col.name)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#5C1917] text-white shadow-xs scale-105 ring-2 ring-orange-500/50'
                              : 'bg-white hover:bg-amber-100/60 text-[#2D1407] border border-amber-200'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${col.dotClass}`} />
                          <span>{col.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Especificações da Obra */}
                <div className="space-y-2.5 bg-[#FFFBF2] p-4 rounded-2xl border border-amber-200/80 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-amber-900/70 font-medium">Duração de Queima:</span>
                    <strong className="text-[#5C1917] font-bold">{selectedProject.duration}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-amber-900/70 font-medium">Dimensões / Peso:</span>
                    <strong className="text-[#2D1407] font-bold">{selectedProject.dimensions}</strong>
                  </div>
                  {selectedProject.packaging && (
                    <div className="flex justify-between py-1 border-b border-amber-200/50">
                      <span className="text-amber-900/70 font-medium">Embalagem Coletiva:</span>
                      <strong className="text-amber-950 font-bold">{selectedProject.packaging}</strong>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-amber-900/70 font-medium">Matéria-Prima:</span>
                    <strong className="text-[#2D1407] font-bold">{selectedProject.material}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-amber-900/70 font-medium">Mercado-Alvo:</span>
                    <span className="text-orange-700 font-bold text-right max-w-[60%]">{selectedProject.target}</span>
                  </div>
                </div>

                {/* Garantias */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#5C1917] block">
                    Garantias Técnicas de Fábrica:
                  </span>
                  {selectedProject.specs?.map((sp, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#2D1407]/80">
                      <Check className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                      <span>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Cotação & Compartilhamento */}
              <div className="pt-4 border-t border-amber-200 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={getWhatsAppContact(`Olá! Gostaria de cotar a obra *${selectedProject.title}* (${selectedProject.ref}) na cor *${selectedColor}* da Krystal Velas.`)}
                  onClick={() => trackEvent('whatsappClicks')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Cotar {selectedProject.title.split(' ')[0]} ({selectedColor.split(' ')[0]})</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleShareCandle(selectedProject)}
                  className="flex items-center justify-center gap-2 bg-[#FFF8EB] hover:bg-amber-100/80 text-[#5C1917] border border-amber-300 font-bold text-xs uppercase tracking-wider py-4 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                  title="Copiar link de compartilhamento"
                >
                  <Share2 className="w-4 h-4 text-orange-600" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Botão Flutuante de WhatsApp ───────────────────────────────────── */}
      <a
        href={getWhatsAppContact()}
        onClick={() => trackEvent('whatsappClicks')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com o Comercial"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/50 no-print"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline">WhatsApp da Fábrica</span>
      </a>

      {/* ── Rodapé Luminoso com Acesso Administrativo Discreto ────────────── */}
      <footer className="py-12 bg-white border-t border-amber-200/80 text-center text-xs text-[#2D1407]/70 space-y-3 no-print">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <span className="font-serif font-bold text-sm tracking-wider text-[#5C1917] uppercase">
            {brand.name}
          </span>
          <span>&bull;</span>
          <span>{brand.headquarters}</span>
        </div>
        <p className="text-[11px] text-amber-900/60">
          CNPJ: {brand.cnpj || '35.123.456/0001-78'} &bull; {brand.edition} &bull; 100% Parafina Pura &bull; Todos os direitos reservados.
        </p>

        {/* Créditos NexusThink */}
        <p className="text-[11px] text-amber-900/70 flex items-center justify-center gap-1.5 pt-1">
          <span>Desenvolvido por</span>
          <span className="font-bold text-[#5C1917] tracking-wider hover:text-orange-600 transition-colors">
            NexusThink
          </span>
        </p>
      </footer>

    </div>
  );
}

// ── Error Boundary para Prevenção Total de Telas Brancas ──────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary detectou erro:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-6 text-center text-[#2D1407]">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-300 shadow-2xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Flame className="w-7 h-7 fill-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#5C1917]">Krystal Velas</h2>
              <p className="text-xs text-amber-900/70 mt-1">Recuperação de renderização do sistema</p>
            </div>
            <p className="text-xs text-gray-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              O sistema detectou uma atualização em andamento. Clique no botão abaixo para restaurar o estado visual.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full bg-[#5C1917] hover:bg-[#431210] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── App Container com Roteamento Simples (Site ou Admin) ─────────────────────
export default function App() {
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#/admin' || window.location.pathname === '/admin';
  });

  useEffect(() => {
    const handleHash = () => {
      setIsAdminView(window.location.hash === '#/admin' || window.location.pathname === '/admin');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openAdmin = () => {
    window.location.hash = '#/admin';
    setIsAdminView(true);
  };

  const closeAdmin = () => {
    window.location.hash = '';
    setIsAdminView(false);
  };

  return (
    <ErrorBoundary>
      <PortfolioProvider>
        <div id="screen-view">
          {isAdminView ? (
            <Suspense fallback={
              <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
                <div className="w-9 h-9 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <AdminPanel onExit={closeAdmin} />
            </Suspense>
          ) : (
            <PortfolioSite onOpenAdmin={openAdmin} />
          )}
        </div>

        {/* ── Catálogo Técnico Oficial para Impressão e PDF ── */}
        <div id="print-view">
          <PrintableCatalog />
        </div>
      </PortfolioProvider>
    </ErrorBoundary>
  );
}
