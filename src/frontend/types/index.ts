/**
 * SANGAM — Frontend Domain Types
 */

export type View =
  | 'home'
  | 'dashboard'
  | 'plans'
  | 'checkout'
  | 'payment'
  | 'login'
  | 'signup'
  | 'forgot'
  | 'reset'
  | 'classes'
  | 'player'
  | 'cases'
  | 'case-detail'
  | 'quiz'
  | 'quiz-results'
  | 'review'
  | 'review-results'
  | 'patterns'
  | 'profile'
  | 'settings'

export interface FeatureLink {
  title: string
  description: string
  href: string
  icon: 'book' | 'layers' | 'spark' | 'shield' | 'video' | 'arrow' | 'grid'
}

export interface ClassItem {
  title: string
  instructor: string
  duration: string
  date: string
  watched: boolean
  image: string
  description: string
}

export interface CaseItem {
  title: string
  category: string
  difficulty: 'Intermediate' | 'Advanced'
  mode: string
  href: string
  description: string
}

export interface QuizQuestionItem {
  q: string
  options: string[]
  correct: number
}

export interface TierItem {
  name: string
  price: string
  description: string
  features: string[]
  validity: string
  popular?: boolean
}
