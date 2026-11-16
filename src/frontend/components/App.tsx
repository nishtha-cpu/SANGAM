'use client'

import type { View } from '@frontend/types'
import { HomeView } from './HomeView'
import { DashboardView } from './DashboardView'
import { PlansView } from './PlansView'
import { CheckoutView } from './CheckoutView'
import { AuthView } from './AuthView'
import { ClassesView } from './ClassesView'
import { CasesView } from './CasesView'
import { QuizView } from './QuizView'
import { DesignReviewView } from './DesignReviewView'
import { PatternLibraryView } from './PatternLibraryView'
import { ProfileView } from './ProfileView'

export type { View }

export function App({ view, user }: { view: View; user?: any }) {
  if (view === 'home') return <HomeView />
  if (view === 'dashboard') return <DashboardView />
  if (view === 'plans') return <PlansView />
  if (view === 'checkout') return <CheckoutView />
  if (view === 'payment') return <CheckoutView payment />
  if (view === 'login') return <AuthView />
  if (view === 'signup') return <AuthView signup />
  if (view === 'forgot') return <AuthView forgot />
  if (view === 'reset') return <AuthView reset />
  if (view === 'classes') return <ClassesView />
  if (view === 'player') return <ClassesView player />
  if (view === 'cases') return <CasesView />
  if (view === 'case-detail') return <CasesView detail />
  if (view === 'quiz') return <QuizView />
  if (view === 'quiz-results') return <QuizView results />
  if (view === 'review') return <DesignReviewView />
  if (view === 'review-results') return <DesignReviewView results />
  if (view === 'patterns') return <PatternLibraryView />
  if (view === 'settings') return <ProfileView settings user={user} />
  return <ProfileView user={user} />
}
