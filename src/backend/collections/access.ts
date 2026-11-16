import type { Access } from 'payload'

/**
 * Access rule: Admins only (authenticated via the 'admins' collection).
 */
export const isAdmin: Access = ({ req }) => {
  return req.user?.collection === 'admins'
}

/**
 * Access rule: Public and learners can read published content; admins can read all.
 */
export const isPublishedOrAdmin: Access = ({ req }) => {
  if (req.user?.collection === 'admins') return true
  return {
    published: {
      equals: true,
    },
  }
}

/**
 * Access rule: Authenticated learners can access only their own records;
 * admins can access all records.
 */
export const isLearnerOwnerOrAdmin: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.collection === 'admins') return true
  if (req.user.collection === 'users') {
    return {
      learner: {
        equals: req.user.id,
      },
    }
  }
  return false
}

/**
 * Access rule: Authenticated learner can create.
 */
export const isLearnerOrAdmin: Access = ({ req }) => {
  if (!req.user) return false
  return req.user.collection === 'users' || req.user.collection === 'admins'
}
