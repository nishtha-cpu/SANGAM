import type { Access, CollectionConfig } from 'payload'
import { isAdmin, isLearnerOrAdmin, isLearnerOwnerOrAdmin } from './access'

const canUpdateReview: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.collection === 'admins') return true
  if (req.user.collection === 'users') {
    return {
      learner: { equals: req.user.id },
      status: { equals: 'submitted' },
    }
  }
  return false
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'learner', 'score', 'status', 'createdAt'],
  },
  access: {
    create: isLearnerOrAdmin,
    read: isLearnerOwnerOrAdmin,
    update: canUpdateReview,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        // Enforce learner ownership server-side on creation
        if (operation === 'create' && req.user?.collection === 'users') {
          data.learner = req.user.id
          data.status = 'submitted'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Architecture Design Review',
    },
    {
      name: 'learner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'Learner who submitted the design',
      },
      access: {
        // Learners cannot reassign ownership to another user
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'caseStudy',
      type: 'relationship',
      relationTo: 'case-studies',
      admin: {
        description: 'Optional associated case study',
      },
    },
    {
      name: 'diagramData',
      type: 'json',
      admin: {
        description: 'Serialized canvas nodes, edges and geometry data',
      },
    },
    {
      name: 'selectedPatterns',
      type: 'relationship',
      relationTo: 'security-patterns',
      hasMany: true,
      admin: {
        description: 'Security patterns targeted by this architecture',
      },
    },
    {
      name: 'aiFeedback',
      type: 'textarea',
      admin: {
        description: 'Generated AI findings, strengths, and recommendations',
      },
    },
    {
      name: 'score',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Architecture score (0 - 100)',
      },
      access: {
        // Only admins can alter final scores
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'instructorComments',
      type: 'textarea',
      admin: {
        description: 'Manual feedback or grading notes from an instructor/admin',
      },
      access: {
        // Only admins can add or edit instructor comments
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'submitted',
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'In Review', value: 'in-review' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Flagged', value: 'flagged' },
      ],
      admin: {
        position: 'sidebar',
      },
      access: {
        // Only admins can change status from submitted
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'auditHistory',
      type: 'array',
      admin: {
        description: 'Log of actions, AI evaluations, or instructor reviews',
      },
      access: {
        // Learners cannot forge audit history records
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'action',
          type: 'text',
          required: true,
        },
        {
          name: 'actor',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
}
