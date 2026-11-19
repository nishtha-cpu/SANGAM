import { Metadata } from 'next'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { ContactView } from '@frontend/components/ContactView'

export const metadata: Metadata = {
  title: 'Contact Us | SANGAM Security Architecture',
  description:
    'Contact the SANGAM engineering team for curriculum questions, enterprise licenses, or technical support.',
}

export default function ContactPage() {
  return (
    <PageFrame wide>
      <ContactView />
    </PageFrame>
  )
}
