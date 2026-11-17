import fs from 'fs'
import path from 'path'

export interface BankQuestion {
  id: string
  domain: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  questionType: 'single_choice' | 'multiple_choice' | 'true_false'
  question: string
  options: string[]
  correctAnswer: number // or bitmask / array
  explanation: string
  points: number
  tags: string[]
  createdAt?: string
}

const QUESTION_BANK_FILE = path.resolve(process.cwd(), 'scratch/dev-question-bank.json')

export const DEFAULT_QUESTION_POOL: BankQuestion[] = [
  {
    id: 'qb_01',
    domain: 'Zero Trust & Identity',
    difficulty: 'Intermediate',
    questionType: 'single_choice',
    question: 'In a Zero Trust Architecture (NIST SP 800-207), which component is responsible for making the ultimate decision to grant access to a resource?',
    options: [
      'Policy Enforcement Point (PEP)',
      'Policy Decision Point (PDP)',
      'Continuous Diagnostics and Mitigation (CDM) system',
      'Data Access Gateway'
    ],
    correctAnswer: 1,
    explanation: 'The Policy Decision Point (PDP) evaluates enterprise policy and trust algorithms to decide whether access is granted, while the PEP enforces the decision.',
    points: 10,
    tags: ['zero-trust', 'nist-800-207', 'pdp-pep']
  },
  {
    id: 'qb_02',
    domain: 'Cloud Architecture & Isolation',
    difficulty: 'Advanced',
    questionType: 'single_choice',
    question: 'When designing a multi-tenant SaaS architecture on AWS, which design pattern guarantees the highest boundary isolation between tenant computing workloads?',
    options: [
      'Shared VPC with tenant-specific security groups',
      'Container namespaces within a shared EKS node pool',
      'Dedicated AWS Accounts per tenant managed via AWS Organizations',
      'Shared IAM role with dynamic session policies'
    ],
    correctAnswer: 2,
    explanation: 'Separate AWS accounts per tenant provide hard cryptographic and administrative isolation boundaries, preventing cross-tenant blast radius and credential leakage.',
    points: 15,
    tags: ['aws', 'multi-tenant', 'isolation-patterns']
  },
  {
    id: 'qb_03',
    domain: 'Cryptography & Data Protection',
    difficulty: 'Intermediate',
    questionType: 'single_choice',
    question: 'Which cryptographic pattern ensures that high-volume database columns are encrypted without sending plaintext data across the network to a central KMS for every query?',
    options: [
      'Envelope Encryption (DEK encrypted by KEK)',
      'Deterministic ECB block encryption',
      'Single static master key loaded in server RAM',
      'Hash-based message authentication (HMAC-SHA256)'
    ],
    correctAnswer: 0,
    explanation: 'Envelope encryption uses a central KMS KEK to protect a local Data Encryption Key (DEK). The application uses the DEK locally for bulk encryption without KMS throughput bottlenecks.',
    points: 10,
    tags: ['cryptography', 'kms', 'envelope-encryption']
  },
  {
    id: 'qb_04',
    domain: 'Threat Modeling & STRIDE',
    difficulty: 'Beginner',
    questionType: 'single_choice',
    question: 'In the STRIDE threat modeling methodology, what primary security property mitigates the threat of Repudiation?',
    options: [
      'Encryption in transit (Confidentiality)',
      'Cryptographic digital signatures and immutable audit logging (Non-repudiation)',
      'Input sanitization and query parameterization (Tampering)',
      'High-availability load balancers (Denial of Service)'
    ],
    correctAnswer: 1,
    explanation: 'Repudiation threats are mitigated through non-repudiation controls such as digital signatures, secure timestamps, and tamper-resistant audit logs.',
    points: 10,
    tags: ['stride', 'threat-modeling', 'non-repudiation']
  },
  {
    id: 'qb_05',
    domain: 'API Security & Authentication',
    difficulty: 'Intermediate',
    questionType: 'single_choice',
    question: 'Why should public Single Page Applications (SPAs) implement OAuth 2.0 Authorization Code Flow with PKCE instead of the legacy Implicit Grant?',
    options: [
      'PKCE eliminates the need for an authorization server',
      'PKCE prevents authorization code interception attacks without requiring a client secret',
      'Implicit grant requires server-side session cookies that SPAs cannot store',
      'PKCE signs JWT tokens with symmetric HMAC keys on the browser'
    ],
    correctAnswer: 1,
    explanation: 'PKCE creates a dynamic code verifier and code challenge, preventing attackers from intercepting and exchanging the authorization code on public clients that cannot store static secrets.',
    points: 10,
    tags: ['oauth2', 'pkce', 'api-security']
  }
]

export function getQuestionBankPool(): BankQuestion[] {
  try {
    if (fs.existsSync(QUESTION_BANK_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUESTION_BANK_FILE, 'utf8'))
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  return DEFAULT_QUESTION_POOL
}

export function saveQuestionToBank(question: Omit<BankQuestion, 'id'> & { id?: string }): BankQuestion {
  const pool = getQuestionBankPool()
  const newQuestion: BankQuestion = {
    ...question,
    id: question.id || `qb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  }

  const existingIdx = pool.findIndex(q => q.id === newQuestion.id)
  if (existingIdx >= 0) {
    pool[existingIdx] = newQuestion
  } else {
    pool.push(newQuestion)
  }

  try {
    const dir = path.dirname(QUESTION_BANK_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(QUESTION_BANK_FILE, JSON.stringify(pool, null, 2), 'utf8')
  } catch (err) {
    console.error('[question-bank] Failed to save question pool:', err)
  }

  return newQuestion
}
