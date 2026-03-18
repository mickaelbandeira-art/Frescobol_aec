export type Screen = 'START' | 'LOGIN' | 'PRODUCT_SELECT' | 'STAGE_SELECT' | 'GAME' | 'GAME_OVER' | 'LEADERBOARD';

export interface User {
  id?: string;
  email: string;
  matricula?: string;
  product_id?: string;
}

export interface Product {
    id: string;
    name: string;
    color: string;
    logo: string;
}

export interface Boss {
  id: string;
  name: string;
  role: string;
  avatar: string;
  targetScore: number;
  difficulty: number; // 1 to 5
}

export interface GameState {
  player: { name: string, avatar: string } | null;
  boss: Boss | null;
  product: Product | null;
  currentStageIndex: number;
  unlockedStageIndex: number;
  score: number;
  highScore: number;
  rally: number;
  lives: number;
  timeElapsed: number;
  stars: number;
  totalScore: number;
}

export interface LeaderboardEntry {
  name: string;
  product: string;
  score: number;
  stars: number;
  time: number;
  stage: number;
  date: string;
}
