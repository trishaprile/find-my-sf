import { Store, Palette, Music, Bot, TreeDeciduous, Wrench, Puzzle, UserRound, Spotlight } from 'lucide-react'

export interface Category {
  name: string
  icon: typeof Store
  color: string
  bg: string
}

export const CATEGORIES: Category[] = [
  {
    name: 'MARKET',
    icon: Store,
    color: '#DC2626',
    bg: '#FFE2E2'
  },
  {
    name: 'WORKSHOP',
    icon: Wrench,
    color: '#EA580C',
    bg: '#FFE1CD'
  },
  {
    name: 'ARTS & CRAFTS',
    icon: Palette,
    color: '#CA8A04',
    bg: '#FFF4D1'
  },
  {
    name: 'OUTDOOR',
    icon: TreeDeciduous,
    color: '#65A30D',
    bg: '#EFFFD8'
  },
  {
    name: 'SOCIAL',
    icon: UserRound,
    color: '#0D9488',
    bg: '#E6FFFD'
  },
  {
    name: 'MUSIC',
    icon: Music,
    color: '#2563EB',
    bg: '#E3ECFF'
  },
  {
    name: 'TECH',
    icon: Bot,
    color: '#9333EA',
    bg: '#F6ECFF'
  },
  {
    name: 'EXHIBIT',
    icon: Spotlight,
    color: '#C026D3',
    bg: '#FDEDFF'
  },
  {
    name: 'HOBBY',
    icon: Puzzle,
    color: '#DB2777',
    bg: '#FFE5F1'
  }
]

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name)

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find(c => c.name === name)
}

export function getCategoryId(categoryName: string): string {
  return categoryName.toLowerCase().replace(/\s+/g, '-')
}

