import { Metadata } from 'next'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { FaqView } from '@frontend/components/FaqView'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | SANGAM Security Architecture',
  description:
    'Answers to common questions regarding free trial lectures, architecture curriculum, scenario quizzes, certification, and billing.',
}

export default function FaqPage() {
  return (
    <PageFrame wide>
      <FaqView />
    </PageFrame>
  )
}
