import type { CollectionConfig } from 'payload'
import { isAdmin, isLearnerOwnerOrAdmin, isLearnerOrAdmin } from './access'

export const QuizAttempts: CollectionConfig = {
  slug: 'quiz-attempts',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['learner', 'quiz', 'score', 'passed', 'status', 'attemptNumber', 'createdAt'],
  },
  access: {
    create: isLearnerOrAdmin,
    read: isLearnerOwnerOrAdmin,
    update: isLearnerOwnerOrAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        // Enforce learner ownership server-side on creation
        if (operation === 'create' && req.user?.collection === 'users') {
          data.learner = req.user.id
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'learner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'in-progress',
      options: [
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'score',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    {
      name: 'passed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'correctCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'incorrectCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'unansweredCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'totalQuestions',
      type: 'number',
      min: 1,
    },
    {
      name: 'attemptNumber',
      type: 'number',
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'answers',
      type: 'json',
      admin: {
        description: 'Learner answer selections recorded for this attempt',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
    },
  ],
  timestamps: true,
}
