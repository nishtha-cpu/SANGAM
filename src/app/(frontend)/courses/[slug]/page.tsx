import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageFrame } from '@frontend/layouts/PageFrame'
import { CourseDetailView } from '@frontend/components/CourseDetailView'
import { getCourseDetailsAction, getPublicCoursesAction } from '@/backend/actions/course-actions'

interface CoursePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const courses = await getPublicCoursesAction()
  return courses.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseDetailsAction(slug)

  if (!course) {
    return {
      title: 'Course Not Found | SANGAM',
    }
  }

  return {
    title: `${course.title} | SANGAM Security Architecture`,
    description: course.description,
  }
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params
  const course = await getCourseDetailsAction(slug)

  if (!course) {
    notFound()
  }

  return (
    <PageFrame wide>
      <CourseDetailView course={course} />
    </PageFrame>
  )
}
