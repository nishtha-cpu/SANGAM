'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { AdminDashboardLayout } from './AdminDashboardLayout'
import { Icon } from '@/app/(frontend)/components/icons'
import type { AdminUser } from '@admin-panel/auth/admin-auth'
import {
  getAdminClassesAction,
  createOrUpdateClassAction,
  deleteClassAction,
  getAdminQuizzesAction,
  getAdminQuizDetailsAction,
  saveAdminQuizAction,
  deleteQuizAction,
  toggleQuizStatusAction,
  getAdminCoursesAction,
  saveAdminCourseAction,
  deleteAdminCourseAction,
  saveAdminLessonAction,
  deleteAdminLessonAction,
  type AdminClassItem,
  type AdminQuizItem,
} from '@/admin-panel/curriculum/curriculum-actions'
import {
  getLearnersDirectoryAction,
  assignPackageManuallyAction,
  revokePackageManuallyAction,
  toggleLearnerActiveStatusAction,
  type LearnerDirectoryItem,
} from '@/admin-panel/learners/learner-actions'
import { CourseManagementModal } from '@/admin-panel/curriculum/CourseManagementModal'
import { LessonManagementModal } from '@/admin-panel/curriculum/LessonManagementModal'
import { QuizBuilderModal } from '@/admin-panel/quizzes/QuizBuilderModal'
import { QuizPreviewModal } from '@/admin-panel/quizzes/QuizPreviewModal'
import type { CourseItem, CourseLesson } from '@/backend/repositories/courses'
import type { QuizRecord } from '@/backend/repositories/quizzes'
import {
  getAllOrdersAdminAction,
  refundOrCancelOrderAction,
  type AdminOrderRecord,
} from '@/admin-panel/orders/order-admin-actions'
import {
  getPlatformAnalyticsAction,
  type PlatformAnalyticsData,
} from '@/admin-panel/analytics/analytics-actions'
import {
  getAdminMarketingContentAction,
  saveTestimonialAction,
  toggleTestimonialStatusAction,
  type TestimonialItem,
  type PromoCardItem,
} from '@/backend/actions/marketing-actions'

export interface RecentReview {
  id: string | number
  title: string
  status: string
  createdAt: string
  score?: number | null
}

export interface RecentLearner {
  id: string | number
  name: string
  email: string
  createdAt: string
}

export interface DashboardCounts {
  learners: number
  activeLearners: number
  classes: number
  caseStudies: number
  quizzes: number
  patterns: number
  pendingReviews: number
  orders: number
}

export interface AdminDashboardViewProps {
  admin: AdminUser
  telemetryAvailable: boolean
  counts: DashboardCounts
  recentReviews: RecentReview[]
  recentLearners: RecentLearner[]
}

type TabType = 'overview' | 'curriculum' | 'quizzes' | 'learners' | 'orders' | 'analytics' | 'marketing'

