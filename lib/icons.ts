import {
  Home, Plane, ShoppingCart, Car, Utensils, Heart, GraduationCap,
  Briefcase, Coffee, Music, Gamepad2, Gift, Shirt, Wrench, Zap,
  Wifi, Phone, BookOpen, Baby, Dumbbell, PiggyBank, TrendingUp,
  Building2, Leaf, Sun, Moon, Star, Camera, Dog, Wallet,
} from 'lucide-react'

export const AVAILABLE_ICONS = [
  { name: 'home', label: 'Casa', icon: Home },
  { name: 'plane', label: 'Viagens', icon: Plane },
  { name: 'shopping-cart', label: 'Compras', icon: ShoppingCart },
  { name: 'car', label: 'Automóvel', icon: Car },
  { name: 'utensils', label: 'Restaurante', icon: Utensils },
  { name: 'heart', label: 'Saúde', icon: Heart },
  { name: 'graduation-cap', label: 'Educação', icon: GraduationCap },
  { name: 'briefcase', label: 'Trabalho', icon: Briefcase },
  { name: 'coffee', label: 'Café', icon: Coffee },
  { name: 'music', label: 'Música', icon: Music },
  { name: 'gamepad-2', label: 'Lazer', icon: Gamepad2 },
  { name: 'gift', label: 'Presentes', icon: Gift },
  { name: 'shirt', label: 'Roupa', icon: Shirt },
  { name: 'wrench', label: 'Reparações', icon: Wrench },
  { name: 'zap', label: 'Electricidade', icon: Zap },
  { name: 'wifi', label: 'Internet', icon: Wifi },
  { name: 'phone', label: 'Telefone', icon: Phone },
  { name: 'book-open', label: 'Livros', icon: BookOpen },
  { name: 'baby', label: 'Filhos', icon: Baby },
  { name: 'dumbbell', label: 'Ginásio', icon: Dumbbell },
  { name: 'piggy-bank', label: 'Poupança', icon: PiggyBank },
  { name: 'trending-up', label: 'Investimento', icon: TrendingUp },
  { name: 'building-2', label: 'Renda', icon: Building2 },
  { name: 'leaf', label: 'Natureza', icon: Leaf },
  { name: 'sun', label: 'Férias', icon: Sun },
  { name: 'moon', label: 'Noite', icon: Moon },
  { name: 'star', label: 'Especial', icon: Star },
  { name: 'camera', label: 'Fotografia', icon: Camera },
  { name: 'dog', label: 'Animais', icon: Dog },
  { name: 'wallet', label: 'Carteira', icon: Wallet },
] as const

export type IconName = typeof AVAILABLE_ICONS[number]['name']

export function getIconComponent(name: string) {
  return AVAILABLE_ICONS.find((i) => i.name === name)?.icon ?? Wallet
}
