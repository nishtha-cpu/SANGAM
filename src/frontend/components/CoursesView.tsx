'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@frontend/layouts/Header'
import { Footer } from '@frontend/layouts/Footer'
import { Icon } from '@frontend/components/icons'
import type { CourseItem } from '@/backend/repositories/courses'

interface CoursesViewProps {
  initialCourses: CourseItem[]
}

export function CoursesView({ initialCourses }: CoursesViewProps) {
  const [courses] = useState<CourseItem[]>(initialCourses)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categories = ['All', 'Zero Trust', 'Threat Modeling', 'Cryptography']

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#040c17] text-white">
      <Header />
      <main className="flex-1 pb-24">
        {/* Banner Section */}
        <section className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-[#08182b] to-[#040c17] py-16 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(52,211,153,.1),transparent_35%)]" />
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8 relative z-10">
            <span className="eyebrow mb-3">Enterprise Curriculum</span>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Security Architecture Courses
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
              Immerse yourself in structured, production-grade security architecture modules. Each course includes <strong className="text-emerald-400">one free trial demo lecture</strong>, hands-on design labs, and real-world threat assessments.
            </p>

            {/* Search and Filters */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      selectedCategory === cat
                        ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, instructors..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="mx-auto max-w-[1280px] px-5 pt-12 lg:px-8">
          <div className="flex items-center justify-between pb-6">
            <p className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredCourses.length}</strong> available courses
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const trialLesson = course.lessons.find((l) => l.isTrial)
              return (
                <div
                  key={course.id}
                  className="card group flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:border-emerald-400/30 hover:shadow-2xl hover:shadow-emerald-400/5"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between">
                      <span className="badge border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-[10px]">
                        {course.category}
                      </span>
                      <span className="text-[11px] text-slate-400">{course.level}</span>
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition">
                        <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Icon name="video" className="size-3.5 text-slate-500" />
                        {course.lessons.length} lessons
                      </span>
                      <span>•</span>
                      <span>{course.duration}</span>
                    </div>

                    {/* Trial Demo Badge */}
                    {trialLesson && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                          </span>
                          Free Demo Available
                        </span>
                        <span className="text-[10px] text-slate-400">Lesson 1</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5">
                    <div>
                      <span className="text-2xl font-bold text-white">${course.price}</span>
                      <span className="text-[11px] text-slate-500 ml-1">/ {course.validityDays} days</span>
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="button-primary text-xs !py-2 !px-4"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
