'use client'

import React, { useState } from 'react'
import { CourseItem } from '@/backend/repositories/courses'

interface CourseManagementModalProps {
  course?: CourseItem | null
  onClose: () => void
  onSave: (courseData: Partial<CourseItem>) => void
  isPending: boolean
}

export function CourseManagementModal({
  course,
  onClose,
  onSave,
  isPending,
}: CourseManagementModalProps) {
  const [formData, setFormData] = useState({
    id: course?.id || '',
    title: course?.title || '',
    slug: course?.slug || '',
    category: course?.category || 'Zero Trust',
    description: course?.description || '',
    instructor: course?.instructor || 'Dr. Maya Chen',
    instructorRole: course?.instructorRole || 'Principal Security Architect',
    duration: course?.duration || '4h 30 min',
    level: course?.level || 'Intermediate',
    price: course?.price || 99,
    currency: course?.currency || 'USD',
    validityDays: course?.validityDays || 365,
    published: course?.published !== undefined ? course.published : true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="card max-w-2xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-lg font-bold text-white">
            {course ? 'Edit Architecture Course' : 'Create Architecture Course (Module 5)'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Distributed Identity & Zero Trust"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Slug (URL Identifier)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated from title if blank"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="Zero Trust">Zero Trust</option>
              <option value="Threat Modeling">Threat Modeling</option>
              <option value="Cryptography">Cryptography</option>
              <option value="Cloud Security">Cloud Security</option>
              <option value="DevSecOps">DevSecOps</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Level
            </label>
            <select
              value={formData.level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced',
                })
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lead Instructor
            </label>
            <input
              type="text"
              required
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Total Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 5h 15 min"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Access Validity (Days)
            </label>
            <input
              type="number"
              min="30"
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Course Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed learning objectives and architecture outcomes..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="publishedToggle"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="size-4 rounded accent-emerald-400"
          />
          <label htmlFor="publishedToggle" className="text-xs text-slate-300 cursor-pointer">
            Publish Course to Public Catalog immediately
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button type="button" onClick={onClose} className="button-secondary text-xs">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="button-primary text-xs bg-emerald-400 text-slate-950 font-semibold"
          >
            {isPending ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </form>
    </div>
  )
}
