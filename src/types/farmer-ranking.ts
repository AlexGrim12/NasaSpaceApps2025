export type FarmerLevel = 
  | 'Aprendiz'
  | 'Cultivador'
  | 'Agricultor Experimentado'
  | 'Maestro Agricultor'
  | 'Gran Maestro'
  | 'Leyenda del Campo'

export type ContributionType = 
  | 'drought_report'
  | 'pest_report'
  | 'sustainable_practice'
  | 'crop_data'
  | 'weather_data'

export interface FarmerRanking {
  id: string
  farmer_id: string
  farmer_name: string
  total_points: number
  level: FarmerLevel
  contributions_count: number
  drought_reports: number
  pest_reports: number
  sustainable_practices: number
  crop_data_shared: number
  weather_data_shared: number
  badges: string[]
  created_at: string
  updated_at: string
  rank_position: number
  avatar_url?: string
  location?: string
}

export interface Contribution {
  id: string
  farmer_id: string
  type: ContributionType
  points_earned: number
  description: string
  verified: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  required_points?: number
  required_contributions?: number
  color: string
}

export const LEVEL_REQUIREMENTS: Record<FarmerLevel, number> = {
  'Aprendiz': 0,
  'Cultivador': 100,
  'Agricultor Experimentado': 500,
  'Maestro Agricultor': 1500,
  'Gran Maestro': 5000,
  'Leyenda del Campo': 10000,
}

export const CONTRIBUTION_POINTS: Record<ContributionType, number> = {
  'drought_report': 50,
  'pest_report': 40,
  'sustainable_practice': 60,
  'crop_data': 30,
  'weather_data': 20,
}

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_contribution',
    name: 'Primera Contribución',
    description: 'Realizó su primera contribución',
    icon: '🌱',
    required_contributions: 1,
    color: 'green',
  },
  {
    id: 'drought_expert',
    name: 'Experto en Sequías',
    description: 'Reportó 10+ sequías',
    icon: '☀️',
    required_contributions: 10,
    color: 'orange',
  },
  {
    id: 'pest_hunter',
    name: 'Cazador de Plagas',
    description: 'Reportó 10+ plagas',
    icon: '🐛',
    required_contributions: 10,
    color: 'red',
  },
  {
    id: 'eco_warrior',
    name: 'Guerrero Ecológico',
    description: 'Practica agricultura sostenible',
    icon: '♻️',
    required_contributions: 5,
    color: 'emerald',
  },
  {
    id: 'data_champion',
    name: 'Campeón de Datos',
    description: 'Compartió 50+ datos',
    icon: '📊',
    required_points: 1000,
    color: 'blue',
  },
  {
    id: 'master_farmer',
    name: 'Maestro Agricultor',
    description: 'Alcanzó nivel Maestro',
    icon: '👨‍🌾',
    required_points: 1500,
    color: 'purple',
  },
  {
    id: 'legend',
    name: 'Leyenda Viva',
    description: 'Alcanzó el nivel máximo',
    icon: '🏆',
    required_points: 10000,
    color: 'yellow',
  },
]
