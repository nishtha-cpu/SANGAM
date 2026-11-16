import type { CollectionConfig } from 'payload'
import { isAdmin, isPublishedOrAdmin } from './access'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'domain', 'difficulty', 'published', 'updatedAt'],
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
      admin: {
        description: 'URL-friendly identifier (e.g. secure-customer-portal)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'domain',
      type: 'select',
      defaultValue: 'Solution Architecture',
      options: [
        { label: 'Solution Architecture', value: 'Solution Architecture' },
        { label: 'Security Architecture', value: 'Security Architecture' },
        { label: 'Cloud Architecture', value: 'Cloud Architecture' },
      ],
    },
    {
      name: 'difficulty',
      type: 'select',
      defaultValue: 'Intermediate',
      options: [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Intermediate', value: 'Intermediate' },
        { label: 'Advanced', value: 'Advanced' },
      ],
    },
    {
      name: 'businessRequirements',
      type: 'array',
      labels: {
        singular: 'Business Requirement',
        plural: 'Business Requirements',
      },
      fields: [
        {
          name: 'requirement',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'securityRequirements',
      type: 'array',
      labels: {
        singular: 'Security Requirement',
        plural: 'Security Requirements',
      },
      fields: [
        {
          name: 'requirement',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'problemStatements',
      type: 'array',
      labels: {
        singular: 'Problem Statement',
        plural: 'Problem Statements',
      },
      fields: [
        {
          name: 'statement',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'expectedArchitecture',
      type: 'array',
      labels: {
        singular: 'Expected Component',
        plural: 'Expected Components',
      },
      fields: [
        {
          name: 'component',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'starterDiagram',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional starter diagram asset for learners to review or build upon',
      },
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

