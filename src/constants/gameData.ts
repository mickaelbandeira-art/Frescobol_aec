import { Product, Boss } from '../types/game';

export const PRODUCTS: Product[] = [
  { id: 'claro', name: 'Claro', color: '#ff0000', logo: '/assets/logo_claro.png' },
  { id: 'inter', name: 'Inter', color: '#ff7a00', logo: '/assets/logo_inter.png' },
  { id: 'ton', name: 'Ton', color: '#00d344', logo: '/assets/logo_ton.png' },
  { id: 'ifood', name: 'iFood', color: '#ea1d2c', logo: '/assets/logo_ifood.png' },
  { id: 'ifood_pago', name: 'iFood Pago', color: '#ea1d2c', logo: '/assets/logo_ifood_pago.png' },
  { id: 'aec', name: 'AeC', color: '#3164f4', logo: '/assets/logo_aec.png' },
];

export const BOSSES: Boss[] = [
  { 
    id: 'izaura', 
    name: 'Izaura Araújo', 
    role: 'Coordenadora', 
    avatar: '/assets/hierarchy/5 Izaura Araújo.png',
    targetScore: 500,
    difficulty: 1
  },
  { 
    id: 'kelciane', 
    name: 'Kelciane Cavalcante', 
    role: 'Coordenadora', 
    avatar: '/assets/hierarchy/4 Kelciane Cavalcante.png',
    targetScore: 1000,
    difficulty: 2
  },
  { 
    id: 'jonathan', 
    name: 'Jonathan Lins', 
    role: 'Gerente', 
    avatar: '/assets/hierarchy/1 Jonathan Lins.png',
    targetScore: 2000,
    difficulty: 3
  },
  { 
    id: 'cleiton', 
    name: 'Cleiton Pinto', 
    role: 'Superintendente', 
    avatar: '/assets/hierarchy/3 Cleiton Pinto.png',
    targetScore: 3500,
    difficulty: 4
  },
  { 
    id: 'patricia', 
    name: 'Patrícia Oliveira', 
    role: 'Diretora', 
    avatar: '/assets/hierarchy/2 Patrícia Oliveira.png',
    targetScore: 5000,
    difficulty: 5
  },
];
