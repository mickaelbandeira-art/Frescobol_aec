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
      className="h-screen w-screen bg-cover bg-center flex flex-col p-4 md:p-6 relative overflow-hidden"
      style={{ backgroundImage: "url('/assets/beach_bg.png')" }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

      <header className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-3 md:gap-4 mb-3 md:mb-8">
        <div className="bg-white/95 p-3 md:p-6 rounded-[20px] md:rounded-[40px] border-[3px] md:border-8 border-[#3164F4] shadow-2xl transform md:-rotate-1 text-center md:text-left transition-all">
          <h2 className="text-lg md:text-4xl font-black uppercase tracking-tighter leading-none text-[#3164F4]">
            Hierarquia <span className="text-[#FF4E6B]">Corporativa</span>
          </h2>
          <p className="mt-0.5 md:mt-1 text-slate-600 font-bold uppercase text-[7px] md:text-xs tracking-widest">
            Olá, <span className="text-[#3164F4]">{user?.email?.split('@')[0] || 'Player'}</span>! Vença os gestores para subir.
          </p>
        </div>
        <div className="flex gap-2 md:gap-4 w-full md:w-auto justify-center sm:justify-end">
          <button 
            onClick={onBack}
            className="flex-1 md:flex-none px-3 py-1.5 md:px-6 md:py-3 bg-white text-[#3164F4] font-black text-[9px] md:text-xs uppercase tracking-widest rounded-full shadow-lg border-2 md:border-4 border-[#3164F4] hover:bg-slate-50 transition-all duration-300"
          >
            ← Voltar
          </button>
          <button 
            onClick={onShowRanking}
            className="flex-1 md:flex-none px-3 py-1.5 md:px-6 md:py-3 bg-[#FF4E6B] text-white font-black text-[9px] md:text-xs uppercase tracking-widest rounded-full shadow-lg border-2 md:border-4 border-white hover:bg-white hover:text-[#FF4E6B] hover:border-[#FF4E6B] transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2"
          >
            <span className="text-xs md:text-base">🏆</span> RANKING
          </button>
          <button 
            onClick={onLogout}
            className="px-3 py-1.5 md:px-6 md:py-3 bg-white text-[#3164F4] font-black text-[9px] md:text-xs uppercase tracking-widest rounded-full shadow-lg border-2 md:border-4 border-[#3164F4] hover:bg-[#3164F4] hover:text-white transition-all duration-300"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex items-center justify-center min-h-0 overflow-hidden">
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
                          {index < unlockedIndex ? 'SCORE VENCIDO' : 'Meta'}
                        </span>
                        <span className={`text-[10px] md:text-lg font-black ${index < unlockedIndex ? 'text-[#C5A000]' : 'text-[#3164F4]'}`}>
                          {boss.targetScore} PT
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
