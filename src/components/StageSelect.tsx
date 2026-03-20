import React from 'react';
import { User, Boss } from '../types/game';
import { BOSSES } from '../constants/gameData';

interface StageSelectProps {
  unlockedIndex: number;
  onSelect: (index: number) => void;
  onBack: () => void;
  onLogout: () => void;
  onShowRanking: () => void;
  user: User | null;
}

const StageSelect: React.FC<StageSelectProps> = ({ unlockedIndex, onSelect, onBack, onLogout, onShowRanking, user }) => {
  return (
    <div 
      className="h-screen w-screen bg-cover bg-center flex flex-col items-center p-3 md:p-8 relative overflow-hidden" 
      style={{ backgroundImage: "url('/assets/beach_bg.png')" }}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

      {/* Header section with Logo & Title */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center mb-4 md:mb-12">
        <div className="bg-white/95 rounded-[20px] md:rounded-[40px] p-3 md:p-8 shadow-2xl border-2 md:border-8 border-[#3164F4] text-center w-full max-w-[280px] md:max-w-xl">
          <h1 className="text-xl md:text-5xl font-black text-[#3164F4] uppercase leading-none tracking-tighter">
            Hierarquia <span className="text-[#FF4E6B]">Corporativa</span>
          </h1>
          <p className="text-[8px] md:text-sm text-slate-500 font-black mt-1 md:mt-3 tracking-widest uppercase">
            Olá, <span className="text-[#3164F4]">{user?.email.split('@')[0] || 'Produtor'}!</span> Vença os gestores para subir.
          </p>
        </div>

        {/* Buttons Row with improved responsiveness */}
        <div className="grid grid-cols-5 md:flex md:flex-row gap-2 md:gap-4 mt-3 md:mt-8 w-full px-2 md:px-0 max-w-[340px] md:max-w-none">
          <button 
            onClick={onBack}
            className="col-span-2 md:flex-1 py-2.5 md:py-4 bg-white/95 text-[#3164F4] font-black text-[9px] md:text-lg rounded-xl md:rounded-2xl border-2 md:border-4 border-[#3164F4] hover:bg-[#3164F4] hover:text-white transition-all uppercase tracking-widest shadow-lg"
          >
            ← Voltar
          </button>
          
          <button 
            onClick={onShowRanking}
            className="col-span-2 md:flex-1 py-2.5 md:py-4 bg-[#FF4E6B] text-white font-black text-[9px] md:text-lg rounded-xl md:rounded-2xl border-2 md:border-4 border-[#FF4E6B] hover:bg-white hover:text-[#FF4E6B] transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-1 md:gap-2"
          >
            🏆 <span className="hidden xs:inline">Ranking</span>
          </button>

          <button 
            onClick={onLogout}
            className="col-span-1 md:w-auto md:px-8 py-2.5 md:py-4 bg-white text-slate-400 font-black text-[9px] md:text-lg rounded-xl md:rounded-2xl border-2 md:border-4 border-slate-200 hover:border-red-400 hover:text-red-400 transition-all uppercase"
            title="Sair"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 md:px-0 mx-auto w-full flex-grow flex items-center justify-center min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 w-full max-h-full items-center overflow-y-auto md:overflow-visible px-2 py-2 md:py-4 custom-scrollbar">
          {BOSSES.map((boss, index) => {
            const isUnlocked = index <= unlockedIndex;
            const isCurrent = index === unlockedIndex;
            
            return (
              <button
                key={boss.id}
                disabled={!isUnlocked}
                onClick={() => onSelect(index)}
                className={`group relative flex flex-col items-center p-2.5 md:p-5 rounded-[25px] md:rounded-[40px] border-[3px] md:border-8 transition-all duration-300 overflow-hidden
                  ${isUnlocked 
                    ? 'bg-white/95 border-white shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 hover:border-[#3164F4]' 
                    : 'bg-slate-200/50 border-slate-300/50 opacity-60 cursor-not-allowed scale-95 grayscale'
                  }
                  ${isCurrent ? 'ring-2 md:ring-8 ring-[#FF4E6B] ring-offset-2 md:ring-offset-4 ring-offset-transparent' : ''}
                `}
              >
                {/* Stage Indicator / Success Badge */}
                <div className={`absolute top-1.5 left-1.5 w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-[10px] md:text-sm border-2 md:border-4 transition-all duration-500
                  ${index < unlockedIndex 
                    ? 'bg-[#FFD700] text-white border-white scale-110 shadow-lg' 
                    : isUnlocked ? 'bg-[#3164F4] text-white border-white' : 'bg-slate-400 text-white border-slate-500'}
                `}>
                  {index < unlockedIndex ? '🏆' : index + 1}
                </div>

                {/* Avatar Container */}
                <div className={`relative mb-2 md:mb-4 p-0.5 md:p-1 rounded-full border-2 md:border-8 transition-transform duration-500 group-hover:scale-105
                  ${index < unlockedIndex ? 'border-[#FFD700]/30 bg-[#FFD700]/10' : isUnlocked ? 'border-[#3164F4]/10 bg-[#3164F4]/5' : 'border-slate-300 bg-slate-100'}
                `}>
                  <img 
                    src={boss.avatar} 
                    alt={boss.name} 
                    className={`w-12 h-12 md:w-28 md:h-28 rounded-full object-cover shadow-2xl ${!isUnlocked ? 'brightness-50' : ''}`}
                    style={{ objectPosition: 'center 15%' }}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm md:text-3xl">🔒</span>
                    </div>
                  )}
                  {index < unlockedIndex && (
                    <div className="absolute -bottom-1 -right-1 bg-[#FFD700] text-white text-[7px] md:text-xs p-1 rounded-full border-2 border-white shadow-lg animate-pulse">
                      ✅
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className={`text-[10px] md:text-base font-black uppercase tracking-tighter leading-tight mb-0.5 md:mb-1
                    ${index < unlockedIndex ? 'text-[#C5A000]' : isUnlocked ? 'text-[#3164F4]' : 'text-slate-500'}
                  `}>
                    {boss.name.split(' ')[0]}<br/>{boss.name.split(' ')[1] || ''}
                  </h3>
                  <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.05em] md:tracking-[0.1em] text-[#FF4E6B] opacity-80 mb-1.5 md:mb-4">
                    {boss.role}
                  </p>
                  
                  {isUnlocked && (
                    <div className="space-y-0.5 md:space-y-2 mt-1 md:mt-4 pt-1.5 md:pt-4 border-t-2 border-slate-100">
                      <div className="flex flex-col items-center">
                        <span className="text-[6px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {index < unlockedIndex ? 'DESAFIO' : 'STATUS'}
                        </span>
                        <span className={`text-[10px] md:text-lg font-black ${index < unlockedIndex ? 'text-[#C5A000]' : 'text-[#3164F4]'}`}>
                          {index < unlockedIndex ? 'CONCLUÍDO' : 'DISPONÍVEL'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                {isCurrent && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#FF4E6B] text-white font-black text-[6px] md:text-[9px] uppercase tracking-widest px-1.5 md:px-4 py-0.5 md:py-2 rounded-tl-lg md:rounded-tl-2xl shadow-lg">
                    ATUAL
                  </div>
                )}
                {index < unlockedIndex && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#FFD700] text-slate-800 font-black text-[6px] md:text-[9px] uppercase tracking-widest px-1.5 md:px-4 py-0.5 md:py-2 rounded-tl-lg md:rounded-tl-2xl shadow-lg">
                    VENCIDO
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mt-3 md:mt-8 text-center pb-1">
        <div className="inline-flex items-center gap-2 md:gap-4 bg-black/40 backdrop-blur-xl px-4 py-1.5 md:px-10 md:py-3 rounded-full border border-white/20 shadow-2xl">
          <span className="text-[#FF4E6B] text-sm md:text-xl animate-pulse">⚡</span>
          <p className="text-white font-black uppercase text-[7px] md:text-xs tracking-widest">
            Vença <span className="text-[#FF4E6B]">Patrícia Oliveira</span> para o desafio final!
          </p>
          <span className="text-[#FF4E6B] text-sm md:text-xl animate-pulse">⚡</span>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(49, 100, 244, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StageSelect;
