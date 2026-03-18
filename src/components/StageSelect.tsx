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

      <header className="relative z-10 max-w-7xl mx-auto w-full flex justify-between items-start mb-4 md:mb-8">
        <div className="bg-white/95 p-4 md:p-6 rounded-[30px] md:rounded-[40px] border-4 md:border-8 border-[#3164F4] shadow-2xl transform -rotate-1">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-[#3164F4]">
            Hierarquia <span className="text-[#FF4E6B]">Corporativa</span>
          </h2>
          <p className="mt-1 text-slate-600 font-bold uppercase text-[9px] md:text-xs tracking-widest">
            Olá, <span className="text-[#3164F4]">{user?.email?.split('@')[0] || 'Player'}</span>! Vença os gestores para subir.
          </p>
        </div>
        <div className="flex gap-2 md:gap-4">
          <button 
            onClick={onBack}
            className="px-4 py-2 md:px-6 md:py-3 bg-white text-[#3164F4] font-black text-[10px] md:text-xs uppercase tracking-widest rounded-full shadow-lg border-2 md:border-4 border-[#3164F4] hover:bg-slate-50 transition-all duration-300"
          >
            ← Voltar
          </button>
          <button 
            onClick={onShowRanking}
            className="px-4 py-2 md:px-6 md:py-3 bg-[#FF4E6B] text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-full shadow-lg border-2 md:border-4 border-white hover:bg-white hover:text-[#FF4E6B] hover:border-[#FF4E6B] transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-sm md:text-base">🏆</span> RANKING
          </button>
          <button 
            onClick={onLogout}
            className="px-4 py-2 md:px-6 md:py-3 bg-white text-[#3164F4] font-black text-[10px] md:text-xs uppercase tracking-widest rounded-full shadow-lg border-2 md:border-4 border-[#3164F4] hover:bg-[#3164F4] hover:text-white transition-all duration-300"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex-grow flex items-center justify-center min-h-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 w-full h-full md:h-auto items-center overflow-y-auto md:overflow-visible py-2 custom-scrollbar">
          {BOSSES.map((boss, index) => {
            const isUnlocked = index <= unlockedIndex;
            const isCurrent = index === unlockedIndex;
            
            return (
              <button
                key={boss.id}
                disabled={!isUnlocked}
                onClick={() => onSelect(index)}
                className={`group relative flex flex-col items-center p-3 md:p-5 rounded-[30px] md:rounded-[40px] border-4 md:border-8 transition-all duration-300 overflow-hidden
                  ${isUnlocked 
                    ? 'bg-white/95 border-white shadow-xl hover:-translate-y-2 hover:border-[#3164F4]' 
                    : 'bg-slate-200/50 border-slate-300/50 opacity-60 cursor-not-allowed scale-95 grayscale'
                  }
                  ${isCurrent ? 'ring-4 md:ring-8 ring-[#FF4E6B] ring-offset-4 ring-offset-transparent' : ''}
                `}
              >
                {/* Stage Indicator / Success Badge */}
                <div className={`absolute top-2 left-2 w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-xs md:text-sm border-2 md:border-4 transition-all duration-500
                  ${index < unlockedIndex 
                    ? 'bg-[#FFD700] text-white border-white scale-110 shadow-lg' 
                    : isUnlocked ? 'bg-[#3164F4] text-white border-white' : 'bg-slate-400 text-white border-slate-500'}
                `}>
                  {index < unlockedIndex ? '🏆' : index + 1}
                </div>

                {/* Avatar Container */}
                <div className={`relative mb-3 md:mb-4 p-1 rounded-full border-4 md:border-8 transition-transform duration-500 group-hover:scale-105
                  ${index < unlockedIndex ? 'border-[#FFD700]/30 bg-[#FFD700]/10' : isUnlocked ? 'border-[#3164F4]/10 bg-[#3164F4]/5' : 'border-slate-300 bg-slate-100'}
                `}>
                  <img 
                    src={boss.avatar} 
                    alt={boss.name} 
                    className={`w-16 h-16 md:w-28 md:h-28 rounded-full object-cover shadow-2xl ${!isUnlocked ? 'brightness-50' : ''}`}
                    style={{ objectPosition: 'center 15%' }}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl md:text-3xl">🔒</span>
                    </div>
                  )}
                  {index < unlockedIndex && (
                    <div className="absolute -bottom-1 -right-1 bg-[#FFD700] text-white text-[8px] md:text-xs p-1 rounded-full border-2 border-white shadow-lg animate-pulse">
                      ✅
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className={`text-xs md:text-base font-black uppercase tracking-tighter leading-tight mb-1
                    ${index < unlockedIndex ? 'text-[#C5A000]' : isUnlocked ? 'text-[#3164F4]' : 'text-slate-500'}
                  `}>
                    {boss.name.split(' ')[0]}<br/>{boss.name.split(' ')[1] || ''}
                  </h3>
                  <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] text-[#FF4E6B] opacity-80 mb-2 md:mb-4">
                    {boss.role}
                  </p>
                  
                  {isUnlocked && (
                    <div className="space-y-1 md:space-y-2 mt-2 md:mt-4 pt-2 md:pt-4 border-t-2 border-slate-100">
                      <div className="flex flex-col items-center">
                        <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {index < unlockedIndex ? 'SCORE VENCIDO' : 'Meta'}
                        </span>
                        <span className={`text-sm md:text-lg font-black ${index < unlockedIndex ? 'text-[#C5A000]' : 'text-[#3164F4]'}`}>
                          {boss.targetScore} PT
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                {isCurrent && (
                  <div className="absolute -bottom-1 -right-1 bg-[#FF4E6B] text-white font-black text-[7px] md:text-[9px] uppercase tracking-widest px-2 md:px-4 py-1 md:py-2 rounded-tl-xl md:rounded-tl-2xl shadow-lg">
                    ATUAL
                  </div>
                )}
                {index < unlockedIndex && (
                  <div className="absolute -bottom-1 -right-1 bg-[#FFD700] text-slate-800 font-black text-[7px] md:text-[9px] uppercase tracking-widest px-2 md:px-4 py-1 md:py-2 rounded-tl-xl md:rounded-tl-2xl shadow-lg">
                    VENCIDO
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mt-4 md:mt-8 text-center pb-2">
        <div className="inline-flex items-center gap-2 md:gap-4 bg-black/40 backdrop-blur-xl px-6 py-2 md:px-10 md:py-3 rounded-full border border-white/20 shadow-2xl">
          <span className="text-[#FF4E6B] text-lg md:text-xl animate-pulse">⚡</span>
          <p className="text-white font-black uppercase text-[8px] md:text-xs tracking-widest">
            Vença <span className="text-[#FF4E6B]">Patrícia Oliveira</span> para o desafio final!
          </p>
          <span className="text-[#FF4E6B] text-lg md:text-xl animate-pulse">⚡</span>
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
