import type { CollectionConfig } from 'payload'
import { isAdmin, isPublishedOrAdmin } from './access'

export const Classes: CollectionConfig = {
  slug: 'classes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'instructor', 'duration', 'status', 'published', 'updatedAt'],
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
        description: 'URL-friendly unique identifier (e.g. zero-trust-architecture)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'instructor',
      type: 'text',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        placeholder: 'e.g. 52 min or 1h 18 min',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'URL to video stream or secure embed player',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'section',
      type: 'text',
      defaultValue: 'Core Curriculum',
      admin: {
        description: 'Course section or module name',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order index within the section',
      },
    },
    {
      name: 'isPremium',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Requires paid package enrollment to view',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'ready',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'When unchecked, hidden from learners',
      },
    },
  ],
  timestamps: true,
}
