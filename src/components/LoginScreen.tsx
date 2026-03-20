import React, { useState } from 'react';
import { User } from '../types/game';
import { PRODUCTS } from '../constants/gameData';

interface LoginScreenProps {
  onLogin: (userData: User) => void;
  onBack: () => void;
  preSelectedProductId?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack, preSelectedProductId }) => {
  const [name, setName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [loginType, setLoginType] = useState<'colaborador' | 'cliente'>('cliente');
  const [selectedProductId, setSelectedProductId] = useState(preSelectedProductId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock authentication
    setTimeout(() => {
      onLogin({ 
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@aec.com.br`, 
        product_id: loginType === 'cliente' ? selectedProductId : '',
        matricula: loginType === 'colaborador' ? matricula : (selectedProductId || 'CLIENTE'),
        type: loginType
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-6 relative overflow-hidden" 
      style={{ backgroundImage: "url('/assets/beach_bg.png')" }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 px-6 py-3 bg-white/90 text-[#3164F4] font-black text-sm rounded-full shadow-lg border-4 border-[#3164F4] hover:bg-[#3164F4] hover:text-white transition-all duration-300 uppercase tracking-widest"
      >
        <span>←</span> VOLTAR
      </button>

      <div className="relative z-10 w-full max-w-lg bg-white/95 rounded-[25px] md:rounded-[40px] p-4 md:p-8 shadow-2xl border-4 md:border-8 border-[#3164F4]">
        <div className="text-center mb-3 md:mb-6">
          <img src="/assets/logo_summer.png" alt="Logo" className="max-w-[80px] md:max-w-[120px] mx-auto mb-2 md:mb-4" />
          <h2 className="text-xl md:text-3xl font-black text-[#3164F4] uppercase tracking-tighter leading-none">Acesse o Jogo</h2>
          <p className="text-slate-500 font-bold uppercase text-[8px] md:text-xs tracking-widest mt-1 md:mt-2">Identificação Corporativa</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex bg-slate-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl border-2 md:border-4 border-slate-200 mb-6 md:mb-10">
          <button
            type="button"
            className={`flex-1 py-2 md:py-3.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-sm uppercase tracking-widest transition-all duration-300 ${
              loginType === 'colaborador' ? 'bg-[#3164F4] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setLoginType('colaborador')}
          >
            Colaborador
          </button>
          <button
            type="button"
            className={`flex-1 py-2 md:py-3.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-sm uppercase tracking-widest transition-all duration-300 ${
              loginType === 'cliente' ? 'bg-[#3164F4] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setLoginType('cliente')}
          >
            Cliente
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8">
          <div className="space-y-1 md:space-y-2">
            <label className="block text-[#3164F4] text-[9px] md:text-sm font-black uppercase tracking-widest px-2">
              Nome Completo
            </label>
            <input 
              type="text" 
              required
              placeholder="Digite seu nome"
              className="w-full bg-slate-100 border-2 md:border-4 border-slate-200 p-3 md:p-5 rounded-xl md:rounded-2xl text-[#1A2B3C] text-sm md:text-lg font-bold focus:outline-none focus:border-[#3164F4] transition-all duration-300 placeholder:text-slate-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {loginType === 'colaborador' ? (
            <div className="space-y-1 md:space-y-2">
              <label className="block text-[#3164F4] text-[9px] md:text-sm font-black uppercase tracking-widest px-2">
                Matrícula
              </label>
              <input 
                type="text" 
                required
                placeholder="Ex: 123456"
                className="w-full bg-slate-100 border-2 md:border-4 border-slate-200 p-3 md:p-5 rounded-xl md:rounded-2xl text-[#1A2B3C] text-sm md:text-lg font-bold focus:outline-none focus:border-[#3164F4] transition-all duration-300 placeholder:text-slate-400"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
              />
            </div>
          ) : !preSelectedProductId && (
            <div className="space-y-1 md:space-y-2">
              <label className="block text-[#3164F4] text-[9px] md:text-sm font-black uppercase tracking-widest px-2">
                Escolha seu Produto (Cliente)
              </label>
              <select 
                required
                className="w-full bg-slate-100 border-2 md:border-4 border-slate-200 p-3 md:p-5 rounded-xl md:rounded-2xl text-[#1A2B3C] text-sm md:text-lg font-bold focus:outline-none focus:border-[#3164F4] transition-all duration-300 appearance-none cursor-pointer"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Selecione um produto...</option>
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#FF4E6B] to-[#FF6B6B] text-white font-black text-lg md:text-2xl py-3.5 md:py-6 rounded-xl md:rounded-2xl shadow-[0_5px_0_0_#D13450] md:shadow-[0_8px_0_0_#D13450] hover:translate-y-1 hover:shadow-[0_2px_0_0_#D13450] active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 md:w-8 md:h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="text-xl md:text-3xl">🚀</span>
                ENTRAR NO JOGO
              </>
            )}
          </button>
        </form>

        <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t-4 border-slate-100 flex justify-between items-center text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <div>Build v1.0.0-SUMMER</div>
          <div className="text-[#3164F4]">AEC - High Performance</div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
