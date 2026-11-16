import type { Access, CollectionConfig } from 'payload'

/**
 * AU-8: Only a currently authenticated admin can perform admin operations.
 * This prevents learner tokens from being accepted on admin API calls.
 */
const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Admins: CollectionConfig = {
  slug: 'admins',
  /**
   * AU-8: Admins collection is the Payload Admin user (configured in
   * payload.config.ts as admin.user).  It uses Figma SSO via @payloadcms/figma.
   *
   * Separation of concerns:
   * - Admins: CMS/platform editors — /admin panel only.
   * - Users:  Learner app accounts — /dashboard and app pages only.
   *
   * A learner JWT (collection:'users') is NEVER accepted by this collection's
   * access rules.  An admin JWT (collection:'admins') is NEVER accepted by
   * getCurrentUser() in lib/app-auth.ts.  The two auth domains are isolated.
   */
  access: {
    // Admins can NEVER be created by external callers (platform-managed).
    create: () => false,
    delete: isPayloadAdmin,
    read: isPayloadAdmin,
    update: isPayloadAdmin,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
  versions: false,
}
