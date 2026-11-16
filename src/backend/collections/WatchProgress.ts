import type { CollectionConfig } from 'payload'
import { isAdmin, isLearnerOwnerOrAdmin, isLearnerOrAdmin } from './access'

export const WatchProgress: CollectionConfig = {
  slug: 'watch-progress',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['learner', 'classItem', 'secondsWatched', 'completed', 'updatedAt'],
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
      name: 'classItem',
      type: 'relationship',
      relationTo: 'classes',
      required: true,
      index: true,
    },
    {
      name: 'secondsWatched',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'lastPositionSeconds',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
