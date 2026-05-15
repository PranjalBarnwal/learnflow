import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCourseById } from '@/actions/course.actions';
import { CourseForm } from '@/components/course/CourseForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'EDUCATOR') {
    redirect('/login');
  }

  const { courseId } = await params;
  const result = await getCourseById(courseId);

  if (result.error || !result.course) {
    redirect('/educator/courses');
  }

  const course = result.course;

  // Check ownership
  if (course.educator.id !== session.user.id) {
    redirect('/educator/courses');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href={`/educator/courses/${courseId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
      </Link>

      {/* Form */}
      <CourseForm
        mode="edit"
        initialData={{
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnailUrl: course.thumbnailUrl || '',
          category: course.category,
          difficulty: course.difficulty,
          published: course.published,
        }}
      />
    </div>
  );
}
