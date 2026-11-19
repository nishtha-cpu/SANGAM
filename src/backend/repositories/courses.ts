import fs from 'fs'
import path from 'path'

export interface CourseLesson {
  id: string
  title: string
  description?: string
  duration: string
  videoUrl?: string
  order: number
  isTrial: boolean // Module 6: Exactly one trial video per course
  isPremium: boolean
  published?: boolean
}

export interface CourseItem {
  id: string
  slug: string
  title: string
  category: string
  description: string
  whatYouWillLearn: string[]
  instructor: string
  instructorRole: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  currency: string
  validityDays: number
  thumbnailUrl: string
  published: boolean
  lessons: CourseLesson[]
  createdAt?: string
  updatedAt?: string
}

const COURSES_FILE = path.resolve(process.cwd(), 'scratch/dev-courses.json')

export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'crs_zero_trust',
    slug: 'zero-trust-cloud-architecture',
    title: 'Zero Trust Cloud Architecture & NIST SP 800-207',
    category: 'Zero Trust',
    description:
      'Master the principles of identity-driven perimeterless defense, micro-segmentation, and dynamic Policy Enforcement Points (PEP) across AWS and Azure landing zones.',
    whatYouWillLearn: [
      'Design Policy Decision Points (PDP) & Enforcement Points (PEP)',
      'Implement Mutual TLS (mTLS) and SPIFFE/SPIRE workload identities',
      'Automate micro-segmentation across multi-region Kubernetes clusters',
      'Defend against credential-stuffing and lateral movement attacks',
    ],
    instructor: 'Dr. Maya Chen',
    instructorRole: 'Principal Security Architect',
    duration: '6h 45 min',
    level: 'Advanced',
    price: 129,
    currency: 'USD',
    validityDays: 365,
    thumbnailUrl: '/assets/zero-trust.svg',
    published: true,
    lessons: [
      {
        id: 'lsn_zt_01',
        title: 'Lesson 1: Foundations of Zero Trust & Control Plane Architecture',
        description: 'Deep dive into NIST 800-207 core tenets, implicit trust removal, and continuous authentication.',
        duration: '42 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        order: 1,
        isTrial: true, // FREE TRIAL DEMO
        isPremium: false,
        published: true,
      },
      {
        id: 'lsn_zt_02',
        title: 'Lesson 2: Identity as the Primary Boundary (OIDC, SAML, & Session Binding)',
        description: 'Hardening token lifecycles, refresh token rotation, and Proof-of-Possession tokens.',
        duration: '55 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        order: 2,
        isTrial: false,
        isPremium: true,
        published: true,
      },
      {
        id: 'lsn_zt_03',
        title: 'Lesson 3: Workload Identity Federation & SPIFFE/SPIRE Deployment',
        description: 'Establishing cryptographically verified identity between heterogeneous microservices.',
        duration: '1h 10 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        order: 3,
        isTrial: false,
        isPremium: true,
        published: true,
      },
      {
        id: 'lsn_zt_04',
        title: 'Lesson 4: Software-Defined Perimeter & Micro-segmentation Lab',
        description: 'Hands-on firewall policy automation and zero-trust service mesh configuration.',
        duration: '58 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        order: 4,
        isTrial: false,
        isPremium: true,
        published: true,
      },
    ],
  },
  {
    id: 'crs_threat_modeling',
    slug: 'enterprise-threat-modeling-stride',
    title: 'Enterprise Threat Modeling & Attack Surface Reduction',
    category: 'Threat Modeling',
    description:
      'Learn systematic threat modeling methodologies using STRIDE, DREAD, and attack trees to uncover design flaws before code is deployed.',
    whatYouWillLearn: [
      'Deconstruct complex system architectures into comprehensive Data Flow Diagrams (DFDs)',
      'Apply STRIDE per element (Processes, Data Stores, Data Flows, Trust Boundaries)',
      'Formulate actionable security controls for high-risk threat scenarios',
      'Integrate threat modeling into Agile sprint and CI/CD development cycles',
    ],
    instructor: 'Marcus Lee',
    instructorRole: 'Staff Infrastructure Security Engineer',
    duration: '5h 15 min',
    level: 'Intermediate',
    price: 89,
    currency: 'USD',
    validityDays: 180,
    thumbnailUrl: '/assets/threat-modeling.svg',
    published: true,
    lessons: [
      {
        id: 'lsn_tm_01',
        title: 'Lesson 1: Threat Modeling Essentials & Drawing Trust Boundaries',
        description: 'The four question framework of threat modeling and identifying trust boundary crossings.',
        duration: '38 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        order: 1,
        isTrial: true, // FREE TRIAL DEMO
        isPremium: false,
        published: true,
      },
      {
        id: 'lsn_tm_02',
        title: 'Lesson 2: STRIDE Deep Dive — Spoofing, Tampering & Repudiation',
        description: 'Practical analysis of authentication, message integrity, and audit logging defenses.',
        duration: '48 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        order: 2,
        isTrial: false,
        isPremium: true,
        published: true,
      },
      {
        id: 'lsn_tm_03',
        title: 'Lesson 3: Information Disclosure, DoS & Elevation of Privilege',
        description: 'Detecting data leakage paths and authorization bypass vectors in API designs.',
        duration: '52 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        order: 3,
        isTrial: false,
        isPremium: true,
        published: true,
      },
    ],
  },
  {
    id: 'crs_crypto_pqc',
    slug: 'post-quantum-cryptography-data-security',
    title: 'Post-Quantum Cryptography & Enterprise Data Protection',
    category: 'Cryptography',
    description:
      'Prepare enterprise systems for quantum threats with lattice-based cryptography, hybrid key exchange (ML-KEM/Kyber), and digital signatures (ML-DSA/Dilithium).',
    whatYouWillLearn: [
      'Transition classical RSA/ECC encryption to NIST standardized PQC algorithms',
      'Architect envelope encryption patterns with Hardware Security Modules (HSMs)',
      'Design forward-secret data protection for sensitive multi-tenant databases',
      'Perform cryptographic inventory and agility assessments across legacy systems',
    ],
    instructor: 'Elena Rostova',
    instructorRole: 'Cryptographic Security Lead',
    duration: '7h 30 min',
    level: 'Advanced',
    price: 149,
    currency: 'USD',
    validityDays: 365,
    thumbnailUrl: '/assets/cryptography.svg',
    published: true,
    lessons: [
      {
        id: 'lsn_pqc_01',
        title: 'Lesson 1: The Quantum Threat Horizon & Cryptographic Agility',
        description: 'Understanding Shor’s algorithm, Harvest Now Decrypt Later attacks, and algorithm migration planning.',
        duration: '45 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        order: 1,
        isTrial: true, // FREE TRIAL DEMO
        isPremium: false,
        published: true,
      },
      {
        id: 'lsn_pqc_02',
        title: 'Lesson 2: NIST PQC Standards — ML-KEM, ML-DSA & SLH-DSA',
        description: 'Lattice cryptography fundamentals and benchmark comparisons with classical suites.',
        duration: '1h 05 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        order: 2,
        isTrial: false,
        isPremium: true,
        published: true,
      },
      {
        id: 'lsn_pqc_03',
        title: 'Lesson 3: Hybrid TLS 1.3 Key Exchange Implementation',
        description: 'Combining X25519 with ML-KEM-768 for quantum-resistant web ingress.',
        duration: '56 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        order: 3,
        isTrial: false,
        isPremium: true,
        published: true,
      },
    ],
  },
]

