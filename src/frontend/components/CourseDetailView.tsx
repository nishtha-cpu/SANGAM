'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { CourseItem, CourseLesson } from '@/backend/repositories/courses'
import { getLessonPlaybackAccessAction, LessonAccessResult } from '@/backend/actions/course-actions'
import { recordWatchProgressAction } from '@/backend/actions/video-actions'
import { Icon } from '@frontend/components/icons'

interface CourseDetailViewProps {
  course: CourseItem
}

export function CourseDetailView({ course }: CourseDetailViewProps) {
  // Find initial trial lesson or first lesson
  const initialTrialLesson = course.lessons.find((l) => l.isTrial) || course.lessons[0]
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson>(initialTrialLesson)
  const [accessState, setAccessState] = useState<LessonAccessResult | null>(null)
  const [loadingAccess, setLoadingAccess] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fetch access permissions whenever selected lesson changes
  useEffect(() => {
    let isMounted = true
    setLoadingAccess(true)

    getLessonPlaybackAccessAction({
      courseSlug: course.slug,
      lessonId: selectedLesson.id,
    })
      .then((res) => {
        if (isMounted) {
          setAccessState(res)
          setLoadingAccess(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setAccessState({
            allowed: selectedLesson.isTrial,
            isTrial: selectedLesson.isTrial,
            isLocked: !selectedLesson.isTrial,
            reason: selectedLesson.isTrial ? 'trial_allowed' : 'purchase_required',
            videoUrl: selectedLesson.isTrial ? selectedLesson.videoUrl : undefined,
          })
          setLoadingAccess(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [course.slug, selectedLesson])

  // Track progress on interval when video is playing
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = Math.floor(videoRef.current.currentTime)
    const duration = Math.floor(videoRef.current.duration) || 1
    const completed = current >= duration * 0.9

    // Periodically record every 15 seconds or upon completion
    if (current > 0 && (current % 15 === 0 || completed)) {
      recordWatchProgressAction({
        classSlug: course.slug,
        secondsWatched: current,
        lastPositionSeconds: current,
        completed,
      }).catch(() => {})
    }
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/courses" className="hover:text-white transition">
          Courses
        </Link>
        <span>/</span>
        <span className="text-emerald-400 font-medium truncate">{course.title}</span>
      </nav>

      {/* Main Grid: Left Video Player & Syllabus, Right Pricing Card */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 Cols): Player + Lesson Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                {course.category}
              </span>
              <span className="badge border-blue-500/30 bg-blue-500/10 text-blue-300">
                {course.level}
              </span>
              <span className="text-xs text-slate-400">
                {course.duration} • {course.lessons.length} lessons
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {course.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {course.description}
            </p>
          </div>

          {/* Video Player Box */}
          <div className="card overflow-hidden bg-slate-950 border-white/10 shadow-2xl">
            {loadingAccess ? (
              <div className="flex aspect-video w-full items-center justify-center bg-slate-900/60">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  <p className="text-xs text-slate-400">Verifying lesson access authorization...</p>
                </div>
              </div>
            ) : accessState?.allowed ? (
              <div className="relative">
                {/* Free Trial Banner if this lesson is trial */}
                {selectedLesson.isTrial && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-emerald-950/80 to-slate-900 px-4 py-2 border-b border-emerald-500/20 text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      FREE TRIAL LESSON — Instant Full Preview
                    </span>
                    <span className="text-[11px] text-slate-400">No payment required</span>
                  </div>
                )}
                {/* HTML5 Video Player */}
                <video
                  ref={videoRef}
                  src={accessState.videoUrl || selectedLesson.videoUrl}
                  controls
                  className="w-full aspect-video bg-black"
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              </div>
            ) : (
              /* Locked Lesson Preview State */
              <div className="flex aspect-video w-full flex-col items-center justify-center bg-slate-900/90 p-6 text-center">
                <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-white/5 border border-white/10 text-amber-400 shadow-inner">
                  <svg
                    className="size-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Premium Lesson Locked</h3>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">
                  <strong className="text-slate-200">"{selectedLesson.title}"</strong> is part of
                  the premium architecture curriculum. Enroll in this course to unlock all video
                  lectures, architecture blueprints, scenario quizzes, and certification assessments.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/checkout?course=${course.slug}`}
                    className="button-primary text-xs"
                  >
                    Enroll Now to Unlock ({course.price})
                  </Link>
                  {initialTrialLesson && (
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(initialTrialLesson)}
                      className="button-secondary text-xs"
                    >
                      Watch Free Trial Video
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Current Lesson Details Bar */}
            <div className="p-5 border-t border-white/5 bg-slate-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400">
                    Lesson {course.lessons.findIndex((l) => l.id === selectedLesson.id) + 1} of{' '}
                    {course.lessons.length}
                  </span>
                  <h3 className="text-base font-semibold text-white mt-0.5">
                    {selectedLesson.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedLesson.duration}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {selectedLesson.description ||
                  'Comprehensive security architectural walkthrough with live diagramming and hands-on pattern implementation.'}
              </p>
            </div>
          </div>

          {/* Course Syllabus / Lesson Playlist */}
          <div className="card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white">Course Curriculum & Syllabus</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any lesson to preview trial videos or view course topics.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {course.lessons.filter((l) => l.isTrial).length} Free Demo Lesson Available
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {course.lessons.map((lesson, index) => {
                const isSelected = selectedLesson.id === lesson.id
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-7 place-items-center rounded-lg text-xs font-bold ${
                          isSelected
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{lesson.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{lesson.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson.isTrial ? (
                        <span className="badge border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider">
                          FREE TRIAL
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <svg
                            className="size-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Locked
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Pricing, Enrollment & Benefits Card */}
        <div className="space-y-6">
          <div className="card p-6 border-emerald-500/20 bg-gradient-to-b from-slate-900 to-slate-950 sticky top-24">
            <div className="border-b border-white/10 pb-5">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Investment
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{course.price}</span>
                <span className="text-xs text-slate-400">/ Full Lifetime Access</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Includes all {course.lessons.length} masterclasses, architecture files & assessment.
              </p>
            </div>

            <div className="py-6 space-y-4">
              <Link
                href={`/checkout?course=${course.slug}`}
                className="button-primary w-full justify-center text-center py-3 text-sm font-semibold shadow-lg shadow-emerald-500/20"
              >
                Enroll Now <Icon name="arrow" className="size-4 ml-1.5" />
              </Link>
              <Link
                href="/plans"
                className="button-secondary w-full justify-center text-center text-xs"
              >
                Explore All-Access Membership Plans
              </Link>
            </div>

            {/* Inclusions Checklist */}
            <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
              <p className="font-semibold text-white text-xs uppercase tracking-wider">
                What&apos;s Included:
              </p>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Full access to all {course.lessons.length} video lectures and future updates</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Interactive scenario-based threat modeling quizzes</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>AI-assisted architecture review and instant scoring</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Downloadable architectural blueprints and design templates</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Verified Certificate of Security Architecture Competency</span>
              </div>
            </div>

            {/* 7-Day Guarantee Banner */}
            <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <p className="text-xs font-semibold text-white">🛡️ 7-Day Money-Back Guarantee</p>
              <p className="mt-1 text-[11px] text-slate-400">
                If the curriculum doesn&apos;t elevate your engineering practice, receive a 100%
                prompt refund. Read our{' '}
                <Link href="/refund-policy" className="text-emerald-400 underline">
                  Refund Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Instructor Profile Box */}
          <div className="card p-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Lead Instructor
            </h4>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-base border border-emerald-500/30">
                SA
              </div>
              <div>
                <p className="text-sm font-bold text-white">SANGAM Architecture Faculty</p>
                <p className="text-xs text-slate-400">Principal Security Engineers & CISOs</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Curriculum formulated by practitioners who have secured Tier-1 cloud architectures,
              banking cores, and high-frequency financial ledgers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
