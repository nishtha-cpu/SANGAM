import fs from 'fs'
import path from 'path'

export interface QuizQuestionItem {
  id: string
  question: string
  options: string[]
  correctAnswer: number // 0-based index of correct option
  marks: number
  explanation?: string
}

export interface QuizRecord {
  id: string
  title: string
  slug: string
  domain: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  durationMinutes: number
  passingScore: number // Percentage required to pass (e.g. 80)
  attemptLimit: number // Max attempts allowed (0 = unlimited)
  published: boolean
  courseSlug?: string
  questions: QuizQuestionItem[]
  createdAt?: string
  updatedAt?: string
}

const QUIZZES_FILE = path.resolve(process.cwd(), 'scratch/dev-quizzes.json')

export const DEFAULT_QUIZZES: QuizRecord[] = [
  {
    id: 'quiz_sec_fund',
    slug: 'security-architecture-fundamentals',
    title: 'Security Architecture Fundamentals',
    domain: 'Core Security Principles',
    difficulty: 'Beginner',
    durationMinutes: 20,
    passingScore: 80,
    attemptLimit: 3,
    published: true,
    courseSlug: 'zero-trust-cloud-architecture',
    questions: [
      {
        id: 'q1',
        question:
          'Which architectural principle dictates that a subject should only be given the bare minimum privileges necessary to complete its assigned task?',
        options: [
          'Defense in depth',
          'Least privilege',
          'Fail-safe defaults',
          'Separation of duties',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation:
          'Least privilege minimizes attack blast radius by restricting human and service identities to only the specific permissions necessary for their duties.',
      },
      {
        id: 'q2',
        question:
          'In OpenID Connect (OIDC), which token is cryptographically designed to convey end-user identity assertion claims directly to the client application?',
        options: ['Access token', 'Refresh token', 'ID token', 'Client assertion token'],
        correctAnswer: 2,
        marks: 10,
        explanation:
          'The ID Token is a signed JWT consumable by the client application to prove the identity and authentication context of the user.',
      },
      {
        id: 'q3',
        question:
          'Which AES cipher mode provides authenticated encryption with associated data (AEAD), guaranteeing both confidentiality and message integrity?',
        options: [
          'Electronic Codebook (ECB)',
          'Cipher Block Chaining (CBC)',
          'Counter Mode (CTR)',
          'Galois/Counter Mode (GCM)',
        ],
        correctAnswer: 3,
        marks: 10,
        explanation:
          'GCM mode provides authenticated encryption (AEAD), combining counter mode for confidentiality with Galois authentication for ciphertext integrity.',
      },
      {
        id: 'q4',
        question:
          'Under the STRIDE threat modeling framework, which threat category specifically addresses an attacker modifying data in transit or at rest?',
        options: ['Spoofing', 'Tampering', 'Repudiation', 'Elevation of privilege'],
        correctAnswer: 1,
        marks: 10,
        explanation:
          'Tampering violates integrity, representing unauthorized modification of parameters, network packets, or persistent datastore records.',
      },
      {
        id: 'q5',
        question:
          'When designing a distributed microservices perimeter, what component dynamically validates contextual identity and posture before admitting network traffic?',
        options: [
          'Stateful Packet Inspection Firewall',
          'Policy Enforcement Point (PEP)',
          'Border Gateway Router',
          'Network Address Translator (NAT)',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation:
          'In Zero Trust Architecture (NIST SP 800-207), the Policy Enforcement Point (PEP) intercepts traffic and consults the Policy Decision Point (PDP).',
      },
      {
        id: 'q6',
        question:
          'Which cryptographic mitigation provides defense against replay attacks in stateless REST API authentication headers?',
        options: [
          'Asymmetric private keys',
          'Cryptographic nonces and short expiration timestamps',
          'Base64 encoding',
          'Diffie-Hellman ephemeral exchange',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation:
          'Cryptographic nonces combined with strict, tightly synchronized timestamp windows prevent attackers from intercepting and replaying valid requests.',
      },
      {
        id: 'q7',
        question:
          'What is the primary vulnerability when using client-side JWT storage without HttpOnly and SameSite cookie attributes?',
        options: [
          'Denial of Service (DoS)',
          'Cross-Site Scripting (XSS) token exfiltration',
          'SQL Injection',
          'Buffer Overflow',
        ],
        correctAnswer: 1,
        marks: 10,
        explanation:
          'Tokens kept in localStorage or accessible cookies can be stolen if an attacker finds any XSS injection flaw in the web application.',
      },
    ],
  },
  {
    id: 'quiz_zero_trust',
    slug: 'zero-trust-architecture-quiz',
    title: 'Zero Trust & NIST SP 800-207 Assessment',
    domain: 'Zero Trust Architecture',
    difficulty: 'Intermediate',
    durationMinutes: 25,
    passingScore: 80,
    attemptLimit: 3,
    published: true,
    courseSlug: 'zero-trust-cloud-architecture',
    questions: [
      {
        id: 'zt_q1',
        question:
          'In NIST SP 800-207, which core component makes the authoritative decision to grant, deny, or revoke access to an enterprise resource?',
        options: [
          'Policy Enforcement Point (PEP)',
          'Policy Decision Point (PDP)',
          'Web Application Firewall (WAF)',
          'Hardware Security Module (HSM)',
        ],
        correctAnswer: 1,
        marks: 20,
        explanation:
          'The Policy Decision Point (PDP) consists of the Policy Engine (PE) and Policy Administrator (PA), evaluating contextual trust signals.',
      },
      {
        id: 'zt_q2',
        question:
          'Which identity framework provides cryptographic SVIDs (SPIFFE Verifiable Identity Documents) for zero-trust service-to-service authentication?',
        options: ['Kerberos V5', 'SPIFFE / SPIRE', 'OAuth 2.0 Implicit Grant', 'SAML 2.0 WebSSO'],
        correctAnswer: 1,
        marks: 20,
        explanation:
          'SPIFFE provides an open standard for securely identifying software systems in dynamic, heterogeneous cloud environments.',
      },
      {
        id: 'zt_q3',
        question:
          'What is the fundamental tenet of network micro-segmentation in a Zero Trust datacenter?',
        options: [
          'Trusting all internal network traffic once inside the VPN perimeter',
          'Enforcing least-privilege egress and ingress firewall rules at every individual workload boundary',
          'Relying solely on IP address allowlisting',
          'Disabling all outbound HTTPS traffic',
        ],
        correctAnswer: 1,
        marks: 20,
        explanation:
          'Micro-segmentation isolates workloads individually to prevent lateral threat movement across the internal subnet.',
      },
      {
        id: 'zt_q4',
        question:
          'How does Continuous Adaptive Risk and Trust Assessment (CARTA) enhance access control?',
        options: [
          'Evaluates risk only once during initial user login',
          'Continuously reassesses device posture, location, and user behavior throughout an active session',
          'Eliminates password complexity requirements',
          'Automates database backups every minute',
        ],
        correctAnswer: 1,
        marks: 20,
        explanation:
          'CARTA continuously inspects contextual anomalies and can step up authentication or revoke session credentials mid-session.',
      },
      {
        id: 'zt_q5',
        question:
          'Why is Mutual TLS (mTLS) preferred over one-way TLS for east-west service mesh communication?',
        options: [
          'mTLS does not require digital certificates',
          'mTLS cryptographically authenticates both client and server before establishing the encrypted channel',
          'mTLS reduces CPU overhead by 50%',
          'mTLS bypasses TCP handshakes',
        ],
        correctAnswer: 1,
        marks: 20,
        explanation:
          'mTLS ensures the server validates the client certificate and the client validates the server certificate, preventing man-in-the-middle attacks.',
      },
    ],
  },
]

function ensureScratchDir() {
  const dir = path.dirname(QUIZZES_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function getAllQuizzes(): QuizRecord[] {
  try {
    if (fs.existsSync(QUIZZES_FILE)) {
      const data = fs.readFileSync(QUIZZES_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {}

  ensureScratchDir()
  fs.writeFileSync(QUIZZES_FILE, JSON.stringify(DEFAULT_QUIZZES, null, 2), 'utf-8')
  return DEFAULT_QUIZZES
}

export function getQuizBySlug(slug: string): QuizRecord | null {
  const quizzes = getAllQuizzes()
  return quizzes.find((q) => q.slug.toLowerCase() === slug.toLowerCase()) || null
}

export function saveQuiz(quizData: Partial<QuizRecord> & { title: string }): QuizRecord {
  const quizzes = getAllQuizzes()
  const slug =
    quizData.slug ||
    quizData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

  const existingIndex = quizzes.findIndex(
    (q) => q.id === quizData.id || q.slug.toLowerCase() === slug.toLowerCase()
  )

  const updatedQuiz: QuizRecord = {
    id: quizData.id || `quiz_${Date.now()}`,
    title: quizData.title,
    slug,
    domain: quizData.domain || 'Security Architecture',
    difficulty: quizData.difficulty || 'Intermediate',
    durationMinutes: Number(quizData.durationMinutes) || 20,
    passingScore: Number(quizData.passingScore) || 80,
    attemptLimit: Number(quizData.attemptLimit) || 3,
    published: quizData.published !== undefined ? Boolean(quizData.published) : true,
    courseSlug: quizData.courseSlug,
    questions: Array.isArray(quizData.questions) ? quizData.questions : [],
    createdAt:
      existingIndex >= 0
        ? quizzes[existingIndex].createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    quizzes[existingIndex] = updatedQuiz
  } else {
    quizzes.push(updatedQuiz)
  }

  ensureScratchDir()
  fs.writeFileSync(QUIZZES_FILE, JSON.stringify(quizzes, null, 2), 'utf-8')
  return updatedQuiz
}

export function deleteQuiz(id: string): boolean {
  const quizzes = getAllQuizzes()
  const filtered = quizzes.filter((q) => q.id !== id && q.slug !== id)
  if (filtered.length !== quizzes.length) {
    ensureScratchDir()
    fs.writeFileSync(QUIZZES_FILE, JSON.stringify(filtered, null, 2), 'utf-8')
    return true
  }
  return false
}

export function toggleQuizPublished(id: string): QuizRecord | null {
  const quizzes = getAllQuizzes()
  const quiz = quizzes.find((q) => q.id === id || q.slug === id)
  if (!quiz) return null

  quiz.published = !quiz.published
  quiz.updatedAt = new Date().toISOString()
  ensureScratchDir()
  fs.writeFileSync(QUIZZES_FILE, JSON.stringify(quizzes, null, 2), 'utf-8')
  return quiz
}
