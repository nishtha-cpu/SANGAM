import type { CollectionConfig } from 'payload'
import { isAdmin, isPublishedOrAdmin } from './access'

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'domain', 'passingScore', 'published', 'updatedAt'],
  },
  access: {
    create: isAdmin,
    read: isPublishedOrAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        placeholder: 'e.g. Security Architecture Fundamentals',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      defaultValue: 'Beginner',
      options: [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Intermediate', value: 'Intermediate' },
        { label: 'Advanced', value: 'Advanced' },
      ],
    },
    {
      name: 'passingScore',
      type: 'number',
      defaultValue: 80,
      min: 0,
      max: 100,
      admin: {
        description: 'Minimum score percentage required to pass (0 - 100)',
      },
    },
    {
      name: 'domainTags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'questions',
      type: 'array',
      required: true,
      labels: {
        singular: 'Question',
        plural: 'Questions',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'options',
          type: 'array',
          required: true,
          minRows: 2,
          maxRows: 6,
          labels: {
            singular: 'Option',
            plural: 'Options',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'correctAnswer',
          type: 'number',
          required: true,
          min: 0,
          /**
           * SECURITY: correctAnswer is strictly protected at field level.
           * It is NEVER sent to public visitors or learners in API responses.
           * Scoring is computed server-side via Server Actions.
           */
          access: {
            read: ({ req }) => req.user?.collection === 'admins',
          },
          admin: {
            description: '0-based index of the correct option (0 = first option, 1 = second, etc.)',
          },
        },
        {
          name: 'explanation',
          type: 'textarea',
          /**
           * SECURITY: explanations reveal the answer and are hidden
           * until after the learner submits the quiz.
           */
          access: {
            read: ({ req }) => req.user?.collection === 'admins',
          },
          admin: {
            description: 'Explanation shown only after quiz completion and evaluation',
          },
        },
      ],
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
