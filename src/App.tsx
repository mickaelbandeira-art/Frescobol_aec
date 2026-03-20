import React, { useState, useEffect } from 'react';
import { Screen, User, GameState, Product, Boss } from './types/game';
import LoginScreen from './components/LoginScreen';
import ProductSelect from './components/ProductSelect';
import StageSelect from './components/StageSelect';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import StartScreen from './components/StartScreen';
import WelcomeModal from './components/WelcomeModal';
import { BOSSES, PRODUCTS } from './constants/gameData';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('START');
  const [user, setUser] = useState<User | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
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
    totalScore: 0,
    lastStageTime: 0
  });

  useEffect(() => {
    const initSession = async () => {
      const savedUser = localStorage.getItem('frescobol_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Important: Re-sync profile to get the most recent DB ID
        await syncProfile(userData);
      }

      const savedProgression = localStorage.getItem('frescobol_unlocked_stage');
      if (savedProgression) {
        setGameState(prev => ({ ...prev, unlockedStageIndex: parseInt(savedProgression) }));
      }

      const savedHighScore = localStorage.getItem('frescobol_high_score');
      if (savedHighScore) {
        setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
      }

      const savedProduct = localStorage.getItem('frescobol_product');
      if (savedProduct && !urlProduct) {
        const product = PRODUCTS.find(p => p.id === savedProduct);
        if (product) {
          setGameState(prev => ({ ...prev, product }));
        }
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

  const handleStartGame = React.useCallback(() => {
    if (user) {
      if (gameState.product) {
        setCurrentScreen('STAGE_SELECT');
      } else {
        setCurrentScreen('PRODUCT_SELECT');
      }
    } else {
      setCurrentScreen('LOGIN');
    }
  }, [user, gameState.product]);

  const syncProfile = async (userData: User) => {
    try {
      console.log('Syncing profile for:', userData.email);
        const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({ 
          email: userData.email, 
          matricula: userData.matricula || userData.product_id || 'CLIENT',
          name: userData.email.split('@')[0],
          type: userData.type || 'cliente'
        }, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        console.error('Error syncing profile:', error);
      } else if (profile) {
        console.log('Profile synced successfully:', profile.id);
        setUser(prev => prev ? { ...prev, id: profile.id } : { ...userData, id: profile.id });

        // IMPORTANT: Restore progression from DB
        const { data: rankData } = await supabase
          .from('rankings')
          .select('stage_index, score')
          .eq('user_id', profile.id) // Corrected to user_id
          .maybeSingle(); // Better for cases where it might not exist
        
        if (rankData) {
          setGameState(prev => ({ 
            ...prev, 
            unlockedStageIndex: rankData.stage_index || 0,
            totalScore: rankData.score || 0
          }));
        } else {
          // Explicit reset for new users without rankings yet
          setGameState(prev => ({ 
            ...prev, 
            unlockedStageIndex: 0, // Start at 0 (first stage)
            totalScore: 0 
          }));
        }

        return profile.id;
      }
    } catch (err) {
      console.error('Failed to sync with Supabase:', err);
    }
    return null;
  };

  const handleLogin = React.useCallback(async (userData: User) => {
    // Show welcome modal immediately for better responsiveness
    setShowWelcome(true);
    
    setUser(userData);
    localStorage.setItem('frescobol_user', JSON.stringify(userData));
    
    if (userData.product_id) {
      const productData = PRODUCTS.find(p => p.id === userData.product_id);
      if (productData) {
        setGameState(prev => ({ 
          ...prev, 
          product: productData,
          unlockedStageIndex: 0, // Reset for new login
          totalScore: 0,
          score: 0,
          lastStageTime: 0
        }));
      }
    }

    // Routing based on type
    if (userData.type === 'colaborador') {
      setCurrentScreen('PRODUCT_SELECT');
    } else {
      // For clients, if they selected a product, go to hierarchy
      if (userData.product_id) {
        setCurrentScreen('STAGE_SELECT');
      } else {
        setCurrentScreen('PRODUCT_SELECT');
      }
    }

    // Sync with Supabase (which also restores progression)
    await syncProfile(userData);
  }, []);

  const handleProductSelect = React.useCallback((product: Product) => {
    localStorage.setItem('frescobol_product', product.id);
    setGameState(prev => ({ 
      ...prev, 
      product,
      totalScore: 0,
      score: 0
    }));
    setCurrentScreen('STAGE_SELECT');
  }, []);

  const handleRestart = React.useCallback(() => {
    // Full reset for a brand new run
    setGameState(prev => ({
      ...prev,
      score: 0,
      totalScore: 0,
      stars: 0,
      lives: 3,
      timeElapsed: 0
      // unlockedStageIndex removed from reset to preserve progression
    }));
    setCurrentScreen('STAGE_SELECT');
  }, []);

  const handleNextStage = React.useCallback(() => {
    // Preserve totalScore (cumulative time) and move to stage select
    setCurrentScreen('STAGE_SELECT');
  }, []);

  const handleStageSelect = React.useCallback((stageIndex: number) => {
    const boss = BOSSES[stageIndex];
    setGameState(prev => ({ 
      ...prev, 
      boss,
      currentStageIndex: stageIndex,
      player: { 
        name: user?.email?.split('@')[0] || 'Player', 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.matricula || 'default'}` 
      },
      score: 0, 
      rally: 0,
      // DEFINTIVE FIX: If starting stage 0, reset cumulative totals
      totalScore: stageIndex === 0 ? 0 : prev.totalScore,
      lastStageTime: stageIndex === 0 ? 0 : prev.lastStageTime,
      stars: 0
    }));
    setCurrentScreen('GAME');
  }, [user]);

  const handleGameOver = React.useCallback(async (playerPoints: number, opponentPoints: number, time: number) => {
    const isWin = playerPoints >= 2;
    const isPerfectWin = playerPoints === 2 && opponentPoints === 0;

    // FETCH LATEST SCORE FROM DB TO PREVENT LATENCY/STALE STATE ISSUES
    let currentDBScore = 0;
    if (user?.id) {
      const { data: rankEntry } = await supabase
        .from('rankings')
        .select('score')
        .eq('user_id', user.id)
        .maybeSingle();
      if (rankEntry) currentDBScore = rankEntry.score || 0;
    }

    const nextTotalScore = isWin 
      ? (gameState.currentStageIndex === 0 ? time : (currentDBScore + time)) 
      : (currentDBScore || gameState.totalScore);
    
    let nextLives = gameState.lives;
    if (isWin && isPerfectWin) {
      nextLives = Math.min(gameState.lives + 1, 5); 
    } else if (!isWin) {
      nextLives = Math.max(gameState.lives - 1, 0);
    }

    const nextUnlockedIndex = isWin ? Math.max(gameState.unlockedStageIndex, gameState.currentStageIndex + 1) : gameState.unlockedStageIndex;

    setGameState(prev => ({
      ...prev,
      lastStageTime: time,
      totalScore: nextTotalScore,
      unlockedStageIndex: nextUnlockedIndex,
      score: nextTotalScore, 
      stars: isWin ? (isPerfectWin ? 3 : 2) : 0,
      lives: nextLives,
      highScore: isWin && (prev.highScore === 0 || nextTotalScore < prev.highScore) ? nextTotalScore : prev.highScore,
      timeElapsed: nextTotalScore
    }));

    // Handle side effects
    if (isWin) {
      localStorage.setItem('frescobol_unlocked_stage', (gameState.currentStageIndex + 1).toString());
    }

    // 3. Database Upsert
    let currentUserId = user?.id;
    if (!currentUserId && user) {
        currentUserId = await syncProfile(user);
    }

    if (currentUserId && isWin && nextTotalScore > 0) {
      try {
        await supabase
            .from('rankings')
            .upsert({
                user_id: currentUserId, // Corrected to user_id
                product_id: gameState.product?.id || 'GERAL',
                score: nextTotalScore, 
                stars: isPerfectWin ? 3 : 2,
                time_elapsed: nextTotalScore,
                stage_index: Math.max(gameState.unlockedStageIndex, gameState.currentStageIndex + 1)
            }, { onConflict: 'user_id,product_id' }); // Corrected to user_id
      } catch (err) {
        console.error('Failed to save ranking:', err);
      }
    }

    // 4. Transition or Game Over
    if (nextLives === 0 && !isWin) {
      alert('SUAS VIDAS ACABARAM! Tente novamente do início.');
      handleRestart();
    } else {
      setCurrentScreen('GAME_OVER');
    }
  }, [user, gameState, handleRestart, syncProfile]);

  const handleLogout = () => {
    localStorage.removeItem('frescobol_user');
    localStorage.removeItem('frescobol_product');
    localStorage.removeItem('frescobol_unlocked_stage');
    setUser(null);
    setGameState(prev => ({ 
      ...prev, 
      unlockedStageIndex: 0,
      totalScore: 0,
      score: 0,
      rally: 0,
      lives: 3
    }));
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

      {showWelcome && user && (
        <WelcomeModal 
          userName={user.email.split('@')[0]} 
          onClose={() => setShowWelcome(false)} 
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
          onRestart={gameState.stars === 3 ? handleNextStage : handleRestart}
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
