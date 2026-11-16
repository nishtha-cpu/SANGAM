'use client'

import { useState } from 'react'

export function useDiagramCanvas(initialPatterns: string[] = ['Multi-Factor Authentication', 'AES-256']) {
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(initialPatterns)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)

  const togglePattern = (pattern: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(pattern) ? prev.filter((p) => p !== pattern) : [...prev, pattern]
    )
  }

  const zoomIn = () => setZoomLevel((prev) => Math.min(150, prev + 15))
  const zoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 15))

  return {
    selectedPatterns,
    togglePattern,
    isPanelOpen,
    togglePanel: () => setIsPanelOpen((prev) => !prev),
    zoomLevel,
    zoomIn,
    zoomOut,
  }
}
