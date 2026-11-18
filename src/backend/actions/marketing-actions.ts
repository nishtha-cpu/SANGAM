'use server'

import fs from 'fs'
import path from 'path'
import { getAdminUser } from '../../admin-panel/auth/admin-auth'

export interface TestimonialItem {
  id: string
  author: string
  role: string
  company: string
  content: string
  rating: number
  published: boolean
  updatedAt?: string
}

export interface PromoCardItem {
  id: string
  badge: string
  title: string
  description: string
  linkText: string
  linkHref: string
  active: boolean
}

const MARKETING_FILE = path.resolve(process.cwd(), 'scratch/dev-marketing.json')

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test_01',
    author: 'Vikram Malhotra',
    role: 'Principal Security Architect',
    company: 'Fintech Cloud Core',
    content:
      'SANGAM provides the most realistic zero-trust threat modeling scenarios I have seen. The design review rubrics match actual enterprise architecture board standards.',
    rating: 5,
    published: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test_02',
    author: 'Sarah Jenkins',
    role: 'Staff Solutions Engineer',
    company: 'HyperScale Infrastructure',
    content:
      'The step-by-step security pattern library and instant assessment feedback helped our cloud team standardize landing zone controls across multi-region deployments.',
    rating: 5,
    published: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test_03',
    author: 'Ananya Sharma',
    role: 'Lead Cloud Security Architect',
    company: 'Apex Digital Bank',
    content:
      'Hands-on architecture reviews with clear scoring criteria elevate theoretical security knowledge into real production-ready engineering decisions.',
    rating: 5,
    published: true,
    updatedAt: new Date().toISOString(),
  },
]

const DEFAULT_PROMO_CARDS: PromoCardItem[] = [
  {
    id: 'promo_01',
    badge: 'Enterprise Architecture',
    title: 'Zero Trust Micro-Segmentation',
    description: 'Enforce dynamic policy enforcement points across distributed cloud workloads.',
    linkText: 'Explore Module',
    linkHref: '/recorded-classes/zero-trust',
    active: true,
  },
  {
    id: 'promo_02',
    badge: 'Threat Modeling Studio',
    title: 'Interactive Design Reviews',
    description: 'Submit diagrams for automated security validation against STRIDE and NIST frameworks.',
    linkText: 'Start Review',
    linkHref: '/design-review',
    active: true,
  },
]

function getMarketingData(): { testimonials: TestimonialItem[]; promoCards: PromoCardItem[] } {
  try {
    if (fs.existsSync(MARKETING_FILE)) {
      return JSON.parse(fs.readFileSync(MARKETING_FILE, 'utf8'))
    }
  } catch {}
  return {
    testimonials: DEFAULT_TESTIMONIALS,
    promoCards: DEFAULT_PROMO_CARDS,
  }
}

function saveMarketingData(data: { testimonials: TestimonialItem[]; promoCards: PromoCardItem[] }) {
  try {
    const dir = path.dirname(MARKETING_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(MARKETING_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('[marketing-actions] Failed to save marketing data:', err)
  }
}

/**
 * Public action: retrieve published testimonials and active promo cards (WS-5, WS-10).
 */
export async function getPublicMarketingContentAction(): Promise<{
  testimonials: TestimonialItem[]
  promoCards: PromoCardItem[]
}> {
  const data = getMarketingData()
  return {
    testimonials: data.testimonials.filter((t) => t.published),
    promoCards: data.promoCards.filter((p) => p.active),
  }
}

/**
 * Admin action: retrieve all testimonials and promotional cards including drafts (AD-8).
 */
export async function getAdminMarketingContentAction(): Promise<{
  testimonials: TestimonialItem[]
  promoCards: PromoCardItem[]
}> {
  const admin = await getAdminUser()
  if (!admin) {
    return { testimonials: [], promoCards: [] }
  }
  return getMarketingData()
}

/**
 * Admin action: create or update a testimonial (AD-8).
 */
export async function saveTestimonialAction(
  testimonial: Partial<TestimonialItem> & { author: string; content: string }
): Promise<{ ok: boolean; message: string }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { ok: false, message: 'Unauthorized: Admin privileges required.' }
  }

  if (!testimonial.author || !testimonial.content) {
    return { ok: false, message: 'Author and content are required.' }
  }

  const data = getMarketingData()
  const now = new Date().toISOString()

  if (testimonial.id) {
    const idx = data.testimonials.findIndex((t) => t.id === testimonial.id)
    if (idx >= 0) {
      data.testimonials[idx] = {
        ...data.testimonials[idx],
        ...testimonial,
        updatedAt: now,
      }
    } else {
      data.testimonials.push({
        id: testimonial.id,
        author: testimonial.author,
        role: testimonial.role || 'Security Architect',
        company: testimonial.company || 'Enterprise',
        content: testimonial.content,
        rating: testimonial.rating || 5,
        published: testimonial.published !== undefined ? testimonial.published : true,
        updatedAt: now,
      })
    }
  } else {
    data.testimonials.push({
      id: `test_${Date.now()}`,
      author: testimonial.author,
      role: testimonial.role || 'Security Architect',
      company: testimonial.company || 'Enterprise',
      content: testimonial.content,
      rating: testimonial.rating || 5,
      published: testimonial.published !== undefined ? testimonial.published : true,
      updatedAt: now,
    })
  }

  saveMarketingData(data)
  return { ok: true, message: 'Testimonial saved successfully.' }
}

/**
 * Admin action: toggle publish status of a testimonial (AD-8).
 */
export async function toggleTestimonialStatusAction(
  id: string
): Promise<{ ok: boolean; message: string }> {
  const admin = await getAdminUser()
  if (!admin) return { ok: false, message: 'Unauthorized.' }

  const data = getMarketingData()
  const item = data.testimonials.find((t) => t.id === id)
  if (!item) return { ok: false, message: 'Testimonial not found.' }

  item.published = !item.published
  item.updatedAt = new Date().toISOString()
  saveMarketingData(data)

  return { ok: true, message: `Testimonial is now ${item.published ? 'published' : 'hidden'}.` }
}
