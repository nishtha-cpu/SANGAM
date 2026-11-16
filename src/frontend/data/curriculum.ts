import type { FeatureLink, ClassItem, CaseItem, QuizQuestionItem, TierItem } from '@frontend/types'

export const featureLinks: FeatureLink[] = [
  {
    title: 'Quizzes',
    description: 'Test your knowledge across security and enterprise architecture domains.',
    href: '/quiz',
    icon: 'book',
  },
  {
    title: 'Case Studies',
    description: 'Design or review architectures against real-world scenarios.',
    href: '/case-studies',
    icon: 'layers',
  },
  {
    title: 'Design Review',
    description: 'Sketch a design and get it AI-reviewed against selected security patterns.',
    href: '/design-review',
    icon: 'spark',
  },
  {
    title: 'Pattern Library',
    description: 'Browse the security patterns enabled for the organization.',
    href: '/patterns',
    icon: 'shield',
  },
  {
    title: 'Recorded Classes',
    description: 'Access recorded lectures, lessons and instructor-led training sessions.',
    href: '/recorded-classes',
    icon: 'video',
  },
]

export const securityPatterns = [
  ['Authentication', ['Multi-Factor Authentication', 'SSO via OIDC', 'SSO via SAML 2.0']],
  ['Data Protection', ['Data Classification & Tokenization']],
  [
    'Encryption',
    ['AES-128', 'AES-256', 'ChaCha20-Poly1305', 'Post-Quantum Cryptography (PQC)', 'RSA'],
  ],
  ['Identity Governance', ['Least Privilege / RBAC']],
  ['Logging & Monitoring', ['Anomaly Detection / Alerting', 'SIEM Log Ingestion']],
  ['Network Segmentation', ['DMZ / Tiered Network', 'Zero Trust Network Access']],
  ['Resilience', ['Multi-AZ / Disaster Recovery']],
] as const

export const curriculumClasses: ClassItem[] = [
  {
    title: 'Zero Trust Architecture in Practice',
    instructor: 'Dr. Maya Chen',
    duration: '52 min',
    date: '12 Jun 2026',
    watched: false,
    image:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=82',
    description:
      'Turn Zero Trust principles into practical identity, network and workload controls.',
  },
  {
    title: 'Threat Modeling Modern Applications',
    instructor: 'Ethan Cole',
    duration: '1h 18 min',
    date: '06 Jun 2026',
    watched: true,
    image:
      'https://images.unsplash.com/photo-1643199187247-b3b6009bf0bb?auto=format&fit=crop&w=900&q=82',
    description: 'A hands-on STRIDE workshop for distributed application architecture.',
  },
  {
    title: 'Encryption Architecture Masterclass',
    instructor: 'Nadia Rahman',
    duration: '44 min',
    date: '28 May 2026',
    watched: false,
    image:
      'https://images.unsplash.com/photo-1643199121319-b3b5695e4acb?auto=format&fit=crop&w=900&q=82',
    description: 'Choose encryption, key management and tokenization patterns with confidence.',
  },
  {
    title: 'Designing Secure Cloud Landing Zones',
    instructor: 'Marcus Lee',
    duration: '1h 06 min',
    date: '18 May 2026',
    watched: true,
    image:
      'https://images.unsplash.com/photo-1640163561331-1b68a6474957?auto=format&fit=crop&w=900&q=82',
    description: 'Build secure cloud foundations with policy, logging and segmentation by default.',
  },
]

export const curriculumCases: CaseItem[] = [
  {
    title: 'Design a Secure Customer Portal',
    category: 'Solution Architecture',
    difficulty: 'Intermediate',
    mode: 'Design from scratch',
    href: '/case-studies/secure-customer-portal',
    description:
      'Protect customer identity, orders and payment methods for a high-volume retail platform.',
  },
  {
    title: 'Securing a Multi-Tenant SaaS Billing System',
    category: 'Security Architecture',
    difficulty: 'Intermediate',
    mode: 'Review existing design',
    href: '/case-studies/saas-billing',
    description: 'Assess tenant isolation, billing data protection and privileged service access.',
  },
  {
    title: 'Resilient Healthcare Data Exchange',
    category: 'Cloud Architecture',
    difficulty: 'Advanced',
    mode: 'Design from scratch',
    href: '/case-studies/secure-customer-portal',
    description: 'Design a resilient, auditable exchange for sensitive clinical records.',
  },
]

export const quizQuestions: QuizQuestionItem[] = [
  {
    q: 'Which principle states that a user should only have the minimum access needed to perform their job?',
    options: ['Defense in depth', 'Least privilege', 'Fail-safe defaults', 'Separation of duties'],
    correct: 1,
  },
  {
    q: 'In OIDC, which token is primarily used to prove the identity of the end user to the client application?',
    options: ['Access token', 'Refresh token', 'ID token', 'Client secret'],
    correct: 2,
  },
  {
    q: 'Which AES mode provides both confidentiality and integrity?',
    options: ['ECB', 'CBC', 'CTR', 'GCM'],
    correct: 3,
  },
]

export const pricingTiers: TierItem[] = [
  {
    name: 'Foundation',
    price: '$49',
    description: 'Build essential security architecture skills.',
    features: ['12 quizzes', '6 case studies', 'Core recordings', '1 design review / month'],
    validity: '3 months',
  },
  {
    name: 'Professional',
    price: '$129',
    description: 'A complete hands-on assessment pathway.',
    features: [
      'Unlimited quizzes',
      'All case studies',
      'All recorded classes',
      '10 design reviews / month',
    ],
    validity: '12 months',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Team enablement and organization patterns.',
    features: [
      'Team analytics',
      'Private case studies',
      'Custom pattern library',
      'Unlimited reviews',
    ],
    validity: 'Annual',
  },
]
