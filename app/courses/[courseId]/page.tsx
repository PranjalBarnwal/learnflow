import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { EnrollButton } from '@/components/course/EnrollButton';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import PublicNavbar from '@/components/layout/PublicNavbar';

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

async function getCourse(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId, published: true },
    include: {
      educator: {
        select: {
          name: true,
        },
      },
      lessons: {
        select: {
          id: true,
          title: true,
          orderIndex: true,
        },
        orderBy: { orderIndex: 'asc' },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  return course;
}

export async function generateMetadata({ params }: PageProps) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    return { title: 'Course Not Found' };
  }

  return {
    title: `${course.title} | LearnFlow`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  const session = await auth();

  if (!course) {
    notFound();
  }

  // Check enrollment status
  let isEnrolled = false;
  if (session?.user?.id) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar 
        showBack 
        backHref="/courses" 
        backLabel="All Courses" 
        user={session?.user}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            {course.thumbnailUrl && (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <div className="flex items-center gap-2 mb-4">
              <Badge>{course.category}</Badge>
              <Badge variant="outline">{course.difficulty}</Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

            <p className="text-gray-600 mb-4">
              By {course.educator.name} • {course._count.enrollments} students enrolled
            </p>

            <p className="text-lg mb-6">{course.description}</p>

            <EnrollButton
              courseId={courseId}
              isEnrolled={isEnrolled}
              isAuthenticated={!!session}
            />
          </div>

          {/* Lessons List */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            {course.lessons.length === 0 ? (
              <p className="text-gray-500">No lessons available yet</p>
            ) : (
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 rounded hover:bg-gray-50"
                  >
                    <span className="text-gray-500 font-medium">
                      {index + 1}.
                    </span>
                    <span>{lesson.title}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
