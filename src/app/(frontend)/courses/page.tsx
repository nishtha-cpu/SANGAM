import { Metadata } from 'next'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { CoursesView } from '@frontend/components/CoursesView'
import { getPublicCoursesAction } from '@/backend/actions/course-actions'

export const metadata: Metadata = {
  title: 'Courses Catalog | SANGAM Security Architecture',
  description:
    'Explore hands-on security architecture courses with free trial lessons, threat modeling masterclasses, and zero-trust engineering labs.',
}

export default async function CoursesPage() {
  const courses = await getPublicCoursesAction()

  return (
    <PageFrame
      title="Architecture Curriculum & Masterclasses"
      eyebrow="Hands-on Security Engineering"
      wide
    >
      <CoursesView initialCourses={courses} />
    </PageFrame>
  )
}
