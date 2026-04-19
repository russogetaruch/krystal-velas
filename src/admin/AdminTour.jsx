import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ChevronRight, ChevronLeft, X, Sparkles, 
  LayoutDashboard, Warehouse, Factory, FlaskConical, Calculator
} from 'lucide-react';

const TOUR_STEPS = [
  {
    targetId: 'tour-sidebar-dashboard',
    title: 'Dashboard de Performance',
    content: 'Bem-vindo(a) ao seu comando central. Aqui você monitora a saúde financeira e o desempenho das vendas em tempo real.',
    icon: LayoutDashboard,
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-raw_materials',
    title: 'Gestão de Insumos',
    content: 'Aqui é onde tudo começa. Cadastre suas parafinas, essências e pavios, vinculando cada um ao seu fornecedor principal.',
    icon: FlaskConical,
    position: 'right'
  },
  {
    targetId: 'tour-sidebar-inventory',
    title: 'Estoque Inteligente',
    content: 'Nós separamos o seu estoque em duas abas: uma para as velas prontas (Vitrine) e outra para suas matérias-primas (Almoxarifado).',
    icon: Warehouse,
    position: 'right'
  },
  {
    targetId: 'tour-calculator-btn',
    title: 'Calculadora Industrial',
    content: 'Dentro do Estoque, você encontrará este botão. Use-o para simular o lucro real das suas velas, considerando impostos e custos extras.',
    icon: Calculator,
    position: 'bottom'
  },
  {
    targetId: 'tour-sidebar-production',
    title: 'Controle de Produção',
    content: 'Pronto para fabricar? Aqui você gerencia suas receitas e executa ordens de produção com baixa automática de estoque.',
    icon: Factory,
    position: 'right'
  }
];

export default function AdminTour({ userId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [visible, setVisible] = useState(false);

  const updateCoords = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      setVisible(true);
    } else {
      // Se não achar o elemento (ex: aba não ativa), pula pro próximo ou encerra
      handleNext();
    }
  }, [currentStep]);

  useEffect(() => {
    // Pequeno delay para garantir que o DOM renderizou
    const timer = setTimeout(updateCoords, 500);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, [updateCoords]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const finishTour = async () => {
    setVisible(false);
    try {
      await supabase
        .from('profiles')
        .update({ has_seen_tour: true })
        .eq('id', userId);
    } catch (err) {
      console.error('Erro ao salvar progresso do tour:', err);
    }
    onComplete();
  };

  if (!visible) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
      {/* Background Dimmer with Spotlight */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-500"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${coords.left}px 100%, 
            ${coords.left}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top}px, 
            ${coords.left + coords.width}px ${coords.top + coords.height}px, 
            ${coords.left}px ${coords.top + coords.height}px, 
            ${coords.left}px 100%, 
            100% 100%, 100% 0%
          )`
        }}
      />

      {/* Pulse Effect on Target */}
      <div 
        className="absolute border-2 border-orange-500 rounded-xl animate-ping opacity-30"
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8
        }}
      />

      {/* Tooltip Card */}
      <div 
        className="absolute pointer-events-auto w-80 animate-in fade-in zoom-in duration-300"
        style={{
          top: step.position === 'bottom' ? coords.top + coords.height + 20 : coords.top,
          left: step.position === 'right' ? coords.left + coords.width + 20 : coords.left
        }}
      >
        <div className="bg-white dark:bg-[#1a0a05] rounded-[2rem] p-6 shadow-2xl border border-orange-500/20 relative">
          {/* Arrow */}
          <div className={`absolute w-4 h-4 bg-white dark:bg-[#1a0a05] rotate-45 border-l border-t border-orange-500/20 
            ${step.position === 'right' ? '-left-2 top-6' : '-top-2 left-6'}`} 
          />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Icon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brown dark:text-white leading-tight">{step.title}</h4>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Passo {currentStep + 1} de {TOUR_STEPS.length}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            {step.content}
          </p>

          <div className="flex items-center justify-between">
            <button 
              onClick={finishTour}
              className="text-[10px] text-gray-400 font-bold uppercase hover:text-red-500 transition-colors"
            >
              Pular Tudo
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handlePrev} disabled={currentStep === 0}
                className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNext}
                className="bg-brown text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Começar!' : 'Próximo'} 
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
