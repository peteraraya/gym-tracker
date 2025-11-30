// Tipos de equipamiento disponibles en el gimnasio
export type EquipmentType =
  | 'barra'
  | 'mancuernas'
  | 'peso-corporal'
  | 'maquina'
  | 'poleas'
  | 'kettlebell'
  | 'banda-resistencia'
  | 'trx'
  | 'bosu'
  | 'fitball'
  | 'banco'
  | 'barras-paralelas'
  | 'barra-dominadas'
  | 'discos'
  | 'ez-bar'
  | 'step'
  | 'foam-roller'
  | 'saco-boxeo'
  | 'cuerda-saltar'
  | 'landmine';

export interface Equipment {
  id: EquipmentType;
  name: string;
  emoji: string;
  category: 'free-weights' | 'machines' | 'bodyweight' | 'cardio' | 'accessories';
  description: string;
}

export const EQUIPMENT_LIST: Equipment[] = [
  // FREE WEIGHTS
  {
    id: 'barra',
    name: 'Barra Olímpica',
    emoji: '🏋️',
    category: 'free-weights',
    description: 'Barra estándar de 20kg para levantamientos'
  },
  {
    id: 'mancuernas',
    name: 'Mancuernas',
    emoji: '🏋️‍♀️',
    category: 'free-weights',
    description: 'Pesas individuales para cada mano'
  },
  {
    id: 'discos',
    name: 'Discos/Placas',
    emoji: '⚙️',
    category: 'free-weights',
    description: 'Discos de peso para barras'
  },
  {
    id: 'ez-bar',
    name: 'Barra Z (EZ Bar)',
    emoji: '〰️',
    category: 'free-weights',
    description: 'Barra con curva para ejercicios de brazos'
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell/Pesa Rusa',
    emoji: '🔔',
    category: 'free-weights',
    description: 'Pesa con asa para ejercicios dinámicos'
  },

  // MACHINES
  {
    id: 'maquina',
    name: 'Máquinas de Gimnasio',
    emoji: '⚡',
    category: 'machines',
    description: 'Máquinas de peso guiado'
  },
  {
    id: 'poleas',
    name: 'Poleas/Cables',
    emoji: '🔗',
    category: 'machines',
    description: 'Sistema de poleas con resistencia ajustable'
  },
  {
    id: 'banco',
    name: 'Banco',
    emoji: '🪑',
    category: 'machines',
    description: 'Banco ajustable para ejercicios'
  },
  {
    id: 'landmine',
    name: 'Landmine',
    emoji: '📍',
    category: 'machines',
    description: 'Pivote para barra con un extremo fijo'
  },

  // BODYWEIGHT
  {
    id: 'peso-corporal',
    name: 'Peso Corporal',
    emoji: '🧘',
    category: 'bodyweight',
    description: 'Sin equipamiento, solo tu peso'
  },
  {
    id: 'barras-paralelas',
    name: 'Barras Paralelas',
    emoji: '🤸',
    category: 'bodyweight',
    description: 'Para fondos y ejercicios de peso corporal'
  },
  {
    id: 'barra-dominadas',
    name: 'Barra de Dominadas',
    emoji: '🏋️‍♂️',
    category: 'bodyweight',
    description: 'Barra fija para dominadas y pull-ups'
  },

  // ACCESSORIES
  {
    id: 'banda-resistencia',
    name: 'Bandas de Resistencia',
    emoji: '🎗️',
    category: 'accessories',
    description: 'Bandas elásticas para resistencia variable'
  },
  {
    id: 'trx',
    name: 'TRX/Bandas de Suspensión',
    emoji: '🎪',
    category: 'accessories',
    description: 'Sistema de entrenamiento en suspensión'
  },
  {
    id: 'bosu',
    name: 'Bosu Ball',
    emoji: '🌙',
    category: 'accessories',
    description: 'Media esfera para equilibrio'
  },
  {
    id: 'fitball',
    name: 'Fitball/Pelota Suiza',
    emoji: '⚽',
    category: 'accessories',
    description: 'Pelota de ejercicio para core y equilibrio'
  },
  {
    id: 'step',
    name: 'Step/Escalón',
    emoji: '📦',
    category: 'accessories',
    description: 'Plataforma elevada para ejercicios'
  },
  {
    id: 'foam-roller',
    name: 'Foam Roller',
    emoji: '🎯',
    category: 'accessories',
    description: 'Rodillo de espuma para recuperación'
  },

  // CARDIO
  {
    id: 'cuerda-saltar',
    name: 'Cuerda para Saltar',
    emoji: '🪢',
    category: 'cardio',
    description: 'Para ejercicios cardiovasculares'
  },
  {
    id: 'saco-boxeo',
    name: 'Saco de Boxeo',
    emoji: '🥊',
    category: 'cardio',
    description: 'Para entrenamiento de boxeo'
  },
];

export const EQUIPMENT_CATEGORIES = [
  { id: 'free-weights', name: 'Pesos Libres', emoji: '🏋️' },
  { id: 'machines', name: 'Máquinas', emoji: '⚡' },
  { id: 'bodyweight', name: 'Peso Corporal', emoji: '🧘' },
  { id: 'accessories', name: 'Accesorios', emoji: '🎗️' },
  { id: 'cardio', name: 'Cardio', emoji: '❤️' },
] as const;

export const getEquipmentByCategory = (category: Equipment['category']) => {
  return EQUIPMENT_LIST.filter(eq => eq.category === category);
};

export const getEquipmentById = (id: EquipmentType) => {
  return EQUIPMENT_LIST.find(eq => eq.id === id);
};
