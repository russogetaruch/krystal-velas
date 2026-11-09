import { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { AVAILABLE_PRODUCT_IMAGES } from '../data/initialData';
import PrintableCatalog from '../components/PrintableCatalog';
import { 
  Package, 
  Settings, 
  MessageSquare, 
  HelpCircle, 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  LogOut, 
  Lock, 
  Check, 
  AlertCircle, 
  Download, 
  Upload, 
  RotateCcw,
  Flame,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  Type,
  ShieldCheck,
  Image as ImageIcon,
  X,
  Eye,
  EyeOff,
  BarChart2,
  Tags,
  KeyRound,
  FileText,
  UploadCloud,
  Printer,
  Factory,
  ArrowUp,
  ArrowDown,
  Sun,
  Truck,
  Layers,
  SlidersHorizontal,
  Calendar,
  ShieldAlert
} from 'lucide-react';

export default function AdminPanel({ onExit }) {
  const { 
    brand, 
    collections,
    projects, 
    standards,
    testimonials, 
    faqs, 
    catalogConfig,
    lookbookScenarios,
    simulatorItems,
    verifyPassword,
    analytics,
    analyticsHistory,
    getFilteredAnalytics,
    resetAnalytics,
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
  } = usePortfolio();

  // Autenticação local
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('krystal_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Aba ativa
  const [activeTab, setActiveTab] = useState('produtos');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Filtro de Período dos Analytics (hoje, quinzenal, mensal, total)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('hoje');
  const [showResetModal, setShowResetModal] = useState(false);

  // Formulário de Edição de Produto
  const [editingProject, setEditingProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const fileInputRef = useRef(null);

  // Formulário de Nova Coleção
  const [newCollectionName, setNewCollectionName] = useState('');

  // Formulário de Edição de Brand (Hero & Contatos)
  const [brandForm, setBrandForm] = useState(brand);

  // Formulário de Depoimento
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);

  // Formulário de FAQ
  const [editingFaq, setEditingFaq] = useState(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  // Formulário de Padrão Técnico
  const [editingStandard, setEditingStandard] = useState(null);

  // Alterar Senha
  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmPwdInput, setConfirmPwdInput] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  // JSON Import
  const [importJsonText, setImportJsonText] = useState('');

  // Formulário do Catálogo PDF
  const [catalogForm, setCatalogForm] = useState(() => ({
    coverTitle: catalogConfig?.coverTitle || '',
    coverSubtitle: catalogConfig?.coverSubtitle || '',
    editionBadge: catalogConfig?.editionBadge || '',
    manifestoTitle: catalogConfig?.manifestoTitle || '',
    manifestoText: catalogConfig?.manifestoText || '',
    pricingNote: catalogConfig?.pricingNote || '',
    termsMinOrder: catalogConfig?.termsMinOrder || '',
    termsPayment: catalogConfig?.termsPayment || '',
    termsShipping: catalogConfig?.termsShipping || '',
    footerNote: catalogConfig?.footerNote || '',
  }));

  const [showCatalogPreview, setShowCatalogPreview] = useState(false);

  // Estados do Simulador no Admin
  const [newSimName, setNewSimName] = useState('');
  const [newSimQty, setNewSimQty] = useState(1);
  const [newSimWeight, setNewSimWeight] = useState(2.5);

  const showNotification = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // ── SEGURANÇA: CONTROLE ANTI-BRUTE FORCE & RATE LIMITING ─────────────────
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem('krystal_failed_attempts') || '0', 10);
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    return parseInt(localStorage.getItem('krystal_lockout_until') || '0', 10);
  });
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  // Contagem regressiva de bloqueio em tempo real
  useEffect(() => {
    const checkLockout = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutSecondsLeft(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutSecondsLeft(0);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // ── SEGURANÇA: AUTO LOGOUT POR INATIVIDADE (30 MINUTOS) ──────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        alert('Sua sessão de administrador expirou por inatividade (30 min) para proteção de dados.');
      }, 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isAuthenticated]);

  // ── AUTENTICAÇÃO COM HASH SHA-256 E PROTEÇÃO DE TENTATIVAS ───────────────
  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Verifica se está em bloqueio de segurança
    const now = Date.now();
    if (lockoutUntil > now) {
      const minutes = Math.ceil((lockoutUntil - now) / 60000);
      setAuthError(`Acesso bloqueado por segurança. Tente novamente em ${minutes} minuto(s).`);
      return;
    }

    if (!passwordInput.trim()) return;

    // 2. Validação Criptográfica SHA-256
    const isValid = await verifyPassword(passwordInput);

    if (isValid) {
      // Login com sucesso: limpa histórico de falhas
      setFailedAttempts(0);
      setLockoutUntil(0);
      localStorage.removeItem('krystal_failed_attempts');
      localStorage.removeItem('krystal_lockout_until');
      setIsAuthenticated(true);
      sessionStorage.setItem('krystal_admin_auth', 'true');
      setAuthError('');
      setPasswordInput('');
    } else {
      // Senha incorreta: registra tentativa
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('krystal_failed_attempts', newAttempts.toString());

      if (newAttempts >= 5) {
        const lockTime = Date.now() + 10 * 60 * 1000; // 10 minutos de congelamento
        setLockoutUntil(lockTime);
        localStorage.setItem('krystal_lockout_until', lockTime.toString());
        setAuthError('🚨 5 tentativas incorretas. Painel bloqueado por 10 minutos contra ataques.');
      } else {
        const remaining = 5 - newAttempts;
        setAuthError(`Senha incorreta. Mais ${remaining} tentativa(s) antes do bloqueio temporário.`);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('krystal_admin_auth');
  };

  // ── SEGURANÇA NO UPLOAD: COMPRESSÃO CANVAS & LIMITE DE TAMANHO ────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('O arquivo excede o limite de segurança de 3MB. Selecione uma imagem menor.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionamento inteligente no Canvas (max 1200px)
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedWebP = canvas.toDataURL('image/webp', 0.88);

        if (editingProject) {
          setEditingProject(prev => ({ ...prev, image: optimizedWebP }));
          showNotification('Foto otimizada e carregada com segurança!');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ── ALTERAÇÃO DE SENHA COM HASH CRIPTOGRÁFICO SHA-256 ────────────────────
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const isCurrentValid = await verifyPassword(currentPwdInput);
    if (!isCurrentValid) {
      setPwdMsg({ type: 'error', text: 'A senha atual informada está incorreta.' });
      return;
    }
    if (newPwdInput.length < 6) {
      setPwdMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres para garantir segurança.' });
      return;
    }
    if (newPwdInput !== confirmPwdInput) {
      setPwdMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    await changeAdminPassword(newPwdInput);
    setCurrentPwdInput('');
    setNewPwdInput('');
    setConfirmPwdInput('');
    setPwdMsg({ type: 'success', text: 'Senha administrativa criptografada com sucesso (SHA-256)!' });
    showNotification('Senha atualizada e protegida criptograficamente!');
  };

  // ── TELA DE LOGIN BLINDADA COM CONTROLE DE BRUTE FORCE ────────────────────
  if (!isAuthenticated) {
    const isLockedOut = lockoutSecondsLeft > 0;

    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-amber-300 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#5C1917]">
              Painel Krystal Velas
            </h2>
            <p className="text-xs text-[#2D1407]/70">
              Acesso exclusivo para gerência da fábrica.
            </p>
          </div>

          {/* Alerta de Bloqueio por Brute Force */}
          {isLockedOut && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-2xl text-center space-y-1.5 text-red-800 animate-fadeIn">
              <div className="font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 text-red-700">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Bloqueio de Segurança Ativo</span>
              </div>
              <p className="text-xs text-red-600/90 leading-relaxed">
                Muitas tentativas inválidas consecutivas. Aguarde a liberação do sistema:
              </p>
              <div className="font-mono text-xl font-black text-red-900 bg-white py-1 px-3 rounded-lg border border-red-200 inline-block shadow-2xs">
                {Math.floor(lockoutSecondsLeft / 60)}m {String(lockoutSecondsLeft % 60).padStart(2, '0')}s
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                Senha Administrativa
              </label>
              <input
                type="password"
                disabled={isLockedOut}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={isLockedOut ? "Acesso bloqueado temporariamente" : "Digite a senha de acesso"}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors ${
                  isLockedOut 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#FFFBF2] border-amber-200 focus:outline-none focus:border-orange-500'
                }`}
                autoFocus={!isLockedOut}
              />
            </div>

            {authError && !isLockedOut && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLockedOut}
              className={`w-full font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all ${
                isLockedOut
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-orange-600 text-white cursor-pointer hover:shadow-lg'
              }`}
            >
              {isLockedOut ? 'Acesso Bloqueado' : 'Entrar no Painel de Controle'}
            </button>
          </form>

          <div className="pt-4 border-t border-amber-100 flex items-center justify-center text-xs">
            <button
              onClick={onExit}
              className="text-orange-600 hover:text-orange-700 hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              &larr; Voltar ao Site Público
            </button>
          </div>

          <div className="pt-3 text-center">
            <span className="text-[10px] text-amber-900/50">
              Desenvolvido por <strong className="text-[#5C1917] font-semibold">NexusThink</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Filtragem de produtos por busca
  const searchedProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.collectionLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Métricas do período selecionado (hoje, quinzenal, mensal, total)
  const currentMetrics = getFilteredAnalytics ? getFilteredAnalytics(analyticsPeriod) : analytics;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D1407] font-sans antialiased pb-20 no-print">
      
      {/* ── Topbar do Admin ────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#5C1917] leading-tight">
                  Painel de Controle
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  GERENCIAMENTO ATIVO
                </span>
              </div>
              <span className="text-[11px] text-amber-900/70 block">
                Krystal Velas &bull; Edição instantânea sem necessidade de banco de dados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-xs font-bold text-white bg-[#5C1917] hover:bg-[#431210] px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span>Ver Site Público</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Notificação Flutuante de Sucesso */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </header>

      {/* ── Métricas de Conversão em Tempo Real (Analytics com Filtro & Limpeza) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Barra de Controle de Métricas: Filtros de Período e Limpar Contagem */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#5C1917] leading-tight">
                  Métricas & Conversões
                </h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                  {analyticsPeriod === 'hoje' && 'Hoje (Dia)'}
                  {analyticsPeriod === 'quinzenal' && 'Quinzenal (15 dias)'}
                  {analyticsPeriod === 'mensal' && 'Mensal (30 dias)'}
                  {analyticsPeriod === 'total' && 'Total Acumulado'}
                </span>
              </div>
              <p className="text-[11px] text-[#2D1407]/70 mt-0.5">
                {analyticsPeriod === 'hoje' && 'Acessos e cliques registrados nas últimas 24 horas'}
                {analyticsPeriod === 'quinzenal' && 'Acessos e cliques acumulados nos últimos 15 dias'}
                {analyticsPeriod === 'mensal' && 'Acessos e cliques acumulados nos últimos 30 dias'}
                {analyticsPeriod === 'total' && 'Todo o histórico de conversão acumulado no sistema'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Seletor de Período (Dia, Quinzenal, Mensal, Total) */}
            <div className="inline-flex bg-[#FFFBF2] p-1 rounded-xl border border-amber-200 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setAnalyticsPeriod('hoje')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  analyticsPeriod === 'hoje'
                    ? 'bg-[#5C1917] text-white shadow-xs'
                    : 'text-amber-900/80 hover:bg-amber-100/60'
                }`}
              >
                Hoje (Dia)
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsPeriod('quinzenal')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  analyticsPeriod === 'quinzenal'
                    ? 'bg-[#5C1917] text-white shadow-xs'
                    : 'text-amber-900/80 hover:bg-amber-100/60'
                }`}
              >
                Quinzenal (15d)
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsPeriod('mensal')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  analyticsPeriod === 'mensal'
                    ? 'bg-[#5C1917] text-white shadow-xs'
                    : 'text-amber-900/80 hover:bg-amber-100/60'
                }`}
              >
                Mensal (30d)
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsPeriod('total')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  analyticsPeriod === 'total'
                    ? 'bg-[#5C1917] text-white shadow-xs'
                    : 'text-amber-900/80 hover:bg-amber-100/60'
                }`}
              >
                Total Geral
              </button>
            </div>

            {/* Botão Limpar Contagem */}
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Limpar e zerar contagem de métricas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              <span>Limpar Contagem</span>
            </button>
          </div>
        </div>

        {/* 4 Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-800">Visualizações</span>
              <Eye className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-[#5C1917]">{currentMetrics.pageViews}</div>
            <span className="text-[10px] text-gray-400">
              {analyticsPeriod === 'hoje' ? 'Acessos hoje' : analyticsPeriod === 'quinzenal' ? 'Acessos em 15 dias' : analyticsPeriod === 'mensal' ? 'Acessos em 30 dias' : 'Acessos registrados'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-orange-600">Cliques WhatsApp</span>
              <Phone className="w-4 h-4 text-orange-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-orange-600">{currentMetrics.whatsappClicks}</div>
            <span className="text-[10px] text-gray-400">
              {analyticsPeriod === 'hoje' ? 'Contatos hoje' : analyticsPeriod === 'quinzenal' ? 'Contatos em 15 dias' : analyticsPeriod === 'mensal' ? 'Contatos em 30 dias' : 'Contatos iniciados'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700">Simulador de Atacado</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-700">{currentMetrics.quoteSimulator}</div>
            <span className="text-[10px] text-gray-400">
              {analyticsPeriod === 'hoje' ? 'Cotações hoje' : analyticsPeriod === 'quinzenal' ? 'Cotações em 15 dias' : analyticsPeriod === 'mensal' ? 'Cotações em 30 dias' : 'Cotações geradas'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-purple-700">Catálogos em PDF</span>
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-purple-700">{currentMetrics.catalogDownloads}</div>
            <span className="text-[10px] text-gray-400">
              {analyticsPeriod === 'hoje' ? 'Downloads hoje' : analyticsPeriod === 'quinzenal' ? 'Downloads em 15 dias' : analyticsPeriod === 'mensal' ? 'Downloads em 30 dias' : 'Downloads solicitados'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Abas de Edição ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-amber-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'produtos'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>1. Obras & Velas ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categorias')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'categorias'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>2. Categorias ({collections.length - 1})</span>
          </button>

          <button
            onClick={() => setActiveTab('lookbook')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'lookbook'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Ambientes (Lookbook)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulador')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'simulador'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>4. Simulador de Atacado</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>5. Textos do Hero</span>
          </button>

          <button
            onClick={() => setActiveTab('marca')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'marca'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>6. WhatsApp & Contatos</span>
          </button>

          <button
            onClick={() => setActiveTab('padroes')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'padroes'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>7. Padrões Técnicos</span>
          </button>

          <button
            onClick={() => setActiveTab('depoimentos')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'depoimentos'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>8. Depoimentos</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>9. FAQ</span>
          </button>

          <button
            onClick={() => setActiveTab('catalogo-pdf')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'catalogo-pdf'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>10. Catálogo PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('seguranca')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'seguranca'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>11. Senha Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                : 'text-amber-900/80 hover:bg-amber-50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>12. Backup / JSON</span>
          </button>
        </div>

        {/* ── ABA 1: PRODUTOS & OBRAS ──────────────────────────────────────── */}
        {activeTab === 'produtos' && (
          <div className="space-y-6">
            
            {/* Barra Superior */}
            <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                  Gerenciamento de Velas & Obras
                </h3>
                <p className="text-xs text-[#2D1407]/70">
                  Cadastre novas velas com upload de fotos do seu dispositivo, pause itens sem estoque ou edite detalhes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar vela pelo nome..."
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingProject({
                      id: `kv-${Date.now()}`,
                      ref: `REF. ${projects.length + 1} / CAT`,
                      title: '',
                      collection: collections[1]?.id || 'votivas',
                      collectionLabel: collections[1]?.name || 'Linha Fé & Votivas',
                      image: '/produtos/vela1.png',
                      badge: 'Novo Item',
                      badgeColor: 'bg-amber-500 text-white',
                      subtitle: '',
                      duration: '168h contínuas',
                      material: '100% Parafina Pura',
                      dimensions: '15,0 cm x 5,5 cm • 280g',
                      packaging: 'Fardo fechado c/ 12 unidades',
                      target: 'Atacado e Lojistas',
                      description: '',
                      isActive: true,
                      specs: ['Pavio 100% puro algodão', 'Combustão completa', 'Fardo industrial']
                    });
                    setIsAddingProject(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Vela</span>
                </button>
              </div>
            </div>

            {/* Grade de Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchedProjects.map((proj) => (
                <div 
                  key={proj.id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between group ${
                    proj.isActive !== false ? 'border-amber-200/80 hover:shadow-lg' : 'border-gray-300 opacity-60 bg-gray-50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-orange-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        {proj.ref}
                      </span>
                      
                      {/* Switch de Ativo / Pausado */}
                      <button
                        onClick={() => {
                          toggleProjectActive(proj.id);
                          showNotification(proj.isActive !== false ? `Vela "${proj.title}" pausada (oculta no site).` : `Vela "${proj.title}" ativada no site!`);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          proj.isActive !== false 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Clique para alternar visibilidade no site público"
                      >
                        {proj.isActive !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Ativo no Site</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Pausado (Oculto)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="aspect-[4/3] bg-gradient-to-b from-[#FFFDF7] to-[#FFF4DE] rounded-2xl p-4 flex items-center justify-center border border-amber-100 relative overflow-hidden">
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                        onError={(e) => { e.currentTarget.src = '/hero-bg.png'; }}
                      />
                      <span className={`absolute bottom-2 left-2 text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${proj.badgeColor || 'bg-amber-500 text-white'}`}>
                        {proj.badge}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-[#5C1917] leading-snug">
                      {proj.title}
                    </h4>
                    
                    <p className="text-xs text-[#2D1407]/75 line-clamp-2">
                      {proj.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-amber-800 bg-[#FFFBF2] p-2 rounded-lg border border-amber-100">
                      <span>Coleção: <strong>{proj.collectionLabel}</strong></span>
                      <span className="font-bold text-[#5C1917]">{proj.duration}</span>
                    </div>

                    {proj.packaging && (
                      <div className="flex items-center justify-between text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                        <span className="text-gray-500 font-medium">Fardo / Caixa:</span>
                        <strong className="font-semibold text-[#5C1917] truncate max-w-[65%]">{proj.packaging}</strong>
                      </div>
                    )}
                  </div>

                  {/* Ações do Card */}
                  <div className="pt-4 border-t border-amber-100 mt-4 flex items-center gap-2">
                    {/* Botões de Ordenação Hierárquica */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-0.5 bg-gray-50/80">
                      <button
                        type="button"
                        onClick={() => {
                          moveProjectUp(proj.id);
                          showNotification(`Vela "${proj.title}" reposicionada para cima.`);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#5C1917] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Subir posição no catálogo"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          moveProjectDown(proj.id);
                          showNotification(`Vela "${proj.title}" reposicionada para baixo.`);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#5C1917] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Descer posição no catálogo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setEditingProject({ ...proj });
                        setIsAddingProject(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir "${proj.title}" do portfólio?`)) {
                          deleteProject(proj.id);
                          showNotification(`Obra "${proj.title}" excluída.`);
                        }
                      }}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-gray-200"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ── MODAL DE EDIÇÃO DE PRODUTO COM UPLOAD LOCAL ───────────────────── */}
        {(editingProject || isAddingProject) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-amber-300 shadow-2xl max-h-[92vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-amber-200 mb-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                    {isAddingProject ? '➕ Adicionar Nova Vela ao Portfólio' : '✏️ Editar Detalhes da Vela'}
                  </h3>
                  <span className="text-xs text-amber-900/70">
                    {isAddingProject ? 'Preencha os campos e selecione a foto para publicar' : `Editando: ${editingProject.title}`}
                  </span>
                </div>
                <button
                  onClick={() => { setEditingProject(null); setIsAddingProject(false); }}
                  className="p-2 text-gray-400 hover:text-black rounded-full cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (isAddingProject) {
                  addProject(editingProject);
                  showNotification('Nova vela cadastrada com sucesso!');
                } else {
                  updateProject(editingProject.id, editingProject);
                  showNotification('Vela atualizada com sucesso!');
                }
                setEditingProject(null);
                setIsAddingProject(false);
              }} className="space-y-5">
                
                {/* 1. Título & Referência */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Nome / Título da Vela *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder="Ex: Vela Votiva 7 Dias Tradicional"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Código / Ref *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.ref}
                      onChange={(e) => setEditingProject({ ...editingProject, ref: e.target.value })}
                      placeholder="Ex: REF. 01 / VOT"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* 2. UPLOAD LOCAL E SELETOR DE FOTOS */}
                <div className="p-5 bg-[#FFFBF2] rounded-2xl border border-amber-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5C1917] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-orange-600" />
                      <span>Foto da Vela:</span>
                    </label>

                    {/* Botão de Upload Local */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-xs hover:scale-102 transition-transform cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Carregar Foto do Computador / Celular</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview da foto atual */}
                  {editingProject.image && (
                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-amber-200">
                      <div className="w-16 h-16 rounded-lg bg-gray-50 p-1 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <img
                          src={editingProject.image}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-xs overflow-hidden">
                        <span className="font-bold text-[#5C1917] block">Imagem Ativa</span>
                        <span className="text-gray-500 truncate block text-[11px]">{editingProject.image.slice(0, 60)}...</span>
                      </div>
                    </div>
                  )}

                  {/* Galeria de Fotos Existentes da Fábrica */}
                  <div>
                    <span className="text-[11px] font-semibold text-amber-900 block mb-2">
                      Ou escolha uma das fotos de catálogo pré-cadastradas:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-amber-200">
                      {AVAILABLE_PRODUCT_IMAGES.map((imgSrc, idx) => {
                        const isSelected = editingProject.image === imgSrc;
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setEditingProject({ ...editingProject, image: imgSrc })}
                            className={`aspect-square p-1 rounded-lg border-2 transition-all flex items-center justify-center relative cursor-pointer ${
                              isSelected 
                                ? 'border-orange-600 bg-orange-50 scale-105 shadow-sm' 
                                : 'border-transparent hover:border-amber-300 bg-gray-50'
                            }`}
                          >
                            <img
                              src={imgSrc}
                              alt={`Vela ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-orange-600 rounded-full flex items-center justify-center text-white">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Coleção, Duração e Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Coleção / Categoria
                    </label>
                    <select
                      value={editingProject.collection}
                      onChange={(e) => {
                        const colId = e.target.value;
                        const foundCol = collections.find(c => c.id === colId);
                        setEditingProject({
                          ...editingProject,
                          collection: colId,
                          collectionLabel: foundCol ? foundCol.name : 'Geral'
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500 font-semibold"
                    >
                      {collections.filter(c => c.id !== 'todos').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Duração de Queima
                    </label>
                    <input
                      type="text"
                      value={editingProject.duration}
                      onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                      placeholder="Ex: 168h contínuas"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Badge de Destaque
                    </label>
                    <input
                      type="text"
                      value={editingProject.badge}
                      onChange={(e) => setEditingProject({ ...editingProject, badge: e.target.value })}
                      placeholder="Ex: Mais Vendida, Lançamento"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* 4. Dimensões, Embalagem, Matéria-Prima e Mercado-Alvo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Dimensões & Peso
                    </label>
                    <input
                      type="text"
                      value={editingProject.dimensions}
                      onChange={(e) => setEditingProject({ ...editingProject, dimensions: e.target.value })}
                      placeholder="15,0 cm x 5,5 cm • 280g"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Embalagem Coletiva / Fardo
                    </label>
                    <input
                      type="text"
                      value={editingProject.packaging || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, packaging: e.target.value })}
                      placeholder="Ex: Fardos c/ 12 un • Cx c/ 48"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Matéria-Prima
                    </label>
                    <input
                      type="text"
                      value={editingProject.material}
                      onChange={(e) => setEditingProject({ ...editingProject, material: e.target.value })}
                      placeholder="100% Parafina Pura Filtrada"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Mercado-Alvo
                    </label>
                    <input
                      type="text"
                      value={editingProject.target}
                      onChange={(e) => setEditingProject({ ...editingProject, target: e.target.value })}
                      placeholder="Paróquias, Buffets, Lojistas"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* 5. Descrição Técnica */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Descrição da Vela (Ficha Técnica)
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    placeholder="Escreva a descrição que aparecerá quando o cliente clicar na vela..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Botões do Formulário */}
                <div className="pt-4 border-t border-amber-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditingProject(null); setIsAddingProject(false); }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isAddingProject ? 'Salvar Nova Vela no Portfólio' : 'Salvar Alterações'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ── ABA 2: GERENCIADOR DE CATEGORIAS / COLEÇÕES ──────────────────── */}
        {activeTab === 'categorias' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                Gerenciador de Coleções & Abas
              </h3>
              <p className="text-xs text-[#2D1407]/70">
                Adicione novas abas para o catálogo (ex: Linha Natalina, Lembrancinhas, Velas de Mel) ou remova existentes.
              </p>
            </div>

            {/* Criar Nova Categoria */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newCollectionName.trim()) return;
              addCollection(newCollectionName.trim());
              setNewCollectionName('');
              showNotification('Nova coleção adicionada com sucesso!');
            }} className="flex items-center gap-3">
              <input
                type="text"
                required
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Nome da Nova Coleção (ex: Linha Festas & Natal)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* Lista de Coleções Atuais */}
            <div className="space-y-3 pt-4 border-t border-amber-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Coleções Ativas no Portfólio:
              </h4>

              <div className="divide-y divide-amber-100 bg-[#FFFDF7] rounded-2xl border border-amber-200/70 overflow-hidden">
                {collections.map((col) => (
                  <div key={col.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#5C1917]">{col.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 block">ID: {col.id}</span>
                    </div>

                    {col.id !== 'todos' ? (
                      <button
                        onClick={() => {
                          if (confirm(`Remover a coleção "${col.name}"?`)) {
                            deleteCollection(col.id);
                            showNotification('Coleção removida!');
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Padrão do Sistema
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ABA 3: AMBIENTES (LOOKBOOK) ───────────────────────────────────── */}
        {activeTab === 'lookbook' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-4xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] uppercase font-bold tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  <span>Curadoria Editorial</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                  Ambientes & Aplicações do Lookbook
                </h3>
                <p className="text-xs text-[#2D1407]/70">
                  Edite os 3 cenários de iluminação exibidos na seção "Lookbook em Ação" da página inicial.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {(lookbookScenarios || []).map((sc, idx) => (
                <div 
                  key={sc.id} 
                  className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200/80 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#5C1917] text-amber-200 font-serif font-bold text-xs flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <h4 className="font-serif font-bold text-base text-[#5C1917]">
                        Cenário: {sc.title}
                      </h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                      ID: {sc.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                        Título do Cenário
                      </label>
                      <input
                        type="text"
                        value={sc.title}
                        onChange={(e) => {
                          updateLookbookScenario(sc.id, { title: e.target.value });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-[#5C1917] focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                        Categoria / Aplicação
                      </label>
                      <input
                        type="text"
                        value={sc.category}
                        onChange={(e) => {
                          updateLookbookScenario(sc.id, { category: e.target.value });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Texto Descritivo do Ambiente
                    </label>
                    <textarea
                      rows={2}
                      value={sc.desc}
                      onChange={(e) => {
                        updateLookbookScenario(sc.id, { desc: e.target.value });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ABA 4: SIMULADOR DE ATACADO ───────────────────────────────────── */}
        {activeTab === 'simulador' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-4xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] uppercase font-bold tracking-wider mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
                  <span>Calculadora Comercial</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                  Itens do Simulador de Atacado & Cargas
                </h3>
                <p className="text-xs text-[#2D1407]/70">
                  Gerencie os tipos de velas que aparecem na cotação rápida do cliente e o peso unitário em kg para cálculo de frete.
                </p>
              </div>
            </div>

            {/* Formulário de Adicionar Item ao Simulador */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSimName.trim()) return;
                addSimulatorItem({
                  name: newSimName.trim(),
                  defaultQty: Number(newSimQty) || 1,
                  weightKgPerUnit: Number(newSimWeight) || 2.5
                });
                setNewSimName('');
                setNewSimQty(1);
                setNewSimWeight(2.5);
                showNotification('Novo item adicionado ao Simulador!');
              }}
              className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200/80 space-y-4"
            >
              <h4 className="font-serif text-base font-bold text-[#5C1917] flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-600" />
                <span>Adicionar Novo Item ao Simulador</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Nome da Linha / Embalagem
                  </label>
                  <input
                    type="text"
                    required
                    value={newSimName}
                    onChange={(e) => setNewSimName(e.target.value)}
                    placeholder="Ex: Velas 7 Dias Bicolor (Fardo c/ 12 un)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Peso Estimado (kg/un)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={newSimWeight}
                    onChange={(e) => setNewSimWeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-[#5C1917] focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar no Simulador</span>
                </button>
              </div>
            </form>

            {/* Lista dos Itens Existentes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Itens Ativos no Simulador ({simulatorItems.length}):
              </h4>

              <div className="divide-y divide-amber-100 bg-[#FFFDF7] rounded-2xl border border-amber-200/70 overflow-hidden">
                {simulatorItems.map((item, idx) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-6 h-6 rounded-md bg-amber-200/80 text-[#5C1917] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            updateSimulatorItem(item.id, { name: e.target.value });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-[#5C1917]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-amber-900">
                        <span className="text-[11px] text-gray-500 font-medium">Peso/un:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={item.weightKgPerUnit || 2.5}
                          onChange={(e) => {
                            updateSimulatorItem(item.id, { weightKgPerUnit: parseFloat(e.target.value) || 0 });
                          }}
                          className="w-20 px-2 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-center"
                        />
                        <span className="text-[11px] text-gray-500">kg</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remover "${item.name}" do simulador?`)) {
                            deleteSimulatorItem(item.id);
                            showNotification('Item removido do simulador!');
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir item do simulador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ABA 5: TEXTOS DO HERO ────────────────────────────────────────── */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-4xl space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                Editar Textos Principais do Hero
              </h3>
              <p className="text-xs text-[#2D1407]/70">
                Altere o título principal, o subtítulo descritivo e as 4 métricas do topo do site.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateBrand(brandForm);
              showNotification('Textos do Hero atualizados com sucesso!');
            }} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                  Tagline da Pill do Topo
                </label>
                <input
                  type="text"
                  value={brandForm.tagline}
                  onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                  Título Principal (Headline)
                </label>
                <input
                  type="text"
                  value={brandForm.heroTitle}
                  onChange={(e) => setBrandForm({ ...brandForm, heroTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-base font-bold text-[#5C1917] focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                  Subtítulo Descritivo
                </label>
                <textarea
                  rows={3}
                  value={brandForm.heroSubtitle}
                  onChange={(e) => setBrandForm({ ...brandForm, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* 4 Métricas */}
              <div className="pt-4 border-t border-amber-100 space-y-4">
                <h4 className="font-bold text-sm text-[#5C1917] uppercase tracking-wider">
                  Editar as 4 Métricas de Destaque do Topo:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {brandForm.stats.map((st, idx) => (
                    <div key={idx} className="p-4 bg-[#FFFBF2] rounded-2xl border border-amber-200 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-orange-600 block">
                        Card 0{idx + 1}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => {
                            const newStats = [...brandForm.stats];
                            newStats[idx].label = e.target.value;
                            setBrandForm({ ...brandForm, stats: newStats });
                          }}
                          placeholder="Rótulo"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          value={st.val}
                          onChange={(e) => {
                            const newStats = [...brandForm.stats];
                            newStats[idx].val = e.target.value;
                            setBrandForm({ ...brandForm, stats: newStats });
                          }}
                          placeholder="Valor"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-bold text-[#5C1917]"
                        />
                      </div>
                      <input
                        type="text"
                        value={st.note}
                        onChange={(e) => {
                          const newStats = [...brandForm.stats];
                          newStats[idx].note = e.target.value;
                          setBrandForm({ ...brandForm, stats: newStats });
                        }}
                        placeholder="Nota de apoio"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs text-gray-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-amber-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#5C1917] hover:bg-[#431210] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Textos do Hero</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ── ABA 4: DADOS DA FÁBRICA & WHATSAPP ────────────────────────────── */}
        {activeTab === 'marca' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                Dados da Fábrica & Destino do WhatsApp
              </h3>
              <p className="text-xs text-[#2D1407]/70">
                O número configurado aqui é para onde vão todos os pedidos gerados no simulador e nos botões de cotação.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateBrand(brandForm);
              showNotification('Número de WhatsApp e contatos salvos com sucesso!');
            }} className="space-y-5">
              
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-emerald-900">
                    Número Ativo de Recebimento de Cotações:
                  </h4>
                  <p className="text-xs text-emerald-800 font-mono font-bold">
                    +{brandForm.phone || '5543998073376'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Número do WhatsApp (Apenas Dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandForm.phone}
                    onChange={(e) => setBrandForm({ ...brandForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="5543998073376"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm font-mono font-bold focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Formato: DDI + DDD + Número (ex: <code>5543998073376</code>)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Telefone Formatado para Exibição
                  </label>
                  <input
                    type="text"
                    value={brandForm.phoneFormatted}
                    onChange={(e) => setBrandForm({ ...brandForm, phoneFormatted: e.target.value })}
                    placeholder="(43) 99807-3376"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    E-mail Comercial Oficial
                  </label>
                  <input
                    type="email"
                    value={brandForm.email}
                    onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                    placeholder="comercial@krystalvelas.com.br"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Endereço / Sede da Indústria
                  </label>
                  <input
                    type="text"
                    value={brandForm.headquarters}
                    onChange={(e) => setBrandForm({ ...brandForm, headquarters: e.target.value })}
                    placeholder="Ibiporã, Paraná — Brasil"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    CNPJ da Fábrica
                  </label>
                  <input
                    type="text"
                    value={brandForm.cnpj || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, cnpj: e.target.value })}
                    placeholder="35.123.456/0001-78"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Razão Social Oficial
                  </label>
                  <input
                    type="text"
                    value={brandForm.corporateReason || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, corporateReason: e.target.value })}
                    placeholder="Krystal Velas Indústria de Velas Ltda"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-amber-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#5C1917] hover:bg-[#431210] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados de Contato</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ── ABA 5: PADRÕES TÉCNICOS DA FÁBRICA ───────────────────────────── */}
        {activeTab === 'padroes' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                Padrões Técnicos de Qualidade da Fábrica
              </h3>
              <p className="text-xs text-[#2D1407]/70">
                Edite os 5 critérios que atestam a qualidade da queima da Krystal Velas.
              </p>
            </div>

            <div className="space-y-4">
              {standards.map((std) => (
                <div 
                  key={std.id}
                  className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 md:w-2/3">
                    <span className="text-[10px] font-bold uppercase text-orange-600 block">
                      {std.param}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#5C1917]">
                      {std.standard}
                    </h4>
                    <p className="text-xs text-[#2D1407]/70">
                      {std.detail}
                    </p>
                  </div>

                  <button
                    onClick={() => setEditingStandard({ ...std })}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#5C1917] bg-amber-100/70 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors cursor-pointer self-start md:self-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Critério</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Edição de Padrão Técnico */}
        {editingStandard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-amber-300 shadow-2xl space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#5C1917]">
                Editar Critério Técnico
              </h3>

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Nome do Parâmetro</label>
                <input
                  type="text"
                  value={editingStandard.param}
                  onChange={(e) => setEditingStandard({ ...editingStandard, param: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Padrão da Fábrica</label>
                <input
                  type="text"
                  value={editingStandard.standard}
                  onChange={(e) => setEditingStandard({ ...editingStandard, standard: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm text-orange-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Detalhamento Técnico</label>
                <textarea
                  rows={3}
                  value={editingStandard.detail}
                  onChange={(e) => setEditingStandard({ ...editingStandard, detail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStandard(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateStandard(editingStandard.id, editingStandard);
                    setEditingStandard(null);
                    showNotification('Critério técnico atualizado!');
                  }}
                  className="px-5 py-2 bg-[#5C1917] text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA 6: DEPOIMENTOS ───────────────────────────────────────────── */}
        {activeTab === 'depoimentos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                  Depoimentos de Parceria
                </h3>
                <p className="text-xs text-[#2D1407]/70">
                  Gerencie os relatos de paróquias, decoradores e distribuidores.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTestimonial({
                    id: Date.now(),
                    author: '',
                    role: '',
                    city: '',
                    quote: '',
                    rating: 5
                  });
                  setIsAddingTestimonial(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Depoimento</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs italic text-[#2D1407]/80 leading-relaxed">
                      "{t.quote}"
                    </p>
                    <div className="pt-3 border-t border-amber-100">
                      <h4 className="font-bold text-sm text-[#5C1917]">{t.author}</h4>
                      <p className="text-xs text-amber-800">{t.role} &bull; {t.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-amber-100 mt-4">
                    <button
                      onClick={() => {
                        setEditingTestimonial({ ...t });
                        setIsAddingTestimonial(false);
                      }}
                      className="p-2 text-amber-800 hover:text-orange-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                      title="Editar depoimento"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Excluir este depoimento?')) {
                          deleteTestimonial(t.id);
                          showNotification('Depoimento excluído com sucesso!');
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Depoimento */}
        {(editingTestimonial || isAddingTestimonial) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-amber-300 shadow-2xl">
              <h3 className="font-serif text-xl font-bold text-[#5C1917] mb-4">
                {isAddingTestimonial ? '➕ Adicionar Depoimento' : '✏️ Editar Depoimento'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (isAddingTestimonial) {
                  addTestimonial(editingTestimonial);
                } else {
                  updateTestimonial(editingTestimonial.id, editingTestimonial);
                }
                setEditingTestimonial(null);
                setIsAddingTestimonial(false);
                showNotification('Depoimento salvo!');
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Nome do Autor</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.author}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Cargo / Instituição</label>
                    <input
                      type="text"
                      required
                      value={editingTestimonial.role}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Cidade / UF</label>
                    <input
                      type="text"
                      required
                      value={editingTestimonial.city}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Texto do Depoimento</label>
                  <textarea
                    rows={4}
                    required
                    value={editingTestimonial.quote}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => { setEditingTestimonial(null); setIsAddingTestimonial(false); }}
                    className="px-4 py-2 text-xs font-bold text-gray-500 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#5C1917] text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    Salvar Depoimento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── ABA 7: FAQ ───────────────────────────────────────────────────── */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                  Perguntas Frequentes (FAQ)
                </h3>
                <p className="text-xs text-[#2D1407]/70">
                  Gerencie as respostas para as principais dúvidas comerciais e logísticas.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingFaq({ id: Date.now(), q: '', a: '' });
                  setIsAddingFaq(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Pergunta</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.id} className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-xs flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-[#5C1917]">{f.q}</h4>
                    <p className="text-xs text-[#2D1407]/80 leading-relaxed">{f.a}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditingFaq({ ...f }); setIsAddingFaq(false); }}
                      className="p-2 text-amber-800 hover:text-orange-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Excluir esta pergunta do FAQ?')) {
                          deleteFaq(f.id);
                          showNotification('Pergunta excluída!');
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal FAQ */}
        {(editingFaq || isAddingFaq) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-amber-300 shadow-2xl">
              <h3 className="font-serif text-xl font-bold text-[#5C1917] mb-4">
                {isAddingFaq ? '➕ Adicionar Pergunta' : '✏️ Editar Pergunta'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (isAddingFaq) {
                  addFaq(editingFaq);
                } else {
                  updateFaq(editingFaq.id, editingFaq);
                }
                setEditingFaq(null);
                setIsAddingFaq(false);
                showNotification('Pergunta salva no FAQ!');
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Pergunta</label>
                  <input
                    type="text"
                    required
                    value={editingFaq.q}
                    onChange={(e) => setEditingFaq({ ...editingFaq, q: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Resposta</label>
                  <textarea
                    rows={4}
                    required
                    value={editingFaq.a}
                    onChange={(e) => setEditingFaq({ ...editingFaq, a: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => { setEditingFaq(null); setIsAddingFaq(false); }}
                    className="px-4 py-2 text-xs font-bold text-gray-500 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#5C1917] text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    Salvar Pergunta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── ABA 8: EDIÇÃO DO CATÁLOGO PDF ─────────────────────────────────── */}
        {activeTab === 'catalogo-pdf' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-4xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-200">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] uppercase font-bold tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 text-orange-600" />
                  <span>Editor Oficial de Catálogo</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                  Configurações do Catálogo PDF & Lookbook
                </h3>
                <p className="text-xs text-[#2D1407]/70">
                  Personalize os textos da capa editorial, manifesto técnico de fábrica e condições comerciais que aparecem no PDF gerado.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    updateCatalogConfig(catalogForm);
                    setShowCatalogPreview(true);
                  }}
                  className="flex items-center gap-2 bg-[#FFFBF2] hover:bg-amber-100/80 text-[#5C1917] border border-amber-300 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-orange-600" />
                  <span>Pré-visualizar na Tela</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateCatalogConfig(catalogForm);
                    showNotification('Configurações salvas! Abrindo janela de impressão/PDF...');
                    setTimeout(() => window.print(), 300);
                  }}
                  className="flex items-center gap-2 bg-[#5C1917] hover:bg-[#431210] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                  title="Abre a caixa de impressão do navegador para salvar como PDF"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Imprimir / Gerar PDF</span>
                </button>
              </div>
            </div>

            {/* Aviso de Configuração do Navegador */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-start gap-3 text-xs text-amber-950">
              <span className="text-base">💡</span>
              <div className="leading-relaxed">
                <strong>Instrução Importante para o PDF Perfeito:</strong> Na caixa de impressão do Google Chrome ou Edge, marque a caixa <strong>"Gráficos de segundo plano"</strong> (no menu <em>Mais definições / Opções</em>) para que as molduras douradas, brasões e cores saiam idênticos ao catálogo real.
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCatalogConfig(catalogForm);
                showNotification('Catálogo PDF atualizado com sucesso!');
              }}
              className="space-y-8"
            >
              {/* Seção 1: Capa */}
              <div className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200/80 space-y-4">
                <h4 className="font-serif text-lg font-bold text-[#5C1917] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>1. Identidade da Capa Editorial</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Título Principal da Capa
                    </label>
                    <input
                      type="text"
                      value={catalogForm.coverTitle}
                      onChange={(e) => setCatalogForm({ ...catalogForm, coverTitle: e.target.value })}
                      placeholder="Ex: CATÁLOGO TÉCNICO & LOOKBOOK INDUSTRIAL"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-[#5C1917] focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Selo de Edição / Safra
                    </label>
                    <input
                      type="text"
                      value={catalogForm.editionBadge}
                      onChange={(e) => setCatalogForm({ ...catalogForm, editionBadge: e.target.value })}
                      placeholder="Ex: EDIÇÃO INDUSTRIAL 2026/2027 • POLO IBIPORÃ / PR"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Subtítulo / Descrição das Linhas
                    </label>
                    <textarea
                      rows={2}
                      value={catalogForm.coverSubtitle}
                      onChange={(e) => setCatalogForm({ ...catalogForm, coverSubtitle: e.target.value })}
                      placeholder="Descrição dos tipos de velas incluídos no catálogo"
                      className="w-full p-3 rounded-xl bg-white border border-amber-200 text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Manifesto Técnico */}
              <div className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200/80 space-y-4">
                <h4 className="font-serif text-lg font-bold text-[#5C1917] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>2. Manifesto de Qualidade & Engenharia</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Título do Manifesto
                  </label>
                  <input
                    type="text"
                    value={catalogForm.manifestoTitle}
                    onChange={(e) => setCatalogForm({ ...catalogForm, manifestoTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-[#5C1917] focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Texto Institucional de Apresentação
                  </label>
                  <textarea
                    rows={4}
                    value={catalogForm.manifestoText}
                    onChange={(e) => setCatalogForm({ ...catalogForm, manifestoText: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-amber-200 text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Seção 3: Políticas Comerciais de Atacado */}
              <div className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200/80 space-y-4">
                <h4 className="font-serif text-lg font-bold text-[#5C1917] flex items-center gap-2">
                  <Factory className="w-4 h-4 text-orange-600" />
                  <span>3. Condições Comerciais de Atacado</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Nota de Tabela Regressiva & Precificação
                    </label>
                    <textarea
                      rows={2}
                      value={catalogForm.pricingNote}
                      onChange={(e) => setCatalogForm({ ...catalogForm, pricingNote: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white border border-amber-200 text-xs leading-relaxed focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Regra de Pedido Mínimo
                    </label>
                    <input
                      type="text"
                      value={catalogForm.termsMinOrder}
                      onChange={(e) => setCatalogForm({ ...catalogForm, termsMinOrder: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Formas de Faturamento
                    </label>
                    <input
                      type="text"
                      value={catalogForm.termsPayment}
                      onChange={(e) => setCatalogForm({ ...catalogForm, termsPayment: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                      Logística, Prazos & Frete
                    </label>
                    <input
                      type="text"
                      value={catalogForm.termsShipping}
                      onChange={(e) => setCatalogForm({ ...catalogForm, termsShipping: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Rodapé */}
              <div className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200/80 space-y-4">
                <h4 className="font-serif text-lg font-bold text-[#5C1917] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span>4. Aviso Legal e Rodapé do Catálogo</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Nota Legal de Rodapé
                  </label>
                  <input
                    type="text"
                    value={catalogForm.footerNote}
                    onChange={(e) => setCatalogForm({ ...catalogForm, footerNote: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-amber-900/60">
                  Todas as alterações são sincronizadas imediatamente com o botão de gerar PDF do site.
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Configurações do Catálogo</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── ABA 9: SEGURANÇA & ALTERAÇÃO DE SENHA ────────────────────────── */}
        {activeTab === 'seguranca' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-xl space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                Alterar Senha de Acesso do Admin
              </h3>
              <p className="text-xs text-[#2D1407]/70">
                Altere a senha que protege o acesso a este painel administrativo.
              </p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  required
                  value={currentPwdInput}
                  onChange={(e) => setCurrentPwdInput(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Nova Senha (Mínimo 4 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPwdInput}
                  onChange={(e) => setConfirmPwdInput(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF2] border border-amber-200 text-sm focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              {pwdMsg.text && (
                <p className={`text-xs font-bold p-3 rounded-xl flex items-center gap-2 ${
                  pwdMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{pwdMsg.text}</span>
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#5C1917] hover:bg-[#431210] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ABA 9: BACKUP & EXPORTAÇÃO ───────────────────────────────────── */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-xs max-w-3xl space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#5C1917]">
                Backup, Exportação e Restauração de Dados
              </h3>
              <p className="text-xs text-[#2D1407]/70">
                Baixe um arquivo JSON com todas as suas edições de produtos, contatos e textos para ter cópia segura.
              </p>
            </div>

            {/* Exportar JSON */}
            <div className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200 space-y-4">
              <h4 className="font-bold text-sm text-[#5C1917] flex items-center gap-2">
                <Download className="w-4 h-4 text-orange-600" />
                <span>Exportar Dados Completos (JSON)</span>
              </h4>
              <p className="text-xs text-[#2D1407]/70">
                Gera um arquivo de texto com todas as suas personalizações.
              </p>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportAllDataJSON());
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `krystal_backup_${new Date().toISOString().slice(0,10)}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  showNotification('Backup baixado com sucesso!');
                }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Baixar Arquivo .JSON de Backup
              </button>
            </div>

            {/* Importar JSON */}
            <div className="p-6 bg-[#FFFBF2] rounded-2xl border border-amber-200 space-y-4">
              <h4 className="font-bold text-sm text-[#5C1917] flex items-center gap-2">
                <Upload className="w-4 h-4 text-orange-600" />
                <span>Importar / Restaurar Backup (JSON)</span>
              </h4>
              <textarea
                rows={4}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Cole o conteúdo do arquivo JSON aqui...'
                className="w-full p-3 rounded-xl bg-white border border-amber-200 font-mono text-xs focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => {
                  if (!importJsonText.trim()) return;
                  const res = importAllDataJSON(importJsonText);
                  if (res.success) {
                    showNotification('Backup restaurado e aplicado com sucesso!');
                    setImportJsonText('');
                  } else {
                    alert('Erro ao importar JSON: ' + res.error);
                  }
                }}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Restaurar e Aplicar no Site
              </button>
            </div>

            {/* Reset */}
            <div className="p-6 bg-red-50/50 rounded-2xl border border-red-200/60 space-y-3">
              <h4 className="font-bold text-sm text-red-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Valores Originais de Fábrica</span>
              </h4>
              <button
                onClick={() => {
                  if (confirm('Atenção: Deseja redefinir todo o site para os dados originais?')) {
                    resetToDefaults();
                    showNotification('Dados redefinidos para os padrões originais!');
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Restaurar Padrão de Fábrica
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ── Modal de Pré-visualização do Catálogo na Tela ── */}
      {showCatalogPreview && (
        <div 
          onClick={() => setShowCatalogPreview(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-100 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-amber-300"
          >
            {/* Barra Superior do Modal */}
            <div className="bg-[#5C1917] text-white p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-300" />
                <div>
                  <h4 className="font-serif font-bold text-base sm:text-lg leading-tight">
                    Pré-visualização do Catálogo Editorial
                  </h4>
                  <p className="text-[11px] text-amber-200/80">
                    Veja exatamente como as páginas serão diagramadas para salvar em PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateCatalogConfig(catalogForm);
                    window.print();
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-500 text-[#2D1407] font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCatalogPreview(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Fechar pré-visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo Renderizado do Catálogo */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-200/70">
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-300">
                <PrintableCatalog previewMode={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Limpeza de Contagem de Métricas ── */}
      {showResetModal && (
        <div 
          onClick={() => setShowResetModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-amber-300 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#5C1917] leading-tight">
                    Limpar Contagem
                  </h4>
                  <span className="text-[11px] text-gray-500">Zerar histórico e contadores de conversão</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#2D1407]/80 leading-relaxed">
              Você pode zerar a contagem de acessos e cliques das métricas. Escolha qual intervalo deseja limpar:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  resetAnalytics(analyticsPeriod);
                  setShowResetModal(false);
                  showNotification(`Contagem do período "${analyticsPeriod === 'hoje' ? 'Hoje' : analyticsPeriod === 'quinzenal' ? 'Quinzenal' : analyticsPeriod === 'mensal' ? 'Mensal' : 'Total'}" foi zerada!`);
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-amber-200 hover:border-amber-400 bg-amber-50/70 hover:bg-amber-100/70 transition-all cursor-pointer shadow-2xs group"
              >
                <div className="font-bold text-xs text-[#5C1917] flex items-center justify-between">
                  <span>Zerar apenas o período selecionado ({analyticsPeriod === 'hoje' ? 'Hoje' : analyticsPeriod === 'quinzenal' ? 'Quinzenal (15d)' : analyticsPeriod === 'mensal' ? 'Mensal (30d)' : 'Total Geral'})</span>
                  <span className="text-[10px] text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full font-semibold">Filtro Ativo</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Reseta a contagem apenas dentro do intervalo que você está visualizando no momento.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetAnalytics('total');
                  setShowResetModal(false);
                  showNotification('Todo o histórico de métricas foi zerado!');
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-red-200 hover:border-red-400 bg-red-50/60 hover:bg-red-100/60 transition-all cursor-pointer shadow-2xs group"
              >
                <div className="font-bold text-xs text-red-700 flex items-center justify-between">
                  <span>Zerar Todo o Histórico Acumulado</span>
                  <span className="text-[10px] text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-semibold">Reset Geral</span>
                </div>
                <p className="text-[11px] text-red-600/80 mt-1">
                  Apaga todas as visualizações, cliques de WhatsApp e downloads de PDF de todas as datas.
                </p>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
