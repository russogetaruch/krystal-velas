import { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_BRAND_DATA, 
  INITIAL_COLLECTIONS,
  INITIAL_PROJECTS, 
  INITIAL_TESTIMONIALS, 
  INITIAL_FAQS,
  INITIAL_QUALITY_STANDARDS,
  INITIAL_CATALOG_CONFIG,
  INITIAL_LOOKBOOK_SCENARIOS,
  INITIAL_SIMULATOR_ITEMS
} from '../data/initialData';

// Hash SHA-256 padrão de 'krystal2026'
export const DEFAULT_PWD_HASH = '589858216df39f9a959dc8517f6ec919dd0b817a3c6721202b753f1198df4ad7';

export async function hashPasswordSHA256(password) {
  const enc = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_KEY = 'krystal_portfolio_cms_v3';

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  // Brand / Configurações da Empresa
  const [brand, setBrand] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_brand`);
      return saved ? JSON.parse(saved) : INITIAL_BRAND_DATA;
    } catch {
      return INITIAL_BRAND_DATA;
    }
  });

  // Coleções / Categorias Dinâmicas
  const [collections, setCollections] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_collections`);
      return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
    } catch {
      return INITIAL_COLLECTIONS;
    }
  });

  // Obras / Velas do Portfólio (com suporte a isActive)
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(p => ({ isActive: true, ...p }));
      }
      return INITIAL_PROJECTS.map(p => ({ isActive: true, ...p }));
    } catch {
      return INITIAL_PROJECTS.map(p => ({ isActive: true, ...p }));
    }
  });

  // Padrões de Qualidade
  const [standards, setStandards] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_standards`);
      return saved ? JSON.parse(saved) : INITIAL_QUALITY_STANDARDS;
    } catch {
      return INITIAL_QUALITY_STANDARDS;
    }
  });

  // Depoimentos
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_testimonials`);
      return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
    } catch {
      return INITIAL_TESTIMONIALS;
    }
  });

  // Perguntas Frequentes
  const [faqs, setFaqs] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_faqs`);
      return saved ? JSON.parse(saved) : INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  });

  // Configurações do Catálogo Técnico PDF
  const [catalogConfig, setCatalogConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_catalog`);
      return saved ? JSON.parse(saved) : INITIAL_CATALOG_CONFIG;
    } catch {
      return INITIAL_CATALOG_CONFIG;
    }
  });

  // Ambientes de Aplicação (Lookbook Real)
  const [lookbookScenarios, setLookbookScenarios] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_lookbook`);
      return saved ? JSON.parse(saved) : INITIAL_LOOKBOOK_SCENARIOS;
    } catch {
      return INITIAL_LOOKBOOK_SCENARIOS;
    }
  });

  // Itens do Simulador de Atacado
  const [simulatorItems, setSimulatorItems] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_simulator`);
      return saved ? JSON.parse(saved) : INITIAL_SIMULATOR_ITEMS;
    } catch {
      return INITIAL_SIMULATOR_ITEMS;
    }
  });

  // Hash Criptográfico da Senha do Administrador (Nunca salva em texto plano)
  const [adminPasswordHash, setAdminPasswordHash] = useState(() => {
    try {
      const savedHash = localStorage.getItem(`${STORAGE_KEY}_admin_pwd_hash`);
      if (savedHash) return savedHash;
      localStorage.removeItem(`${STORAGE_KEY}_admin_pwd`);
      return DEFAULT_PWD_HASH;
    } catch {
      return DEFAULT_PWD_HASH;
    }
  });

  const changeAdminPassword = async (newPassword) => {
    const newHash = await hashPasswordSHA256(newPassword);
    setAdminPasswordHash(newHash);
    try {
      localStorage.setItem(`${STORAGE_KEY}_admin_pwd_hash`, newHash);
      localStorage.removeItem(`${STORAGE_KEY}_admin_pwd`);
    } catch {}
    return true;
  };

  const verifyPassword = async (passwordInput) => {
    const inputHash = await hashPasswordSHA256(passwordInput);
    return inputHash === adminPasswordHash;
  };

  // Função auxiliar para data local YYYY-MM-DD
  const getTodayDateKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Analytics com Histórico Diário (Permite filtro por Dia, Quinzena e Mês)
  const [analyticsHistory, setAnalyticsHistory] = useState(() => {
    const today = getTodayDateKey();
    try {
      const savedHistory = localStorage.getItem(`${STORAGE_KEY}_analytics_history`);
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
      // Migração de formato legado se existir
      const legacy = localStorage.getItem(`${STORAGE_KEY}_analytics`);
      const legacyParsed = legacy ? JSON.parse(legacy) : { whatsappClicks: 0, quoteSimulator: 0, catalogDownloads: 0, pageViews: 0 };
      return {
        [today]: {
          pageViews: legacyParsed.pageViews || 0,
          whatsappClicks: legacyParsed.whatsappClicks || 0,
          quoteSimulator: legacyParsed.quoteSimulator || 0,
          catalogDownloads: legacyParsed.catalogDownloads || 0
        }
      };
    } catch {
      return {
        [today]: { whatsappClicks: 0, quoteSimulator: 0, catalogDownloads: 0, pageViews: 0 }
      };
    }
  });

  // Rastrear eventos de conversão no dia atual
  const trackEvent = (eventName) => {
    const today = getTodayDateKey();
    setAnalyticsHistory(prev => {
      const todayStats = prev[today] || { pageViews: 0, whatsappClicks: 0, quoteSimulator: 0, catalogDownloads: 0 };
      const updated = {
        ...prev,
        [today]: {
          ...todayStats,
          [eventName]: (todayStats[eventName] || 0) + 1
        }
      };
      try {
        localStorage.setItem(`${STORAGE_KEY}_analytics_history`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Contabilizar Visualização / Acesso Real no Site Público
  const trackPageView = () => {
    if (typeof window !== 'undefined') {
      // Ignora se estiver na rota ou tela de administração (Admin não conta visualização pública)
      if (window.location.hash.includes('admin') || window.location.pathname.includes('admin')) {
        return;
      }

      // Previne duplicação instantânea causada pelo React StrictMode em modo de desenvolvimento
      const now = Date.now();
      if (window.__krystal_last_pv && (now - window.__krystal_last_pv < 2500)) {
        return;
      }
      window.__krystal_last_pv = now;
    }

    trackEvent('pageViews');
  };

  // Obter métricas consolidadas por período: 'hoje', 'quinzenal', 'mensal', 'total'
  const getFilteredAnalytics = (period = 'total') => {
    const now = new Date();
    const todayKey = getTodayDateKey();
    const result = {
      pageViews: 0,
      whatsappClicks: 0,
      quoteSimulator: 0,
      catalogDownloads: 0
    };

    Object.entries(analyticsHistory || {}).forEach(([dateStr, stats]) => {
      if (!stats) return;
      const entryDate = new Date(`${dateStr}T00:00:00`);
      const diffMs = now.getTime() - entryDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      let include = false;
      if (period === 'hoje') {
        include = (dateStr === todayKey);
      } else if (period === 'quinzenal') {
        include = (diffDays >= 0 && diffDays <= 15);
      } else if (period === 'mensal') {
        include = (diffDays >= 0 && diffDays <= 30);
      } else {
        // 'total'
        include = true;
      }

      if (include) {
        result.pageViews += (stats.pageViews || 0);
        result.whatsappClicks += (stats.whatsappClicks || 0);
        result.quoteSimulator += (stats.quoteSimulator || 0);
        result.catalogDownloads += (stats.catalogDownloads || 0);
      }
    });

    return result;
  };

  // Limpar / Zerar Contagem (por período ou total geral)
  const resetAnalytics = (period = 'total') => {
    const todayKey = getTodayDateKey();
    const now = new Date();

    setAnalyticsHistory(prev => {
      let updated = { ...prev };

      if (period === 'total') {
        updated = {
          [todayKey]: { pageViews: 0, whatsappClicks: 0, quoteSimulator: 0, catalogDownloads: 0 }
        };
      } else if (period === 'hoje') {
        updated[todayKey] = { pageViews: 0, whatsappClicks: 0, quoteSimulator: 0, catalogDownloads: 0 };
      } else {
        const maxDays = period === 'quinzenal' ? 15 : 30;
        Object.keys(updated).forEach(dateStr => {
          const entryDate = new Date(`${dateStr}T00:00:00`);
          const diffDays = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays >= 0 && diffDays <= maxDays) {
            updated[dateStr] = { pageViews: 0, whatsappClicks: 0, quoteSimulator: 0, catalogDownloads: 0 };
          }
        });
      }

      try {
        localStorage.setItem(`${STORAGE_KEY}_analytics_history`, JSON.stringify(updated));
        localStorage.removeItem(`${STORAGE_KEY}_analytics`);
        sessionStorage.clear();
      } catch {}
      return updated;
    });
  };

  // Analytics padrão acumulado para retrocompatibilidade
  const analytics = getFilteredAnalytics('total');

  // Sincronização localStorage
  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_brand`, JSON.stringify(brand)); } catch {}
  }, [brand]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_collections`, JSON.stringify(collections)); } catch {}
  }, [collections]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects)); } catch {}
  }, [projects]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_standards`, JSON.stringify(standards)); } catch {}
  }, [standards]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_testimonials`, JSON.stringify(testimonials)); } catch {}
  }, [testimonials]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_faqs`, JSON.stringify(faqs)); } catch {}
  }, [faqs]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_catalog`, JSON.stringify(catalogConfig)); } catch {}
  }, [catalogConfig]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_lookbook`, JSON.stringify(lookbookScenarios)); } catch {}
  }, [lookbookScenarios]);

  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_simulator`, JSON.stringify(simulatorItems)); } catch {}
  }, [simulatorItems]);

  // Ações de Brand
  const updateBrand = (newData) => {
    setBrand(prev => ({ ...prev, ...newData }));
  };

  // Ações de Categorias / Coleções
  const addCollection = (name) => {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');
    setCollections(prev => [...prev, { id: slug, name }]);
  };

  const deleteCollection = (id) => {
    if (id === 'todos') return;
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  // Ações de Projetos / Produtos
  const addProject = (newProject) => {
    const id = newProject.id || `kv-${Date.now()}`;
    setProjects(prev => [ { isActive: true, ...newProject, id }, ...prev ]);
  };

  const updateProject = (id, updatedFields) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const toggleProjectActive = (id) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const moveProjectUp = (id) => {
    setProjects(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index <= 0) return prev;
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveProjectDown = (id) => {
    setProjects(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Ações de Padrões Técnicos
  const updateStandard = (id, fields) => {
    setStandards(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  // Ações de Depoimentos
  const addTestimonial = (item) => {
    const id = Date.now();
    setTestimonials(prev => [ ...prev, { ...item, id } ]);
  };

  const updateTestimonial = (id, fields) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t));
  };

  const deleteTestimonial = (id) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  // Ações de FAQ
  const addFaq = (item) => {
    const id = Date.now();
    setFaqs(prev => [ ...prev, { ...item, id } ]);
  };

  const updateFaq = (id, fields) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...fields } : f));
  };

  const deleteFaq = (id) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  // Ações do Catálogo PDF
  const updateCatalogConfig = (newData) => {
    setCatalogConfig(prev => ({ ...prev, ...newData }));
  };

  // Ações do Lookbook
  const updateLookbookScenario = (id, fields) => {
    setLookbookScenarios(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
  };

  // Ações do Simulador
  const addSimulatorItem = (item) => {
    const id = `sim-${Date.now()}`;
    setSimulatorItems(prev => [...prev, { id, defaultQty: 0, weightKgPerUnit: 1.0, ...item }]);
  };

  const updateSimulatorItem = (id, fields) => {
    setSimulatorItems(prev => prev.map(item => item.id === id ? { ...item, ...fields } : item));
  };

  const deleteSimulatorItem = (id) => {
    setSimulatorItems(prev => prev.filter(item => item.id !== id));
  };

  // Reset Geral
  const resetToDefaults = () => {
    setBrand(INITIAL_BRAND_DATA);
    setCollections(INITIAL_COLLECTIONS);
    setProjects(INITIAL_PROJECTS.map(p => ({ isActive: true, ...p })));
    setStandards(INITIAL_QUALITY_STANDARDS);
    setTestimonials(INITIAL_TESTIMONIALS);
    setFaqs(INITIAL_FAQS);
    setCatalogConfig(INITIAL_CATALOG_CONFIG);
    setLookbookScenarios(INITIAL_LOOKBOOK_SCENARIOS);
    setSimulatorItems(INITIAL_SIMULATOR_ITEMS);
    setAdminPasswordHash(DEFAULT_PWD_HASH);
    setAnalyticsHistory({
      [getTodayDateKey()]: { pageViews: 1, whatsappClicks: 0, quoteSimulator: 0, catalogDownloads: 0 }
    });
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY)) localStorage.removeItem(key);
    });
  };

  // Exportar / Importar
  const exportAllDataJSON = () => {
    const fullData = { 
      brand, 
      collections, 
      projects, 
      standards, 
      testimonials, 
      faqs, 
      catalogConfig,
      lookbookScenarios,
      simulatorItems
    };
    return JSON.stringify(fullData, null, 2);
  };

  const importAllDataJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.brand) setBrand(parsed.brand);
      if (parsed.collections) setCollections(parsed.collections);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.standards) setStandards(parsed.standards);
      if (parsed.testimonials) setTestimonials(parsed.testimonials);
      if (parsed.faqs) setFaqs(parsed.faqs);
      if (parsed.catalogConfig) setCatalogConfig(parsed.catalogConfig);
      if (parsed.lookbookScenarios) setLookbookScenarios(parsed.lookbookScenarios);
      if (parsed.simulatorItems) setSimulatorItems(parsed.simulatorItems);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        brand,
        collections,
        projects,
        standards,
        testimonials,
        faqs,
        catalogConfig,
        lookbookScenarios,
        simulatorItems,
        adminPasswordHash,
        verifyPassword,
        changeAdminPassword,
        analytics,
        analyticsHistory,
        getFilteredAnalytics,
        resetAnalytics,
        trackEvent,
        trackPageView,
        updateBrand,
        addCollection,
        deleteCollection,
        addProject,
        updateProject,
        toggleProjectActive,
        moveProjectUp,
        moveProjectDown,
        deleteProject,
        updateStandard,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        addFaq,
        updateFaq,
        deleteFaq,
        updateCatalogConfig,
        updateLookbookScenario,
        addSimulatorItem,
        updateSimulatorItem,
        deleteSimulatorItem,
        changeAdminPassword,
        resetToDefaults,
        exportAllDataJSON,
        importAllDataJSON
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio deve ser usado dentro de PortfolioProvider');
  }
  return context;
}
