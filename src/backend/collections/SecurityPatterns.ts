import type { CollectionConfig } from 'payload'
import { isAdmin, isPublishedOrAdmin } from './access'

export const SecurityPatterns: CollectionConfig = {
  slug: 'security-patterns',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'published', 'updatedAt'],
  },
  access: {
    create: isAdmin,
    read: isPublishedOrAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Authentication', value: 'Authentication' },
        { label: 'Data Protection', value: 'Data Protection' },
        { label: 'Encryption', value: 'Encryption' },
        { label: 'Identity Governance', value: 'Identity Governance' },
        { label: 'Logging & Monitoring', value: 'Logging & Monitoring' },
        { label: 'Network Segmentation', value: 'Network Segmentation' },
        { label: 'Resilience', value: 'Resilience' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'purpose',
      type: 'textarea',
      admin: {
        description: 'Specific security objective addressed by this pattern',
      },
    },
    {
      name: 'advantages',
      type: 'textarea',
      admin: {
        description: 'Key security and architectural benefits',
      },
    },
    {
      name: 'implementationGuidance',
      type: 'textarea',
      admin: {
        description: 'Practical steps, configurations, or best practices for applying this control',
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

