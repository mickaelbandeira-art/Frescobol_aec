import React, { useState } from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center relative overflow-hidden" 
      style={{ backgroundImage: "url('/assets/beach_bg.png')" }}
    >
      {/* Overlay for better readability if needed, but the user wants the direct feel */}
      <div className="absolute inset-0 bg-sky-400/10 pointer-events-none" />

      {/* Logo Section */}
      <div className="z-10 mb-8 md:mb-12 animate-float px-4">
        <img 
          src="/assets/logo_summer.png" 
          alt="Game Summer" 
          className="max-w-[280px] md:max-w-[600px] drop-shadow-2xl mx-auto"
        />
      </div>

      {/* Buttons Section */}
      <div className="z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-[280px] md:max-w-none">
        <button
          onClick={onStart}
          className="group relative flex items-center justify-center gap-2 md:gap-3 px-8 py-3.5 md:px-12 md:py-5 bg-gradient-to-r from-[#FF4E6B] to-[#FF6B6B] text-white font-black text-lg md:text-2xl rounded-full shadow-[0_6px_0_0_#D13450] md:shadow-[0_10px_0_0_#D13450] hover:translate-y-1 hover:shadow-[0_4px_0_0_#D13450] active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest"
        >
          <span className="text-2xl md:text-3xl">🎮</span>
          JOGAR
        </button>

        <button
          onClick={() => setShowHowToPlay(true)}
          className="group relative flex items-center justify-center gap-2 md:gap-3 px-8 py-3.5 md:px-10 md:py-5 bg-gradient-to-r from-[#3164F4] to-[#4B7DFF] text-white font-black text-lg md:text-2xl rounded-full shadow-[0_6px_0_0_#1E40AF] md:shadow-[0_10px_0_0_#1E40AF] hover:translate-y-1 hover:shadow-[0_4px_0_0_#1E40AF] active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest"
        >
          <span className="text-2xl md:text-3xl">❓</span>
          COMO JOGAR
        </button>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 md:bottom-6 z-10 text-[9px] md:text-xs text-white/90 font-bold bg-black/20 px-4 py-1.5 md:px-6 md:py-2 rounded-full backdrop-blur-sm transition-all hover:bg-black/40">
        Desenvolvido por Mickael Bandeira | Analista de Conteúdo
      </div>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[30px] md:rounded-[40px] p-5 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500 border-4 md:border-8 border-[#3164F4]">
            <button 
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-4 right-4 w-9 h-9 md:w-11 md:h-11 bg-red-500 text-white rounded-full flex items-center justify-center text-lg md:text-xl font-black shadow-lg hover:rotate-90 transition-all duration-300 border-2 border-white z-20"
            >
              ✕
            </button>
            <h2 className="text-2xl md:text-4xl font-black text-[#3164F4] mb-4 md:mb-6 text-center uppercase tracking-tighter">Como Jogar? 🏆</h2>
            
            <div className="space-y-3 md:space-y-4 text-xs md:text-base font-bold text-slate-700">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-2xl md:text-3xl">🎯</span>
                <p>Escolha seu <strong className="text-[#FF4E6B]">Produto</strong> preferido para começar o desafio.</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-2xl md:text-3xl">🖱️</span>
                <p>Use o <strong className="text-[#3164F4]">Mouse</strong> ou <strong className="text-[#3164F4]">Toque</strong> para mover sua raquete.</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-2xl md:text-3xl">🎾</span>
                <p>Não deixe a bola passar! Cada batida aumenta sua <strong className="text-[#3164F4]">Pontuação Acumulada</strong>.</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-2xl md:text-3xl">📈</span>
                <p>Alcance a meta de pontos para vencer o <strong className="text-[#FF4E6B]">Gestor</strong> e subir na hierarquia!</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#FFD700]/10 rounded-2xl border-2 border-[#FFD700]/30 text-center">
                <p className="w-full text-[10px] md:text-sm uppercase tracking-wider">
                  Vença todos os níveis até enfrentar a <strong className="text-amber-600">Diretoria</strong> e zerar o jogo!
                </p>
              </div>
            </div>
          </div>
          
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(49, 100, 244, 0.2); border-radius: 10px; }
          `}</style>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StartScreen;