export function getAllCourses(): CourseItem[] {
  try {
    if (fs.existsSync(COURSES_FILE)) {
      const data = JSON.parse(fs.readFileSync(COURSES_FILE, 'utf8'))
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  return DEFAULT_COURSES
}

export function getCourseBySlug(slug: string): CourseItem | null {
  const courses = getAllCourses()
  const match = courses.find((c) => c.slug === slug || c.id === slug)
  return match || null
}

export function saveCourse(course: Partial<CourseItem> & { title: string; slug: string }): CourseItem {
  const courses = getAllCourses()
  const now = new Date().toISOString()

  let lessons = course.lessons || []

  // ENFORCE MODULE 6 INVARIANT: Exactly one trial video per course
  // If more than one lesson is marked isTrial, keep only the latest one marked as trial
  let trialCount = lessons.filter((l) => l.isTrial).length
  if (trialCount > 1) {
    let foundFirst = false
    lessons = lessons.map((l) => {
      if (l.isTrial) {
        if (!foundFirst) {
          foundFirst = true
          return l
        }
        return { ...l, isTrial: false }
      }
      return l
    })
  } else if (trialCount === 0 && lessons.length > 0) {
    // If no lesson is marked trial, mark the first lesson as trial demo
    lessons[0].isTrial = true
    lessons[0].isPremium = false
  }

  const existingIdx = courses.findIndex((c) => c.id === course.id || c.slug === course.slug)

  let finalCourse: CourseItem
  if (existingIdx >= 0) {
    finalCourse = {
      ...courses[existingIdx],
      ...course,
      lessons,
      updatedAt: now,
    }
    courses[existingIdx] = finalCourse
  } else {
    finalCourse = {
      id: course.id || `crs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: course.slug,
      title: course.title,
      category: course.category || 'Security Architecture',
      description: course.description || '',
      whatYouWillLearn: course.whatYouWillLearn || [
        'Enterprise threat landscape defense',
        'Architecture pattern implementation',
      ],
      instructor: course.instructor || 'Staff Instructor',
      instructorRole: course.instructorRole || 'Security Architect',
      duration: course.duration || '4 hours',
      level: course.level || 'Intermediate',
      price: course.price ?? 99,
      currency: course.currency || 'USD',
      validityDays: course.validityDays ?? 365,
      thumbnailUrl: course.thumbnailUrl || '/assets/zero-trust.svg',
      published: course.published ?? true,
      lessons,
      createdAt: now,
      updatedAt: now,
    }
    courses.push(finalCourse)
  }

  try {
    const dir = path.dirname(COURSES_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2), 'utf8')
  } catch (err) {
    console.error('[courses-repository] Failed to persist courses store:', err)
  }

  return finalCourse
}

export function deleteCourse(idOrSlug: string): boolean {
  const courses = getAllCourses()
  const filtered = courses.filter((c) => c.id !== idOrSlug && c.slug !== idOrSlug)
  if (filtered.length === courses.length) return false

  try {
    fs.writeFileSync(COURSES_FILE, JSON.stringify(filtered, null, 2), 'utf8')
    return true
  } catch {
    return false
  }
}
