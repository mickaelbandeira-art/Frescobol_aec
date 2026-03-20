import React from 'react';

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ userName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white/95 rounded-[30px] md:rounded-[50px] overflow-hidden shadow-2xl border-4 md:border-8 border-[#3164F4] animate-in zoom-in duration-300">
        <div className="p-6 md:p-12">
          {/* Header */}
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-5xl font-black text-[#3164F4] uppercase leading-none tracking-tighter mb-2">
              Bem-vindo ao <span className="text-[#FF4E6B]">Game Summer!</span>
            </h2>
            <p className="text-[#1A2B3C] font-bold text-sm md:text-xl">
              Olá, <span className="text-[#3164F4] font-black">{userName}</span>! Vamos subir na Hierarquia?
            </p>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="flex gap-3 md:gap-5 items-start bg-slate-50 p-3 md:p-5 rounded-2xl md:rounded-[30px] border-2 border-slate-100">
              <span className="text-2xl md:text-4xl">🏆</span>
              <div>
                <h4 className="font-black text-[#3164F4] uppercase text-[10px] md:text-sm tracking-widest mb-1">Missão</h4>
                <p className="text-slate-600 text-[9px] md:text-sm leading-tight font-bold">Vença os 5 gestores corporativos para chegar ao topo da AeC.</p>
              </div>
            </div>

            <div className="flex gap-3 md:gap-5 items-start bg-slate-50 p-3 md:p-5 rounded-2xl md:rounded-[30px] border-2 border-slate-100">
              <span className="text-2xl md:text-4xl">🎾</span>
              <div>
                <h4 className="font-black text-[#FF4E6B] uppercase text-[10px] md:text-sm tracking-widest mb-1">Melhor de 3</h4>
                <p className="text-slate-600 text-[9px] md:text-sm leading-tight font-bold">Cada partida é disputada em 3 pontos. Quem fizer 2 primeiro, vence!</p>
              </div>
            </div>

            <div className="flex gap-3 md:gap-5 items-start bg-slate-50 p-3 md:p-5 rounded-2xl md:rounded-[30px] border-2 border-slate-100">
              <span className="text-2xl md:text-4xl">⭐</span>
              <div>
                <h4 className="font-black text-[#C5A000] uppercase text-[10px] md:text-sm tracking-widest mb-1">Vidas e Bônus</h4>
                <p className="text-slate-600 text-[9px] md:text-sm leading-tight font-bold">Você tem 3 estrelas. Perder custa uma! Vencer por 2-0 te dá uma estrela extra.</p>
              </div>
            </div>

            <div className="flex gap-3 md:gap-5 items-start bg-slate-50 p-3 md:p-5 rounded-2xl md:rounded-[30px] border-2 border-slate-100">
              <span className="text-2xl md:text-4xl">⏱️</span>
              <div>
                <h4 className="font-black text-[#3164F4] uppercase text-[10px] md:text-sm tracking-widest mb-1">Ranking</h4>
                <p className="text-slate-600 text-[9px] md:text-sm leading-tight font-bold">O tempo acumulado define sua posição. Seja o mais rápido da hierarquia!</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button 
            onClick={onClose}
            className="w-full bg-[#3164F4] text-white font-black text-lg md:text-3xl py-4 md:py-8 rounded-xl md:rounded-[35px] shadow-[0_5px_0_0_#1a47cc] md:shadow-[0_12px_0_0_#1a47cc] hover:translate-y-1 hover:shadow-[0_2px_0_0_#1a47cc] active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest"
          >
            VAMOS JOGAR! 🏸
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
