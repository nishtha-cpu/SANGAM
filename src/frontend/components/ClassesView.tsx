'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { Icon } from '@frontend/components/icons'
import { Empty } from '@frontend/components/Empty'
import { curriculumClasses } from '@frontend/data/curriculum'
import { recordWatchProgressAction } from '@/backend/actions/video-actions'

export interface ClassesViewProps {
  player?: boolean
}

export function ClassesView({ player = false }: ClassesViewProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All classes')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Player states (VD-4, VD-5, VD-7)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [progressSeconds, setProgressSeconds] = useState<number>(340) // ~5.6 mins
  const [totalSeconds] = useState<number>(3120) // 52 mins
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [, startProgressTransition] = useTransition()

  // Simulate playback time counter when playing
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressSeconds((prev) => {
          const next = prev + Math.floor(playbackSpeed)
          if (next >= totalSeconds) {
            setIsPlaying(false)
            setIsCompleted(true)
            startProgressTransition(async () => {
              await recordWatchProgressAction({
                classSlug: 'zero-trust',
                secondsWatched: totalSeconds,
                lastPositionSeconds: totalSeconds,
                completed: true,
              })
            })
            return totalSeconds
          }
          return next
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, totalSeconds])

  // Periodic heartbeat sync to backend database every 10 seconds of play
  useEffect(() => {
    if (isPlaying && progressSeconds % 10 === 0 && progressSeconds > 0) {
      startProgressTransition(async () => {
        await recordWatchProgressAction({
          classSlug: 'zero-trust',
          secondsWatched: progressSeconds,
          lastPositionSeconds: progressSeconds,
          completed: isCompleted,
        })
      })
    }
  }, [progressSeconds, isPlaying, isCompleted])

  const handleTogglePlay = () => {
    const nextState = !isPlaying
    setIsPlaying(nextState)
    if (!nextState) {
      // Record pause position
      startProgressTransition(async () => {
        await recordWatchProgressAction({
          classSlug: 'zero-trust',
          secondsWatched: progressSeconds,
          lastPositionSeconds: progressSeconds,
          completed: isCompleted,
        })
      })
    }
  }

  const handleMarkCompleted = () => {
    const nextComp = !isCompleted
    setIsCompleted(nextComp)
    startProgressTransition(async () => {
      await recordWatchProgressAction({
        classSlug: 'zero-trust',
        secondsWatched: progressSeconds,
        lastPositionSeconds: progressSeconds,
        completed: nextComp,
      })
    })
  }

  const list = useMemo(() => {
    const filtered = curriculumClasses.filter(
      (c) =>
        `${c.title} ${c.instructor}`.toLowerCase().includes(query.toLowerCase()) &&
        (filter === 'All classes' || (filter === 'Watched' ? c.watched : !c.watched)),
    )
    if (sortOrder === 'oldest') {
      return [...filtered].reverse()
    }
    return filtered
  }, [query, filter, sortOrder])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = Math.min(100, Math.round((progressSeconds / totalSeconds) * 100))

  if (player) {
    return (
      <PageFrame title="Zero Trust Architecture in Practice" eyebrow="Recorded class (VD-1)">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {/* Custom Video Player Container (VD-4) */}
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
              <img
                src={curriculumClasses[0].image}
                alt="Instructor-led security architecture class"
                className={`h-full w-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-85' : 'opacity-55'}`}
              />
              
              {/* Play / Pause Central Button */}
              <button
                onClick={handleTogglePlay}
                className="absolute left-1/2 top-1/2 grid size-18 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-300 text-[#06111f] shadow-2xl transition-transform hover:scale-110 active:scale-95"
                title={isPlaying ? 'Pause' : 'Play video'}
              >
                {isPlaying ? (
                  <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <Icon name="play" className="ml-1 size-7" />
                )}
              </button>

              {/* Progress bar and controls overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5">
                {/* Scrubbing bar (VD-4) */}
                <div
                  className="group relative h-2 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2.5"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const fraction = clickX / rect.width
                    const newSecs = Math.floor(fraction * totalSeconds)
                    setProgressSeconds(newSecs)
                  }}
                >
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Player Toolbar Controls (VD-5) */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleTogglePlay}
                      className="font-medium text-emerald-300 hover:text-emerald-200"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <span>
                      {formatTime(progressSeconds)} / {formatTime(totalSeconds)} ({progressPercent}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Playback speed toggle (VD-5) */}
                    <div className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5">
                      <span className="text-[10px] text-slate-400">Speed:</span>
                      {[1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                            playbackSpeed === spd ? 'bg-emerald-400 text-black' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Mark as watched (VD-7) */}
                    <button
                      onClick={handleMarkCompleted}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon name="check" className="size-3.5" />
                      {isCompleted ? 'Completed' : 'Mark Completed'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="font-medium text-white">Dr. Maya Chen</span>
              <span>•</span>
              <span>12 Jun 2026</span>
              <span>•</span>
              <span>52 minutes</span>
              <span>•</span>
              <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
                Zero Trust Architecture
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold text-white">
              Zero Trust Architecture in Practice
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              Explore practical identity signals, continuous verification, micro-segmentation, and policy enforcement points for modern hybrid enterprise architectures. This masterclass covers NIST SP 800-207 principles, software-defined perimeters (SDP), and step-by-step threat modeling against lateral movement attacks.
            </p>
          </div>

          <aside>
            <h2 className="mb-4 font-semibold text-white">Related Classes (VD-2)</h2>
            <div className="space-y-3">
              {curriculumClasses.slice(1).map((c) => (
                <Link
                  href="/recorded-classes/zero-trust"
                  key={c.title}
                  className="card flex gap-3 p-3 transition hover:border-white/20"
                >
                  <img src={c.image} alt="" className="h-18 w-24 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium leading-5 text-slate-200">{c.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{c.duration} • {c.instructor}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame title="Recorded Classes" eyebrow="Learn from security practitioners">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-11"
            placeholder="Search by class, lecture or instructor (VD-2)"
          />
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input sm:w-44"
        >
          <option>All classes</option>
          <option>Watched</option>
          <option>Unwatched</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="input sm:w-48"
        >
          <option value="newest">Newest to Oldest</option>
          <option value="oldest">Oldest to Newest</option>
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {list.map((c) => (
          <article className="card overflow-hidden" key={c.title}>
            <div className="relative h-54 overflow-hidden">
              <img
                src={c.image}
                alt={`${c.title} class`}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
              <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-[#06111f]/85 px-3 py-1.5 text-[10px] font-medium text-slate-200">
                {c.watched ? 'Watched' : 'Unwatched'}
              </span>
              <span className="absolute bottom-4 right-4 rounded-lg bg-black/70 px-2 py-1 text-xs text-white">
                {c.duration}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white">{c.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{c.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300">{c.instructor}</p>
                  <p className="mt-1 text-[11px] text-slate-600">{c.date}</p>
                </div>
                <Link href="/recorded-classes/zero-trust" className="button-secondary py-2.5">
                  Watch now <Icon name="play" className="size-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!list.length && (
        <Empty
          title="No classes found"
          text="Try a broader search or clear the selected status filter."
        />
      )}
    </PageFrame>
  )
}
