import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCourseById } from '@/actions/course.actions';
import { LessonForm } from '@/components/course/LessonForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface NewLessonPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function NewLessonPage({ params }: NewLessonPageProps) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href={`/educator/courses/${courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>
        <div className="text-sm text-gray-600">
          Course: <span className="font-medium">{course.title}</span>
        </div>
      </div>

      {/* Form */}
      <LessonForm courseId={courseId} mode="create" />
    </div>
  );
}
