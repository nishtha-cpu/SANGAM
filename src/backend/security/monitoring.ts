import fs from 'fs'
import path from 'path'

export interface SecurityEvent {
  id: string
  timestamp: string
  type: 'auth_failure' | 'rate_limit' | 'unauthorized_access' | 'error' | 'security_audit'
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: string
  ip?: string
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptimeSeconds: number
  nodeVersion: string
  memoryUsageMb: {
    rss: number
    heapTotal: number
    heapUsed: number
  }
  recentAlertsCount: number
  recentEvents: SecurityEvent[]
}

const EVENTS_FILE = path.resolve(process.cwd(), 'scratch/security-events.json')
const startTime = Date.now()

function getLoggedEvents(): SecurityEvent[] {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'))
    }
  } catch {}
  return []
}

function saveLoggedEvents(events: SecurityEvent[]) {
  try {
    const dir = path.dirname(EVENTS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events.slice(-100), null, 2), 'utf8')
  } catch {}
}

/**
 * Log a structured runtime security or health event (OP-2).
 */
export function recordSecurityEvent(
  type: SecurityEvent['type'],
  severity: SecurityEvent['severity'],
  details: string,
  ip?: string
): SecurityEvent {
  const event: SecurityEvent = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    severity,
    details,
    ip: ip || '127.0.0.1',
  }

  const events = getLoggedEvents()
  events.push(event)
  saveLoggedEvents(events)

  return event
}

/**
 * Retrieve system uptime, memory, and telemetry health snapshot (OP-2).
 */
export function getSystemHealthSnapshot(): SystemHealthStatus {
  const mem = process.memoryUsage()
  const events = getLoggedEvents()
  const highSev = events.filter((e) => e.severity === 'high' || e.severity === 'critical')

  return {
    status: highSev.length > 5 ? 'degraded' : 'healthy',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    nodeVersion: process.version,
    memoryUsageMb: {
      rss: Math.round(mem.rss / (1024 * 1024)),
      heapTotal: Math.round(mem.heapTotal / (1024 * 1024)),
      heapUsed: Math.round(mem.heapUsed / (1024 * 1024)),
    },
    recentAlertsCount: highSev.length,
    recentEvents: events.slice(-10),
  }
}
