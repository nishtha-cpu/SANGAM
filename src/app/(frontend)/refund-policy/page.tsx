import { Metadata } from 'next'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { RefundPolicyView } from '@frontend/components/RefundPolicyView'

export const metadata: Metadata = {
  title: 'Refund Policy | SANGAM Security Architecture',
  description:
    'Our 7-Day 100% Money-Back Guarantee, eligibility conditions, and refund request procedure.',
}

export default function RefundPolicyPage() {
  return (
    <PageFrame title="Refund Policy & Guarantee" eyebrow="Customer Assurance & Fair Use">
      <RefundPolicyView />
    </PageFrame>
  )
}
