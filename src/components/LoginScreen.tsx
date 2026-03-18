import React, { useState } from 'react';
import { User } from '../types/game';

interface LoginScreenProps {
  onLogin: (userData: User) => void;
  onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock authentication
    setTimeout(() => {
      onLogin({ email, matricula });
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

      <div className="relative z-10 w-full max-w-lg bg-white/95 rounded-[40px] p-8 md:p-12 shadow-2xl border-8 border-[#3164F4]">
        <div className="text-center mb-10">
          <img src="/assets/logo_summer.png" alt="Logo" className="max-w-[200px] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-[#3164F4] uppercase tracking-tighter">Acesse o Jogo</h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Identificação Corporativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[#3164F4] text-sm font-black uppercase tracking-widest px-2">
              Email Corporativo
            </label>
            <input 
              type="email" 
              required
              placeholder="seu.nome@aec.com.br"
              className="w-full bg-slate-100 border-4 border-slate-200 p-5 rounded-2xl text-[#1A2B3C] text-lg font-bold focus:outline-none focus:border-[#3164F4] transition-all duration-300 placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[#3164F4] text-sm font-black uppercase tracking-widest px-2">
              Matrícula
            </label>
            <input 
              type="text" 
              required
              placeholder="Ex: 123456"
              className="w-full bg-slate-100 border-4 border-slate-200 p-5 rounded-2xl text-[#1A2B3C] text-lg font-bold focus:outline-none focus:border-[#3164F4] transition-all duration-300 placeholder:text-slate-400"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#FF4E6B] to-[#FF6B6B] text-white font-black text-2xl py-6 rounded-2xl shadow-[0_8px_0_0_#D13450] hover:translate-y-1 hover:shadow-[0_4px_0_0_#D13450] active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <span className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="text-3xl">🚀</span>
                ENTRAR NO JOGO
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-6 border-t-4 border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
          <div>Build v1.0.0-SUMMER</div>
          <div className="text-[#3164F4]">AEC - High Performance</div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
