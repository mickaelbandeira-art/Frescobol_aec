import React, { useState, useEffect } from 'react';
import { Screen, User, GameState, Product, Boss } from './types/game';
import LoginScreen from './components/LoginScreen';
import ProductSelect from './components/ProductSelect';
import StageSelect from './components/StageSelect';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import StartScreen from './components/StartScreen';
import { BOSSES, PRODUCTS } from './constants/gameData';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('START');
  const [user, setUser] = useState<User | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [urlProduct, setUrlProduct] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    player: null,
    boss: null,
    product: null,
    currentStageIndex: 0,
    unlockedStageIndex: 0,
    score: 0,
    highScore: 0,
    rally: 0,
    lives: 3,
    timeElapsed: 0,
    stars: 0,
    totalScore: 0
  });

  useEffect(() => {
    const initSession = async () => {
      const savedUser = localStorage.getItem('frescobol_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
        
        // Sync/Fetch UUID from Supabase if missing
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('matricula', userData.matricula)
            .single();
          
          if (profile) {
            setUser({ ...userData, id: profile.id });
          } else {
            // Re-sync if profile somehow missing
            const { data: newProfile } = await supabase
              .from('profiles')
              .upsert({ 
                email: userData.email, 
                matricula: userData.matricula,
                name: userData.email.split('@')[0]
              }, { onConflict: 'matricula' })
              .select()
              .single();
            if (newProfile) setUser({ ...userData, id: newProfile.id });
          }
        } catch (err) {
          console.error('Session sync error:', err);
        }
      }

      const savedProgression = localStorage.getItem('frescobol_unlocked_stage');
      if (savedProgression) {
        setGameState(prev => ({ ...prev, unlockedStageIndex: parseInt(savedProgression) }));
      }

      const savedHighScore = localStorage.getItem('frescobol_high_score');
      if (savedHighScore) {
        setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
      }
    };

    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    if (p) {
      const product = PRODUCTS.find(prod => prod.id === p);
      if (product) {
        setGameState(prev => ({ ...prev, product }));
        setUrlProduct(p);
      }
    }

    initSession();
  }, []);

  const handleStartGame = () => {
    if (user) {
      setCurrentScreen('PRODUCT_SELECT');
    } else {
      setCurrentScreen('LOGIN');
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('frescobol_user', JSON.stringify(userData));
    
    if (userData.product_id) {
      const product = PRODUCTS.find(p => p.id === userData.product_id);
      if (product) {
        setGameState(prev => ({ ...prev, product }));
        setCurrentScreen('STAGE_SELECT');
      } else {
        setCurrentScreen('PRODUCT_SELECT');
      }
    } else if (gameState.product) {
      setCurrentScreen('STAGE_SELECT');
    } else {
      setCurrentScreen('PRODUCT_SELECT');
    }

    // Sync with Supabase
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({ 
          email: userData.email, 
          matricula: userData.matricula || userData.product_id || 'CLIENT',
          name: userData.email.split('@')[0]
        }, { onConflict: 'matricula' })
        .select()
        .single();

      if (error) console.error('Error syncing profile:', error);
      if (profile) {
        setUser({ ...userData, id: profile.id });
      }
    } catch (err) {
      console.error('Failed to sync with Supabase:', err);
    }
  };

  const handleProductSelect = (product: Product) => {
    setGameState(prev => ({ ...prev, product }));
    setCurrentScreen('STAGE_SELECT');
  };

  const handleStageSelect = (stageIndex: number) => {
    const boss = BOSSES[stageIndex];
    setGameState(prev => ({ 
      ...prev, 
      boss,
      currentStageIndex: stageIndex,
      player: { name: user?.email.split('@')[0] || 'Player', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.matricula}` },
      score: 0, 
      rally: 0, 
      lives: 3, 
      timeElapsed: 0, 
      stars: 0 
    }));
    setCurrentScreen('GAME');
  };

  const handleGameOver = async (finalScore: number, finalTime: number, finalStars: number) => {
    const isWin = finalScore >= (gameState.boss?.targetScore || 0);
    
    if (isWin && gameState.currentStageIndex === gameState.unlockedStageIndex) {
        const nextStage = gameState.unlockedStageIndex + 1;
        if (nextStage < BOSSES.length) {
            setGameState(prev => ({ ...prev, unlockedStageIndex: nextStage }));
            localStorage.setItem('frescobol_unlocked_stage', nextStage.toString());
        }
    }

    // Update state
    const newHighScore = finalScore > gameState.highScore ? finalScore : gameState.highScore;
    if (finalScore > gameState.highScore) {
      localStorage.setItem('frescobol_high_score', finalScore.toString());
    }

    setGameState(prev => ({ 
      ...prev, 
      highScore: newHighScore, 
      score: finalScore,
      totalScore: finalScore,
      timeElapsed: finalTime,
      stars: finalStars
    }));

    // Update/Upsert to Supabase rankings (One record per user & product)
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('rankings')
          .upsert({
            user_id: user.id,
            product_id: gameState.product?.id || 'unknown',
            score: finalScore,
            stars: finalStars,
            time_elapsed: finalTime,
            stage_index: gameState.currentStageIndex
          }, { 
            onConflict: 'user_id,product_id',
            ignoreDuplicates: false 
          });
        
        if (error) console.error('Error saving ranking:', error);
      } catch (err) {
        console.error('Failed to save ranking to Supabase:', err);
      }
    }

    setCurrentScreen('GAME_OVER');
  };

  const handleRestart = () => {
    setCurrentScreen('STAGE_SELECT');
  };

  const handleLogout = () => {
    localStorage.removeItem('frescobol_user');
    localStorage.removeItem('frescobol_unlocked_stage');
    setUser(null);
    setGameState(prev => ({ ...prev, unlockedStageIndex: 0 }));
    setCurrentScreen('LOGIN');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2B3C] font-sans selection:bg-[#EAC086] selection:text-white">
      {currentScreen === 'START' && <StartScreen onStart={handleStartGame} />}
      
      {currentScreen === 'LOGIN' && (
        <LoginScreen 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('START')} 
          preSelectedProductId={urlProduct}
        />
      )}
      
      {currentScreen === 'PRODUCT_SELECT' && (
        <ProductSelect 
          onSelect={handleProductSelect} 
          onBack={() => setCurrentScreen('START')} 
          activeProductId={gameState.product?.id}
        />
      )}
      
      {currentScreen === 'STAGE_SELECT' && (
        <StageSelect 
          unlockedIndex={gameState.unlockedStageIndex}
          onSelect={handleStageSelect} 
          onBack={() => setCurrentScreen('PRODUCT_SELECT')}
          onLogout={handleLogout}
          onShowRanking={() => setCurrentScreen('LEADERBOARD')}
          user={user}
        />
      )}
      
      {currentScreen === 'LEADERBOARD' && (
        <Leaderboard 
          gameState={gameState} 
          onRestart={() => setCurrentScreen('STAGE_SELECT')}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'GAME' && (
        <GameCanvas 
          gameState={gameState} 
          onGameOver={handleGameOver} 
          onBack={() => setCurrentScreen('STAGE_SELECT')}
        />
      )}
      
      {currentScreen === 'GAME_OVER' && (
        <Leaderboard 
          gameState={gameState} 
          onRestart={handleRestart}
          onLogout={handleLogout}
        />
      )}

      {/* Admin Panel Entry - Hidden/Discreet */}
      <button 
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-2 right-2 w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 transition-all flex items-center justify-center text-[10px] text-white/10 z-[100]"
        title="Admin"
      >
        ⚙️
      </button>

      {/* Admin Modal */}
      {showAdmin && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[30px] p-8 max-w-lg w-full shadow-2xl border-4 border-[#3164F4]">
            <h2 className="text-3xl font-black text-[#3164F4] mb-6 uppercase tracking-tighter">Painel Administrativo</h2>
            <div className="space-y-4">
              {PRODUCTS.map(p => {
                const url = `${window.location.origin}${window.location.pathname}?p=${p.id}`;
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <div>
                      <span className="font-black text-slate-800 uppercase block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 break-all">{url}</span>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        alert(`Link para ${p.name} copiado!`);
                      }}
                      className="ml-4 px-4 py-2 bg-[#3164F4] text-white text-[10px] font-black rounded-lg hover:bg-[#3164F4]/80 transition-all"
                    >
                      COPIAR
                    </button>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => setShowAdmin(false)}
              className="mt-8 w-full py-4 bg-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-300 transition-all uppercase tracking-widest text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
