import type { CollectionConfig } from 'payload'
import { isAdmin, isLearnerOrAdmin, isLearnerOwnerOrAdmin } from './access'

const PACKAGE_PRICES: Record<string, number> = {
  foundation: 49,
  professional: 129,
  enterprise: 499,
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'transactionReference',
    defaultColumns: ['transactionReference', 'learner', 'package', 'amount', 'paymentStatus', 'createdAt'],
  },
  access: {
    create: isLearnerOrAdmin,
    read: isLearnerOwnerOrAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        // Enforce learner ownership and secure invariants server-side on creation
        if (operation === 'create' && req.user?.collection === 'users') {
          data.learner = req.user.id
          data.paymentStatus = 'pending'
          data.subscriptionStatus = 'pending'

          // Enforce server-side pricing and currency invariants
          if (data.package && typeof data.package === 'string' && PACKAGE_PRICES[data.package]) {
            data.amount = PACKAGE_PRICES[data.package]
          }
          data.currency = 'USD'

          // Generate server-controlled transaction reference if missing or blank
          if (!data.transactionReference || typeof data.transactionReference !== 'string') {
            data.transactionReference = `SGM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
          }

          if (!data.invoiceNumber || typeof data.invoiceNumber !== 'string') {
            data.invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
          }
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
      admin: {
        description: 'Learner associated with this purchase',
      },
      access: {
        // Learners cannot transfer an order to another account
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'package',
      type: 'select',
      required: true,
      options: [
        { label: 'Foundation ($49 / 3 mos)', value: 'foundation' },
        { label: 'Professional ($129 / 12 mos)', value: 'professional' },
        { label: 'Enterprise (Custom)', value: 'enterprise' },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Transaction amount (e.g. 129.00)',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      maxLength: 3,
    },
    {
      name: 'transactionReference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique receipt or payment reference code (e.g. SGM-TX-2026-001)',
      },
    },
    {
      name: 'invoiceNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Tax / Accounting Invoice Number (e.g. INV-2026-102948)',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
      access: {
        // Learners cannot grant themselves 'paid' status
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
      access: {
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'razorpayOrderId',
      type: 'text',
      access: {
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'razorpayPaymentId',
      type: 'text',
      access: {
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'razorpaySignature',
      type: 'text',
      access: {
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      access: {
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      access: {
        create: ({ req }) => req.user?.collection === 'admins',
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
  ],
  timestamps: true,
}
