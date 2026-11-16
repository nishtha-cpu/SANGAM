import type { Access, CollectionConfig } from 'payload'

/**
 * AU-5 / AU-8: isSelf ensures a user can only read or modify their own record.
 * This prevents horizontal privilege escalation between learners.
 */
const isSelf: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  /**
   * AU-3: Payload uses bcrypt internally for password hashing.
   * We never store plaintext passwords; tokenExpiration is 8 hours.
   * AU-6: The JWT is placed in an HttpOnly cookie by auth-actions.ts.
   */
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 hours, matches cookie maxAge
  },
  access: {
    /**
     * AU-2: Public create is intentionally allowed for registration.
     * The 'role' field below has create:false and update:false access
     * so users can NEVER self-assign roles.
     */
    create: () => true,
    /**
     * AU-5: Learners can only read their own document.
     */
    read: isSelf,
    /**
     * AU-5: Learners can only update their own document.
     */
    update: isSelf,
    /**
     * AU-8: Only the learner themselves can delete their own account.
     */
    delete: isSelf,
  },
  admin: {
    /**
     * AU-8: Keep the Users collection hidden from the Payload Admin panel.
     * Admins manage the platform through the Admins collection only.
     */
    hidden: true,
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'avatar',
      type: 'text',
    },
    {
      /**
       * AU-2 / AU-8: Role is locked at 'learner'.
       * create:false and update:false prevent privilege escalation —
       * the field cannot be set during registration or changed afterwards
       * by the user. Only a Payload Admin mutation with overrideAccess:true
       * could change this.
       */
      name: 'role',
      type: 'select',
      defaultValue: 'learner',
      options: [{ label: 'Learner', value: 'learner' }],
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      /**
       * AU-2: Persist terms acceptance timestamp for consent audit trail.
       * Set to the registration timestamp when the user creates their account.
       * Not user-editable after creation.
       */
      name: 'termsAcceptedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Timestamp when the user accepted the Terms and Conditions.',
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      /**
       * AU-12: Email verification status.
       */
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      access: {
        create: () => false,
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'emailVerificationToken',
      type: 'text',
      access: {
        read: ({ req }) => req.user?.collection === 'admins',
        create: () => false,
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      /**
       * AU-10: Password reset token and expiry.
       */
      name: 'resetPasswordToken',
      type: 'text',
      access: {
        read: ({ req }) => req.user?.collection === 'admins',
        create: () => false,
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      name: 'resetPasswordExpiry',
      type: 'date',
      access: {
        read: ({ req }) => req.user?.collection === 'admins',
        create: () => false,
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      /**
       * UP-5 / SB-3: Enrolled packages list.
       */
      name: 'enrolledPackages',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Foundation', value: 'foundation' },
        { label: 'Professional', value: 'professional' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      access: {
        create: () => false,
        update: ({ req }) => req.user?.collection === 'admins',
      },
    },
    {
      /**
       * AU-13: Account deletion request timestamp for GDPR/retention.
       */
      name: 'deletionRequestedAt',
      type: 'date',
      access: {
        create: () => false,
        update: ({ req, doc }) => req.user?.id === doc?.id || req.user?.collection === 'admins',
      },
    },
  ],
}
