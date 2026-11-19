import { Metadata } from 'next'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { AboutView } from '@frontend/components/AboutView'

export const metadata: Metadata = {
  title: 'About Us | SANGAM Security Architecture',
  description:
    'Discover the mission, philosophy, and faculty behind SANGAM — the Security Architecture Next Generation Assessment Model.',
}

export default function AboutPage() {
  return (
    <PageFrame wide>
      <AboutView />
    </PageFrame>
  )
}
