'use client'

import React, { useState } from 'react'
import { Icon } from '@frontend/components/icons'

export function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setError(null)

    // Simulate async delivery
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' })
    } catch {
      setError('An error occurred while sending your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow">Direct Faculty & Support Channel</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
          Contact the <span className="text-gradient">SANGAM Team</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Have questions regarding our curriculum, enterprise team licenses, or platform features?
          Send us a message and our team will get back to you shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Contact Form */}
        <div className="card p-8 lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">Send an Inquiry</h2>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
              <div className="grid size-14 place-items-center rounded-2xl bg-emerald-400 text-slate-950 mx-auto font-bold text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-bold text-white">Inquiry Received</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you for contacting SANGAM. A member of our security architecture faculty or
                admissions team will review your message and reply within 24 business hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="button-secondary text-xs mt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Your Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. alex@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Subject Category
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  <option value="General Inquiry">General Curriculum Inquiry</option>
                  <option value="Enterprise Licensing">Enterprise & Team Licensing</option>
                  <option value="Technical Support">Technical & Laboratory Support</option>
                  <option value="Billing & Refunds">Billing, Invoices & Refunds</option>
                  <option value="Course Feedback">Curriculum Feedback & Suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Message Details <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry, architecture background, or specific questions..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="button-primary w-full justify-center py-3 text-sm font-semibold"
              >
                {submitting ? 'Transmitting Message...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column (1 Col): Verified Support Details & Enterprise */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Support Channels</h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-base">✉️</span>
                <div>
                  <p className="font-semibold text-white">Official Support Email</p>
                  <p className="text-slate-400 select-all">support@sangam.edu</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-base">⏱️</span>
                <div>
                  <p className="font-semibold text-white">Turnaround SLA</p>
                  <p className="text-slate-400">Within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-base">📍</span>
                <div>
                  <p className="font-semibold text-white">HQ & R&amp;D Center</p>
                  <p className="text-slate-400">Tech Corridor, New Delhi &amp; Bengaluru, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400 text-base">🛡️</span>
                <div>
                  <p className="font-semibold text-white">Responsible Disclosure</p>
                  <p className="text-slate-400">security@sangam.edu (PGP key upon request)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 border-emerald-500/20 bg-emerald-500/[0.02]">
            <h3 className="text-base font-bold text-white">Enterprise & Team Training</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Equip your solutions architecture, DevOps, and AppSec teams with bulk access, customized
              threat modeling workshops, and centralized manager dashboards.
            </p>
            <div className="mt-4">
              <span className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                GST / Corporate Invoicing Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
