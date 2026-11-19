'use client'

import React, { useState } from 'react'
import { CourseItem, CourseLesson } from '@/backend/repositories/courses'

interface LessonManagementModalProps {
  course: CourseItem
  onClose: () => void
  onSaveLesson: (lessonData: Partial<CourseLesson>) => void
  onDeleteLesson: (lessonId: string) => void
  isPending: boolean
}

export function LessonManagementModal({
  course,
  onClose,
  onSaveLesson,
  onDeleteLesson,
  isPending,
}: LessonManagementModalProps) {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    duration: '15 minutes',
    videoUrl: 'https://cdn.sangam.security/videos/sample.mp4',
    description: '',
    isTrial: false,
  })

  const handleEditClick = (lesson: CourseLesson) => {
    setEditingLessonId(lesson.id)
    setFormData({
      title: lesson.title,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl || '',
      description: lesson.description || '',
      isTrial: lesson.isTrial,
    })
  }

  const handleResetForm = () => {
    setEditingLessonId(null)
    setFormData({
      title: '',
      duration: '15 minutes',
      videoUrl: 'https://cdn.sangam.security/videos/sample.mp4',
      description: '',
      isTrial: false,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveLesson({
      id: editingLessonId || undefined,
      ...formData,
    })
    handleResetForm()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 overflow-y-auto">
      <div className="card max-w-3xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Curriculum Video Lessons: {course.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Module 6 Rule: Exactly one trial video allowed per course. All other videos remain locked to enrolled learners.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Existing Lessons List */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Current Lessons ({course.lessons.length})
          </h4>
          <div className="space-y-2">
            {course.lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                  lesson.isTrial
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded bg-white/5 text-xs font-bold text-slate-300">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">{lesson.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {lesson.duration} • {lesson.videoUrl ? 'CDN Video Linked' : 'No Video'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lesson.isTrial ? (
                    <span className="badge border-emerald-400/50 bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                      ⭐ FREE TRIAL VIDEO
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      🔒 Locked
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEditClick(lesson)}
                    className="px-2 py-1 rounded bg-white/5 text-[11px] text-slate-300 hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLesson(lesson.id)}
                    className="px-2 py-1 rounded bg-rose-500/10 text-[11px] text-rose-300 hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add / Edit Lesson Form */}
        <form onSubmit={handleSubmit} className="border-t border-white/10 pt-5 space-y-4">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            {editingLessonId ? 'Edit Lesson' : '+ Add New Video Lesson'}
          </h4>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lesson Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Identity Federation & SAML/OIDC"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 24 minutes"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video URL (MP4 / WebM / CDN Stream)
            </label>
            <input
              type="text"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://cdn.sangam.security/videos/..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lesson Summary
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Core architectural trade-offs covered in this lecture..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {/* Module 6 Free Trial Selector */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isTrial}
                onChange={(e) => setFormData({ ...formData, isTrial: e.target.checked })}
                className="size-4 mt-0.5 rounded accent-emerald-400"
              />
              <div>
                <span className="text-xs font-bold text-white">
                  Mark as FREE TRIAL Lesson (Playable without Purchase)
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  <strong>Invariant Enforcement:</strong> Marking this lesson as Free Trial will
                  automatically lock any previous trial lesson in this course, maintaining exactly
                  one free demo video per course.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingLessonId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="button-secondary text-xs"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="button-primary text-xs bg-emerald-400 text-slate-950 font-semibold"
            >
              {isPending ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
