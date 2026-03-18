import React, { useEffect, useState } from 'react';
import { GameState, LeaderboardEntry } from '../types/game';
import { supabase } from '../lib/supabaseClient';

interface LeaderboardProps {
  gameState: GameState;
  onRestart: () => void;
  onLogout: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameState, onRestart, onLogout }) => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data, error } = await supabase
          .from('rankings')
          .select(`
            score,
            stars,
            time_elapsed,
            created_at,
            product_id,
            profiles (
              name
            )
          `)
          .order('score', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedRankings: LeaderboardEntry[] = (data || []).map((item: any) => ({
          name: item.profiles?.name || 'Desconhecido',
          product: item.product_id,
          score: item.score,
          stars: item.stars,
          time: item.time_elapsed,
          date: new Date(item.created_at).toISOString().split('T')[0]
        }));

        setRankings(formattedRankings);
      } catch (err) {
        console.error('Error fetching rankings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const isWin = gameState.score >= (gameState.boss?.targetScore || 0);

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col p-6 items-center justify-center relative overflow-hidden" 
      style={{ backgroundImage: "url('/assets/beach_bg.png')" }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px]" />

      <div className="relative z-10 max-w-4xl w-full bg-white/95 rounded-[25px] md:rounded-[40px] p-4 md:p-12 shadow-2xl border-4 md:border-8 border-[#3164F4]">
        <header className="mb-4 md:mb-10 text-center">
          <img src="/assets/logo_summer.png" alt="Logo" className="max-w-[120px] md:max-w-[200px] mx-auto mb-3 md:mb-4" />
          <h2 className="text-3xl md:text-6xl font-black text-[#FF4E6B] tracking-tighter uppercase leading-none mb-3 md:mb-6">
            {isWin ? (
              <>
                <span className="text-[#3164F4]">VOCÊ</span> VENCEU!
              </>
            ) : (
              <>
                FIM DE <span className="text-[#3164F4]">JOGO!</span>
              </>
            )}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 md:gap-8 items-center bg-[#3164F4]/5 p-3 md:p-6 rounded-xl md:rounded-3xl border-2 md:border-4 border-[#3164F4]">
            <div className="flex flex-col">
              <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Final</span>
              <span className="text-2xl md:text-5xl font-black text-[#3164F4]">{gameState.score}</span>
            </div>
            <div className="w-px h-6 md:h-12 bg-[#3164F4]/20 hidden xs:block"></div>
            <div className="flex flex-col">
              <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo</span>
              <span className="text-lg md:text-3xl font-black text-slate-700">{gameState.timeElapsed}s</span>
            </div>
            <div className="w-px h-6 md:h-12 bg-[#3164F4]/20 hidden xs:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Estrelas</span>
              <div className="flex gap-1 md:gap-2 pt-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-lg md:text-2xl ${i < gameState.stars ? 'grayscale-0 animate-bounce' : 'grayscale opacity-30'}`} style={{ animationDelay: `${i * 0.2}s` }}>
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="mb-6 md:mb-10">
          <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] mb-4 text-[#3164F4] flex justify-between items-center px-2">
            <span>Ranking Corporativo AEC</span>
            <span className="text-slate-400 text-[8px] md:text-[10px]">Verão 2026</span>
          </h3>
          
          <div className="space-y-2 md:space-y-3 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <span className="w-10 h-10 md:w-12 md:h-12 border-4 border-[#3164F4]/30 border-t-[#3164F4] rounded-full animate-spin"></span>
              </div>
            ) : rankings.length > 0 ? (
              rankings.map((entry, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between items-center p-2.5 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-4 transition-all ${
                    entry.name === gameState.player?.name ? 'border-[#FF4E6B] bg-[#FF4E6B]/5' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className={`text-sm md:text-xl font-black w-6 md:w-8 ${index < 3 ? 'text-[#FFD700]' : 'text-slate-300'}`}>
                      #{index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm md:text-lg font-black text-slate-700 uppercase leading-none">
                        {entry.name} <span className="text-[8px] md:text-[10px] text-[#3164F4] font-black">[{entry.product}]</span>
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${i < entry.stars ? 'bg-[#FFD700]' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm md:text-xl font-black text-[#3164F4]">{entry.score} <span className="text-[8px] md:text-[10px]">pts</span></span>
                    <span className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase">{entry.time}s</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">
                Nenhum recorde ainda.
              </div>
            )}
          </div>
        </section>

        <footer className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button 
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-[#FF4E6B] to-[#FF6B6B] text-white font-black text-base md:text-xl py-3.5 md:py-5 rounded-xl md:rounded-2xl shadow-[0_5px_0_0_#D13450] md:shadow-[0_8px_0_0_#D13450] hover:translate-y-1 hover:shadow-[0_2px_0_0_#D13450] active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3"
          >
            <span className="text-xl md:text-2xl">{isWin ? '🏆' : '🔄'}</span>
            {isWin ? 'ADIANTE' : 'RECOBRAR'}
          </button>
          <button 
            onClick={onLogout}
            className="px-6 md:px-10 bg-white border-2 md:border-4 border-[#3164F4] text-[#3164F4] font-black text-xs md:text-lg py-3.5 md:py-5 rounded-xl md:rounded-2xl shadow-[0_5px_0_0_#1E40AF] md:shadow-[0_8px_0_0_#1E40AF] hover:translate-y-1 hover:shadow-[0_2px_0_0_#1E40AF] active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3"
          >
            SAIR
          </button>
        </footer>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3164F422; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3164F444; }
      `}</style>
    </div>
  );
};

export default Leaderboard;
