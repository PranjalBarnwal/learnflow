import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCourseById } from '@/actions/course.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Plus, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { LessonList } from '@/components/course/LessonList';

interface CourseDetailPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/educator/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
        <Link href={`/educator/courses/${courseId}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
        </Link>
      </div>

      {/* Course Info */}
      <Card>
        <CardHeader>
          {course.thumbnailUrl && (
            <div className="aspect-video bg-gray-200 rounded-md mb-4 overflow-hidden">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{course.title}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {course.description}
              </CardDescription>
            </div>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                course.published
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Category</p>
              <p className="font-medium">{course.category}</p>
            </div>
            <div>
              <p className="text-gray-600">Difficulty</p>
              <p className="font-medium">{course.difficulty}</p>
            </div>
            <div>
              <p className="text-gray-600">Students Enrolled</p>
              <p className="font-medium">{course._count.enrollments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Lessons</CardTitle>
              <CardDescription>
                {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''} in this course
              </CardDescription>
            </div>
            <Link href={`/educator/courses/${courseId}/lessons/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {course.lessons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No lessons yet</p>
              <p className="text-sm mt-2">Add your first lesson to get started</p>
              <Link href={`/educator/courses/${courseId}/lessons/new`}>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Lesson
                </Button>
              </Link>
            </div>
          ) : (
            <LessonList courseId={courseId} initialLessons={course.lessons} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
