import React, { useEffect, useState } from 'react';
import { GameState, LeaderboardEntry, Product } from '../types/game';
import { supabase } from '../lib/supabaseClient';
import { PRODUCTS, BOSSES } from '../constants/gameData';

interface LeaderboardProps {
  gameState: GameState;
  onRestart: () => void;
  onLogout: () => void;
  onNextPhase?: () => void;
}

// Extend LeaderboardEntry for internal UI needs
interface EnhancedLeaderboardEntry extends LeaderboardEntry {
  type: 'colaborador' | 'cliente';
  matricula: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ gameState, onRestart, onLogout, onNextPhase }) => {
  const [rankings, setRankings] = useState<EnhancedLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data, error } = await supabase
          .from('rankings')
          .select('*, profiles(name, avatar_url, type, matricula)')
          .order('stage_index', { ascending: false })
          .order('score', { ascending: true })
          .limit(50);
        
        if (error) throw error;
        
        const formatted: EnhancedLeaderboardEntry[] = (data || []).map((item: any) => ({
          name: item.profiles?.name || 'Player',
          product: item.product_id || 'GERAL',
          score: 100, // Legacy
          stars: 0,
          time: item.score,
          stage: item.stage_index || 0, // CORRECTED: stage_index 1 = 1 level finished
          date: new Date(item.created_at).toLocaleDateString(),
          type: (item.profiles?.type as 'colaborador' | 'cliente') || 'cliente',
          matricula: item.profiles?.matricula || '--'
        }));
        
        setRankings(formatted);
      } catch (err) {
        console.error('Error fetching rankings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const getProductLogo = (productId: string) => {
    return PRODUCTS.find(p => p.id === productId)?.logo || '/assets/logo_summer.png';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWin = gameState.stars >= 2 || (gameState.currentStageIndex >= 0 && gameState.unlockedStageIndex > gameState.currentStageIndex);

  return (
    <div className="min-h-screen bg-[#3164F4] p-4 md:p-8 overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <button 
            onClick={onRestart}
            className="w-full md:w-auto px-10 py-4 bg-white text-[#3164F4] font-black rounded-lg shadow-xl hover:bg-[#FF4E6B] hover:text-white transition-all uppercase tracking-widest text-xs border-2 border-white"
          >
            ← VOLTAR
          </button>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none italic shadow-sm">SUMMER RANK</h1>
            <p className="text-white/60 font-black uppercase text-[10px] md:text-sm tracking-[0.4em] mt-2">Performance Corporativa AeC</p>
          </div>

          <button 
            onClick={onLogout}
            className="w-full md:w-auto px-10 py-4 bg-[#FF4E6B] text-white font-black rounded-lg shadow-xl hover:bg-white hover:text-[#FF4E6B] transition-all uppercase tracking-widest text-xs border-2 border-[#FF4E6B]"
          >
            SAIR
          </button>
        </div>

        {/* Results Banner (Simplified Typographic with Boss Photo) */}
        {gameState.boss && (
          <div className="mb-10 bg-white border-l-[12px] md:border-l-[24px] border-[#FF4E6B] p-6 md:p-12 shadow-2xl skew-x-[-2deg]">
             <div className="skew-x-[2deg]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex-1">
                    <span className="text-[#FF4E6B] font-black text-sm md:text-xl uppercase tracking-widest mb-2 block">{isWin ? 'Desafio Concluído' : 'Desafio Falhou'}</span>
                    <h2 className="text-4xl md:text-7xl font-black text-[#3164F4] uppercase tracking-tighter leading-[0.9] mb-4">
                      {gameState.player?.name} <span className="text-[#FF4E6B]">{isWin ? 'VENCEU' : 'PERDEU PARA'}</span> {gameState.boss.name}!
                    </h2>
                    <div className="flex gap-4">
                      <div className="bg-slate-100 px-6 py-3 border-b-4 border-slate-300">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nesta Fase</span>
                        <span className="text-2xl md:text-4xl font-black text-[#3164F4]">{formatTime(gameState.lastStageTime)}</span>
                      </div>
                      <div className="bg-[#3164F4] px-6 py-3 border-b-4 border-[#1E40AF]">
                        <span className="block text-[10px] font-black text-white/50 uppercase tracking-widest">Tempo Total</span>
                        <span className="text-2xl md:text-4xl font-black text-white">{formatTime(gameState.totalScore)}</span>
                      </div>
                      {onNextPhase && (
                        <button 
                          onClick={onNextPhase} 
                          className="bg-[#FF4E6B] md:ml-4 px-6 md:px-8 py-3 border-b-4 border-[#E03A56] hover:bg-[#E03A56] hover:-translate-y-1 transition-all flex flex-col justify-center items-center group cursor-pointer skew-x-[0deg]"
                        >
                          <span className="block text-[10px] font-black text-white/80 uppercase tracking-widest group-hover:text-white transition-colors">Avançar para</span>
                          <span className="text-xl md:text-2xl font-black text-white uppercase mt-0.5 leading-none">Próxima Fase</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Boss Avatar Display */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4E6B] to-[#3164F4] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      <img 
                        src={gameState.boss.avatar} 
                        alt={gameState.boss.name} 
                        className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[#FF4E6B] text-white p-2 rounded-full shadow-lg border-2 border-white">
                        <span className="text-xl">{isWin ? '💔' : '🏆'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 bg-slate-50 p-4 border-2 border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-2">Hierarquia AeC</span>
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xl ${i < (gameState.currentStageIndex + 1) ? 'grayscale-0' : 'grayscale opacity-20'}`}>🏆</span>
                      ))}
                    </div>
                    <span className="text-xs font-black text-[#3164F4] uppercase">Nível {gameState.currentStageIndex + 1} / 5</span>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* Rankings Table (Clean & Objective) */}
        <div className="bg-white p-4 md:p-10 shadow-2xl border-t-[12px] border-[#3164F4]">
          {isLoading ? (
            <div className="text-center py-24 flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-8 border-slate-100 border-t-[#3164F4] rounded-full animate-spin"></div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Sincronizando Dados...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-[#3164F4] font-black text-[10px] md:text-sm uppercase tracking-widest border-b-2 border-slate-200">
                    <th className="py-6 px-4 text-left">#</th>
                    <th className="py-6 px-4 text-left">Tipo</th>
                    <th className="py-6 px-4 text-left">Identificação</th>
                    <th className="py-6 px-4 text-left">Produto</th>
                    <th className="py-6 px-4 text-left">Nível</th>
                    <th className="py-6 px-4 text-right">Tempo Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                  {rankings.map((entry, index) => (
                    <tr key={index} className={`group hover:bg-slate-50 transition-all ${entry.name === gameState.player?.name ? 'bg-yellow-50' : ''}`}>
                      <td className="py-6 px-4">
                        <span className={`text-2xl font-black ${index < 3 ? 'text-[#FF4E6B]' : 'text-slate-300'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <span className={`text-[8px] font-black uppercase border-2 px-2 py-0.5 ${
                          entry.type === 'colaborador' ? 'border-[#3164F4] text-[#3164F4]' : 'border-[#FF4E6B] text-[#FF4E6B]'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex flex-col">
                          <span className={`${entry.name === gameState.player?.name ? 'text-[#FF4E6B]' : 'text-slate-900'} font-black text-lg uppercase tracking-tight`}>
                            {entry.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {entry.type === 'colaborador' ? `Matrícula: ${entry.matricula}` : 'Acesso Cliente'}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <img src={getProductLogo(entry.product)} alt={entry.product} className="h-6 md:h-10 grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex gap-1.5 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < entry.stage ? 'filter-none' : 'invert opacity-20'}`}>🏆</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-right">
                        <span className="text-3xl font-black text-slate-900 tabular-nums italic">{formatTime(entry.time)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default Leaderboard;