export function AdminDashboardView({
  admin,
  telemetryAvailable,
  counts,
  recentReviews,
  recentLearners,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isPending, startTransition] = useTransition()
  const [actionMessage, setActionMessage] = useState<{ text: string; ok: boolean } | null>(null)

  // Sub-panel data states
  const [coursesList, setCoursesList] = useState<CourseItem[]>([])
  const [classesList, setClassesList] = useState<AdminClassItem[]>([])
  const [quizzesList, setQuizzesList] = useState<AdminQuizItem[]>([])
  const [learnersList, setLearnersList] = useState<LearnerDirectoryItem[]>([])
  const [ordersList, setOrdersList] = useState<AdminOrderRecord[]>([])
  const [analyticsData, setAnalyticsData] = useState<PlatformAnalyticsData | null>(null)
  const [marketingTestimonials, setMarketingTestimonials] = useState<TestimonialItem[]>([])
  const [marketingPromoCards, setMarketingPromoCards] = useState<PromoCardItem[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Search & Filter states
  const [learnerSearch, setLearnerSearch] = useState('')
  const [quizSearch, setQuizSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')

  // Modal form states
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null)
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<CourseItem | null>(null)

  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<QuizRecord | null>(null)
  const [previewingQuiz, setPreviewingQuiz] = useState<QuizRecord | null>(null)

  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false)
  const [newTestimonialAuthor, setNewTestimonialAuthor] = useState('')
  const [newTestimonialRole, setNewTestimonialRole] = useState('')
  const [newTestimonialCompany, setNewTestimonialCompany] = useState('')
  const [newTestimonialContent, setNewTestimonialContent] = useState('')

  // Listen to hash changes for sidebar navigation
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.replace('#', '')
      if (['curriculum', 'quizzes', 'learners', 'orders', 'analytics', 'marketing'].includes(hash)) {
        setActiveTab(hash as TabType)
      } else {
        setActiveTab('overview')
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Lazy-load panel data when tab changes
  useEffect(() => {
    let isMounted = true
    async function loadPanelData() {
      try {
        const [crs, cls, qz, lrn, ord, anl, mkt] = await Promise.all([
          getAdminCoursesAction(),
          getAdminClassesAction(),
          getAdminQuizzesAction(),
          getLearnersDirectoryAction(),
          getAllOrdersAdminAction(),
          getPlatformAnalyticsAction(),
          getAdminMarketingContentAction(),
        ])
        if (isMounted) {
          setCoursesList(crs)
          setClassesList(cls)
          setQuizzesList(qz)
          setLearnersList(lrn)
          setOrdersList(ord)
          setAnalyticsData(anl)
          setMarketingTestimonials(mkt.testimonials)
          setMarketingPromoCards(mkt.promoCards)
          setDataLoaded(true)
        }
      } catch (err) {
        console.error('Failed to load panel data:', err)
      }
    }
    loadPanelData()
    return () => {
      isMounted = false
    }
  }, [activeTab])

  // Handlers for Learner Management
  const handleAssignPackage = (learnerId: string, pkg: string) => {
    setActionMessage(null)
    startTransition(async () => {
      const res = await assignPackageManuallyAction(learnerId, pkg)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const updated = await getLearnersDirectoryAction()
        setLearnersList(updated)
      }
    })
  }

  const handleRevokePackage = (learnerId: string, pkg: string) => {
    if (!confirm(`Are you sure you want to revoke ${pkg.toUpperCase()} from this learner?`)) return
    setActionMessage(null)
    startTransition(async () => {
      const res = await revokePackageManuallyAction(learnerId, pkg)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const updated = await getLearnersDirectoryAction()
        setLearnersList(updated)
      }
    })
  }

  const handleToggleLearnerActive = (learnerId: string, currentActive: boolean) => {
    const newState = !currentActive
    setActionMessage(null)
    startTransition(async () => {
      const res = await toggleLearnerActiveStatusAction(learnerId, newState)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const updated = await getLearnersDirectoryAction()
        setLearnersList(updated)
      }
    })
  }

  // Handlers for Courses & Video Management (Module 5 & Module 6)
  const handleSaveCourse = (courseData: Partial<CourseItem>) => {
    setActionMessage(null)
    startTransition(async () => {
      const res = await saveAdminCourseAction(courseData)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        setShowCourseModal(false)
        setEditingCourse(null)
        const updated = await getAdminCoursesAction()
        setCoursesList(updated)
      }
    })
  }

  const handleDeleteCourse = (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course and all its lessons?')) return
    setActionMessage(null)
    startTransition(async () => {
      const res = await deleteAdminCourseAction(courseId)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const updated = await getAdminCoursesAction()
        setCoursesList(updated)
      }
    })
  }

  const handleSaveLesson = (lessonData: Partial<CourseLesson>) => {
    if (!selectedCourseForLessons) return
    setActionMessage(null)
    startTransition(async () => {
      const res = await saveAdminLessonAction(selectedCourseForLessons.id, lessonData)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok && res.course) {
        setSelectedCourseForLessons(res.course)
        const updated = await getAdminCoursesAction()
        setCoursesList(updated)
      }
    })
  }

  const handleDeleteLesson = (lessonId: string) => {
    if (!selectedCourseForLessons) return
    if (!confirm('Are you sure you want to remove this video lesson?')) return
    setActionMessage(null)
    startTransition(async () => {
      const res = await deleteAdminLessonAction(selectedCourseForLessons.id, lessonId)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok && res.course) {
        setSelectedCourseForLessons(res.course)
        const updated = await getAdminCoursesAction()
        setCoursesList(updated)
      }
    })
  }

  // Handlers for Quizzes Management (Module 5 & QZ)
  const handleSaveQuiz = (quizData: any) => {
    setActionMessage(null)
    startTransition(async () => {
      const res = await saveAdminQuizAction(quizData)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        setShowQuizModal(false)
        setEditingQuiz(null)
        const updated = await getAdminQuizzesAction()
        setQuizzesList(updated)
      }
    })
  }

  const handleDeleteQuiz = (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return
    setActionMessage(null)
    startTransition(async () => {
      const res = await deleteQuizAction(quizId)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const updated = await getAdminQuizzesAction()
        setQuizzesList(updated)
      }
    })
  }

  const handleToggleQuizStatus = (quizId: string) => {
    setActionMessage(null)
    startTransition(async () => {
      const res = await toggleQuizStatusAction(quizId)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const updated = await getAdminQuizzesAction()
        setQuizzesList(updated)
      }
    })
  }

  const handleEditQuiz = async (quizItem: AdminQuizItem) => {
    const details = await getAdminQuizDetailsAction(quizItem.id)
    if (details) {
      setEditingQuiz(details)
      setShowQuizModal(true)
    }
  }

  const handlePreviewQuiz = async (quizItem: AdminQuizItem) => {
    const details = await getAdminQuizDetailsAction(quizItem.id)
    if (details) {
      setPreviewingQuiz(details)
    }
  }

  // Handlers for Curriculum Management
  const handleDeleteClass = (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    startTransition(async () => {
      const res = await deleteClassAction(classId)
      if (res.ok) {
        setClassesList((prev) => prev.filter((c) => c.id !== classId))
        setActionMessage({ text: 'Class deleted successfully.', ok: true })
      } else {
        setActionMessage({ text: res.message || 'Delete failed', ok: false })
      }
    })
  }

  const handleCreateClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createOrUpdateClassAction({
        title: String(form.get('title')),
        slug: String(form.get('slug')),
        instructor: String(form.get('instructor')),
        duration: String(form.get('duration') || '45 minutes'),
        section: String(form.get('section') || 'General Architecture'),
        description: String(form.get('description')),
        videoUrl: String(form.get('videoUrl')),
        isPremium: form.get('isPremium') === 'on',
      })
      if (res.ok) {
        setShowAddClassModal(false)
        const updated = await getAdminClassesAction()
        setClassesList(updated)
        setActionMessage({ text: 'New class created successfully.', ok: true })
      } else {
        setActionMessage({ text: res.message || 'Failed to create class', ok: false })
      }
    })
  }

  // Handlers for Orders Management
  const handleRefundOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to cancel and refund this order?')) return
    startTransition(async () => {
      const res = await refundOrCancelOrderAction(orderId)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const updated = await getAllOrdersAdminAction()
        setOrdersList(updated)
      }
    })
  }

  // Handlers for Marketing & Site Content (AD-8, WS-5, WS-10)
  const handleToggleTestimonial = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleTestimonialStatusAction(id)
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        const mkt = await getAdminMarketingContentAction()
        setMarketingTestimonials(mkt.testimonials)
      }
    })
  }

  const handleCreateTestimonial = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await saveTestimonialAction({
        author: newTestimonialAuthor,
        role: newTestimonialRole,
        company: newTestimonialCompany,
        content: newTestimonialContent,
        rating: 5,
        published: true,
      })
      setActionMessage({ text: res.message, ok: res.ok })
      if (res.ok) {
        setShowAddTestimonialModal(false)
        setNewTestimonialAuthor('')
        setNewTestimonialRole('')
        setNewTestimonialCompany('')
        setNewTestimonialContent('')
        const mkt = await getAdminMarketingContentAction()
        setMarketingTestimonials(mkt.testimonials)
      }
    })
  }

  const kpis = [
    {
      title: 'Total Learners',
      value: counts.learners || learnersList.length,
      secondary: `${counts.activeLearners || learnersList.length} verified accounts`,
      icon: 'user' as const,
      color: 'emerald',
    },
    {
      title: 'Pending Reviews',
      value: counts.pendingReviews,
      secondary: 'Requires instructor evaluation',
      icon: 'spark' as const,
      color: 'amber',
      highlight: counts.pendingReviews > 0,
    },
    {
      title: 'Curriculum Classes',
      value: counts.classes || classesList.length,
      secondary: 'Published lectures & labs',
      icon: 'video' as const,
      color: 'sky',
    },
    {
      title: 'Assessment Quizzes',
      value: counts.quizzes || quizzesList.length,
      secondary: 'Knowledge evaluations',
      icon: 'book' as const,
      color: 'indigo',
    },
    {
      title: 'Total Revenue',
      value: `$${analyticsData?.totalRevenue || 129}.00`,
      secondary: `${analyticsData?.paidOrdersCount || 1} paid subscriptions`,
      icon: 'lock' as const,
      color: 'teal',
    },
    {
      title: 'Security Patterns',
      value: counts.patterns || 12,
      secondary: 'Zero Trust controls',
      icon: 'shield' as const,
      color: 'teal',
    },
  ]

  return (
    <AdminDashboardLayout admin={admin} telemetryAvailable={telemetryAvailable} counts={counts}>
      <div className="space-y-6">
        {/* Navigation Tab Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Console Overview', icon: 'grid' },
              { id: 'curriculum', label: 'Classes & Curriculum (AD-1)', icon: 'video' },
              { id: 'quizzes', label: 'Quiz Management (AD-13)', icon: 'book' },
              { id: 'learners', label: 'Learner Directory (AD-10)', icon: 'user' },
              { id: 'orders', label: 'Orders & Invoices (AD-14)', icon: 'lock' },
              { id: 'analytics', label: 'Analytics (AN-1, AN-2)', icon: 'monitor' },
              { id: 'marketing', label: 'Marketing & Site (AD-8, WS-5)', icon: 'spark' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType)
                  window.location.hash = tab.id
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                    : 'border border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon name={tab.icon as any} className="size-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <Link href="/admin-dashboard/reviews" className="button-secondary text-xs">
            Review Queue ({counts.pendingReviews} pending) →
          </Link>
        </div>

        {/* Global Action Message Banner */}
        {actionMessage && (
          <div
            className={`rounded-xl p-3 text-xs flex items-center justify-between ${
              actionMessage.ok
                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                : 'border border-rose-500/20 bg-rose-500/10 text-rose-300'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a1b2d] via-[#091522] to-[#06101c] p-7 md:p-9 shadow-xl">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 size-80 rounded-full bg-amber-400/5 blur-3xl" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  SANGAM Command Center
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Security Operations Console
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Welcome back, <strong className="text-white">{admin.email}</strong>. Connected to the
                  Figma-managed Payload architecture with full role segregation.
                </p>
              </div>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi) => (
                <div
                  key={kpi.title}
                  className={`card relative overflow-hidden p-6 transition ${
                    kpi.highlight ? 'border-amber-400/40 bg-amber-400/[0.04]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                    <span className="grid size-9 place-items-center rounded-xl border border-white/5 bg-white/[0.04] text-slate-300">
                      <Icon name={kpi.icon} className="size-4" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight text-white">{kpi.value}</p>
                    <p className="mt-1 text-xs text-slate-400">{kpi.secondary}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Submissions & Registrations */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <h3 className="font-semibold text-white">Student Review Queue</h3>
                  <Link href="/admin-dashboard/reviews" className="text-xs text-amber-300 hover:underline">
                    View all reviews →
                  </Link>
                </div>
                <div className="mt-4 divide-y divide-white/5">
                  {recentReviews.length > 0 ? (
                    recentReviews.map((rev) => (
                      <div key={rev.id} className="flex items-center justify-between py-3 text-xs">
                        <div>
                          <p className="font-medium text-white">{rev.title}</p>
                          <p className="text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                          {rev.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-xs text-slate-400">No review submissions in queue.</p>
                  )}
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <h3 className="font-semibold text-white">Recent Learner Registrations</h3>
                  <button onClick={() => setActiveTab('learners')} className="text-xs text-amber-300 hover:underline">
                    View directory →
                  </button>
                </div>
                <div className="mt-4 divide-y divide-white/5">
                  {learnersList.slice(0, 5).map((lrn) => (
                    <div key={lrn.id} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <p className="font-medium text-white">{lrn.name}</p>
                        <p className="text-slate-400">{lrn.email}</p>
                      </div>
                      <div className="flex gap-1">
                        {lrn.enrolledPackages.map((pkg) => (
                          <span key={pkg} className="rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
                            {pkg}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CURRICULUM & COURSES TAB (Module 5 & Module 6) */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            {/* Top Bar for Courses */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Architecture Courses &amp; Masterclasses (Module 5)
                </h2>
                <p className="text-xs text-slate-400">
                  Manage comprehensive multi-lesson courses, pricing, and trial video assignments (Module 6).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCourse(null)
                  setShowCourseModal(true)
                }}
                className="button-primary text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold"
              >
                + Add Architecture Course
              </button>
            </div>

            {/* Courses Table */}
            <div className="card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/8 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="p-3">Course Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Lessons &amp; Trial</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coursesList.map((crs) => {
                    const trialLesson = crs.lessons.find((l) => l.isTrial)
                    return (
                      <tr key={crs.id} className="hover:bg-white/[0.02]">
                        <td className="p-3">
                          <p className="font-semibold text-white">{crs.title}</p>
                          <p className="text-[11px] text-slate-400">{crs.duration} • {crs.instructor}</p>
                        </td>
                        <td className="p-3 text-slate-300">{crs.category}</td>
                        <td className="p-3 text-slate-400">{crs.level}</td>
                        <td className="p-3 font-semibold text-emerald-300">{crs.price}</td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="text-white font-medium">{crs.lessons.length} lessons</span>
                            {trialLesson ? (
                              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Trial: {trialLesson.title.slice(0, 24)}...
                              </p>
                            ) : (
                              <p className="text-[10px] text-amber-400">No trial video set</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              crs.published
                                ? 'bg-emerald-400/10 text-emerald-300'
                                : 'bg-slate-400/10 text-slate-400'
                            }`}
                          >
                            {crs.published ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCourseForLessons(crs)}
                            className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 text-[11px] font-medium hover:bg-emerald-500/20"
                          >
                            Manage Lessons &amp; Trial
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCourse(crs)
                              setShowCourseModal(true)
                            }}
                            className="px-2 py-1 rounded bg-white/5 text-slate-300 text-[11px] hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(crs.id)}
                            className="text-rose-400 hover:text-rose-200 text-[11px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Standalone Video Classes (AD-1) */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Individual Lecture Masterclasses (AD-1)</h3>
                  <p className="text-xs text-slate-400">Manage individual recorded masterclass videos.</p>
                </div>
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="button-secondary text-xs"
                >
                  + Add Standalone Class
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/8 bg-white/[0.02] text-slate-400">
                    <tr>
                      <th className="p-3">Class Title</th>
                      <th className="p-3">Instructor</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Section</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {classesList.map((cls) => (
                      <tr key={cls.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-medium text-white">{cls.title}</td>
                        <td className="p-3 text-slate-300">{cls.instructor}</td>
                        <td className="p-3 text-slate-400">{cls.duration}</td>
                        <td className="p-3 text-slate-400">{cls.section || 'General'}</td>
                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              cls.isPremium
                                ? 'bg-amber-400/10 text-amber-300'
                                : 'bg-emerald-400/10 text-emerald-300'
                            }`}
                          >
                            {cls.isPremium ? 'PREMIUM' : 'FREE'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="text-rose-400 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Add Class */}
            {showAddClassModal && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
                <form onSubmit={handleCreateClass} className="card max-w-lg w-full p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">Create New Video Class (AD-1, AD-2)</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="field">
                      Title
                      <input name="title" className="input" placeholder="e.g. Threat Modeling with STRIDE" required />
                    </label>
                    <label className="field">
                      Slug
                      <input name="slug" className="input" placeholder="e.g. threat-modeling-stride" required />
                    </label>
                    <label className="field">
                      Instructor
                      <input name="instructor" className="input" placeholder="e.g. Dr. Maya Chen" required />
                    </label>
                    <label className="field">
                      Duration
                      <input name="duration" className="input" placeholder="e.g. 55 minutes" />
                    </label>
                    <label className="field">
                      Section
                      <input name="section" className="input" placeholder="e.g. Application Security" />
                    </label>
                    <label className="field">
                      Video CDN URL
                      <input name="videoUrl" className="input" placeholder="https://cdn.sangam.security/videos/..." />
                    </label>
                  </div>
                  <label className="field">
                    Description
                    <textarea name="description" className="input h-20" placeholder="Class curriculum summary..." />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input type="checkbox" name="isPremium" defaultChecked />
                    Require Professional/Enterprise tier (Premium class)
                  </label>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowAddClassModal(false)} className="button-secondary text-xs">
                      Cancel
                    </button>
                    <button type="submit" disabled={isPending} className="button-primary text-xs bg-amber-400 text-black">
                      {isPending ? 'Saving...' : 'Save Class'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 3. QUIZZES MANAGEMENT TAB (AD-13, QZ-1, QZ-2) */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Architecture Assessment Quizzes (AD-13, QZ-1)</h2>
                <p className="text-xs text-slate-400">
                  Configure scenario assessments, questions with option scoring, passing marks, and time limits.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  placeholder="Filter quizzes..."
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuiz(null)
                    setShowQuizModal(true)
                  }}
                  className="button-primary text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold whitespace-nowrap"
                >
                  + Create Assessment Quiz
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/8 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="p-3">Quiz Title</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3">Passing Score</th>
                    <th className="p-3">Questions</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quizzesList
                    .filter(
                      (q) =>
                        q.title.toLowerCase().includes(quizSearch.toLowerCase()) ||
                        (q.domain && q.domain.toLowerCase().includes(quizSearch.toLowerCase()))
                    )
                    .map((qz) => (
                      <tr key={qz.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-medium text-white">{qz.title}</td>
                        <td className="p-3 text-slate-300">{qz.domain || 'Core Principles'}</td>
                        <td className="p-3 text-slate-400">{qz.difficulty}</td>
                        <td className="p-3 font-semibold text-emerald-300">{qz.passingScore}%</td>
                        <td className="p-3 text-slate-300">{qz.questionCount} questions</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleQuizStatus(qz.id)}
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${
                              qz.published
                                ? 'bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
                                : 'bg-slate-400/10 text-slate-400 hover:bg-slate-400/20'
                            }`}
                          >
                            {qz.published ? 'PUBLISHED' : 'DRAFT'}
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handlePreviewQuiz(qz)}
                            className="px-2 py-1 rounded bg-white/5 text-slate-300 hover:bg-white/10 text-[11px]"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditQuiz(qz)}
                            className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-[11px]"
                          >
                            Edit Questions
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuiz(qz.id)}
                            className="text-rose-400 hover:text-rose-200 text-[11px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. LEARNER DIRECTORY TAB (AD-10, AD-11, AD-12, Module 5) */}
        {activeTab === 'learners' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Learner Accounts &amp; Access Controls (AD-10, AD-12)</h2>
                <p className="text-xs text-slate-400">
                  Search learners, view verified enrollments, toggle account status (activate/deactivate), or assign packages.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={learnerSearch}
                  onChange={(e) => setLearnerSearch(e.target.value)}
                  placeholder="Search name or email..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/8 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="p-3">Learner</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3">Active Packages</th>
                    <th className="p-3">Manual Package Assignment</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {learnersList
                    .filter(
                      (l) =>
                        l.name.toLowerCase().includes(learnerSearch.toLowerCase()) ||
                        l.email.toLowerCase().includes(learnerSearch.toLowerCase())
                    )
                    .map((lrn) => (
                      <tr key={lrn.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-medium text-white">{lrn.name}</td>
                        <td className="p-3 text-slate-300">{lrn.email}</td>
                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              lrn.isActive !== false
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}
                          >
                            {lrn.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {lrn.enrolledPackages.length > 0 ? (
                              lrn.enrolledPackages.map((pkg) => (
                                <span
                                  key={pkg}
                                  className="group relative inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300"
                                >
                                  {pkg}
                                  <button
                                    onClick={() => handleRevokePackage(lrn.id, pkg)}
                                    className="text-rose-400 hover:text-rose-200"
                                    title={`Revoke ${pkg}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">None</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAssignPackage(lrn.id, 'foundation')}
                              className="rounded bg-white/5 px-2 py-1 text-[10px] hover:bg-white/10"
                            >
                              + Foundation
                            </button>
                            <button
                              onClick={() => handleAssignPackage(lrn.id, 'professional')}
                              className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-1 text-[10px] hover:bg-emerald-500/30"
                            >
                              + Professional
                            </button>
                            <button
                              onClick={() => handleAssignPackage(lrn.id, 'enterprise')}
                              className="rounded bg-cyan-500/20 text-cyan-300 px-2 py-1 text-[10px] hover:bg-cyan-500/30"
                            >
                              + Enterprise
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleLearnerActive(lrn.id, lrn.isActive !== false)}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                              lrn.isActive !== false
                                ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                            }`}
                          >
                            {lrn.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ORDERS & INVOICES TAB (AD-14, PY-6, PY-9) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Billing, Orders &amp; Invoices (AD-14, PY-6)</h2>
                <p className="text-xs text-slate-400">All customer transactions, generated tax invoices, and payment statuses.</p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Filter tx ref or email..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/8 bg-white/[0.02] text-slate-400">
                  <tr>
                    <th className="p-3">Tx Reference</th>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Learner</th>
                    <th className="p-3">Package</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ordersList
                    .filter(
                      (o) =>
                        o.transactionReference.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        (o.learnerEmail && o.learnerEmail.toLowerCase().includes(orderSearch.toLowerCase())) ||
                        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(orderSearch.toLowerCase()))
                    )
                    .map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-mono text-slate-300">{ord.transactionReference}</td>
                        <td className="p-3 font-mono text-emerald-300">{ord.invoiceNumber || '—'}</td>
                        <td className="p-3 text-slate-300">
                          <p className="font-medium text-white">{ord.learnerName}</p>
                          <p className="text-[11px] text-slate-400">{ord.learnerEmail}</p>
                        </td>
                        <td className="p-3 uppercase text-slate-200">{ord.packageName}</td>
                        <td className="p-3 font-semibold text-white">${ord.amount}.00</td>
                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {ord.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleRefundOrder(ord.id)}
                              className="text-rose-400 hover:underline"
                            >
                              Cancel / Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. ANALYTICS & REPORTING TAB (AN-1, AN-2) */}
        {activeTab === 'analytics' && analyticsData && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Business &amp; Learning Analytics (AN-1, AN-2)</h2>
              <p className="text-xs text-slate-400">Real-time aggregate telemetry computed from verified database records.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="card p-6 border-emerald-500/20 bg-emerald-500/5">
                <span className="text-xs text-slate-400 font-medium">Total Gross Revenue</span>
                <p className="mt-2 text-3xl font-bold text-emerald-300">${analyticsData.totalRevenue}.00</p>
                <p className="mt-1 text-xs text-slate-400">{analyticsData.paidOrdersCount} completed orders</p>
              </div>

              <div className="card p-6 border-cyan-500/20 bg-cyan-500/5">
                <span className="text-xs text-slate-400 font-medium">Active Subscriptions</span>
                <p className="mt-2 text-3xl font-bold text-cyan-300">{analyticsData.activeSubscriptions}</p>
                <p className="mt-1 text-xs text-slate-400">Valid recurring licenses</p>
              </div>

              <div className="card p-6 border-purple-500/20 bg-purple-500/5">
                <span className="text-xs text-slate-400 font-medium">Quizzes Completed</span>
                <p className="mt-2 text-3xl font-bold text-purple-300">{analyticsData.totalQuizzesTaken}</p>
                <p className="mt-1 text-xs text-slate-400">Average score: {analyticsData.averageQuizScore}%</p>
              </div>

              <div className="card p-6 border-amber-500/20 bg-amber-500/5">
                <span className="text-xs text-slate-400 font-medium">Pending Reviews</span>
                <p className="mt-2 text-3xl font-bold text-amber-300">{analyticsData.pendingReviewsCount}</p>
                <p className="mt-1 text-xs text-slate-400">Architecture submissions</p>
              </div>
            </div>
          </div>
        )}

        {/* 7. MARKETING & SITE CONTENT TAB (AD-8, WS-5, WS-10) */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Dynamic Site Content &amp; Testimonials (AD-8, WS-5, WS-10)</h2>
                <p className="text-xs text-slate-400">
                  Manage social proof, architecture practitioner testimonials, and home page promotional cards.
                </p>
              </div>
              <button
                onClick={() => setShowAddTestimonialModal(true)}
                className="button-primary text-xs shrink-0"
              >
                + Add Testimonial
              </button>
            </div>

            {/* Testimonials List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Published Testimonials ({marketingTestimonials.length})</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {marketingTestimonials.map((item) => (
                  <div key={item.id} className="card p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-white text-sm">{item.author}</p>
                          <p className="text-xs text-slate-400">{item.role} • {item.company}</p>
                        </div>
                        <span
                          className={`badge ${
                            item.published
                              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                              : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {item.published ? 'Published' : 'Hidden'}
                        </span>
                      </div>
                      <p className="mt-3 text-xs italic text-slate-300">&ldquo;{item.content}&rdquo;</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="text-[11px] text-amber-400">{'★'.repeat(item.rating || 5)}</span>
                      <button
                        onClick={() => handleToggleTestimonial(item.id, item.published)}
                        disabled={isPending}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                          item.published
                            ? 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10'
                            : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                        }`}
                      >
                        {item.published ? 'Unpublish' : 'Publish to Home'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal for adding testimonial */}
            {showAddTestimonialModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <div className="card w-full max-w-md p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">Add New Testimonial</h3>
                    <button
                      onClick={() => setShowAddTestimonialModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreateTestimonial} className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 font-medium">Author Name</label>
                      <input
                        type="text"
                        required
                        value={newTestimonialAuthor}
                        onChange={(e) => setNewTestimonialAuthor(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-300 font-medium">Role</label>
                        <input
                          type="text"
                          required
                          value={newTestimonialRole}
                          onChange={(e) => setNewTestimonialRole(e.target.value)}
                          placeholder="e.g. Lead Architect"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-medium">Company</label>
                        <input
                          type="text"
                          required
                          value={newTestimonialCompany}
                          onChange={(e) => setNewTestimonialCompany(e.target.value)}
                          placeholder="e.g. Sentinel Corp"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-medium">Review Content</label>
                      <textarea
                        required
                        rows={3}
                        value={newTestimonialContent}
                        onChange={(e) => setNewTestimonialContent(e.target.value)}
                        placeholder="Enter the testimonial quote..."
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddTestimonialModal(false)}
                        className="button-secondary text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="button-primary text-xs"
                      >
                        Save &amp; Publish
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals for Courses, Lessons, Quizzes Management (Module 5 & Module 6) */}
        {showCourseModal && (
          <CourseManagementModal
            course={editingCourse}
            onClose={() => {
              setShowCourseModal(false)
              setEditingCourse(null)
            }}
            onSave={handleSaveCourse}
            isPending={isPending}
          />
        )}

        {selectedCourseForLessons && (
          <LessonManagementModal
            course={selectedCourseForLessons}
            onClose={() => setSelectedCourseForLessons(null)}
            onSaveLesson={handleSaveLesson}
            onDeleteLesson={handleDeleteLesson}
            isPending={isPending}
          />
        )}

        {showQuizModal && (
          <QuizBuilderModal
            quiz={editingQuiz}
            onClose={() => {
              setShowQuizModal(false)
              setEditingQuiz(null)
            }}
            onSave={handleSaveQuiz}
            isPending={isPending}
          />
        )}

        {previewingQuiz && (
          <QuizPreviewModal
            quiz={previewingQuiz}
            onClose={() => setPreviewingQuiz(null)}
          />
        )}
      </div>
    </AdminDashboardLayout>
  )
}
