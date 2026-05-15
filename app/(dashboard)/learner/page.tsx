import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const runtime = 'nodejs';

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

async function getEnrolledCourses(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            educator: {
              select: { name: true },
            },
            lessons: {
              select: { id: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
      skip,
      take: limit,
    }),
    db.enrollment.count({ where: { userId } }),
  ]);

  const allLessonIds = enrollments.flatMap((e) =>
    e.course.lessons.map((l) => l.id)
  );

  const allProgress = await db.progress.findMany({
    where: {
      userId,
      lessonId: { in: allLessonIds },
    },
    select: { lessonId: true },
  });

  const completedSet = new Set(allProgress.map((p) => p.lessonId));

  const coursesWithProgress = enrollments.map((enrollment) => {
    const lessons = enrollment.course.lessons;
    const completed = lessons.filter((l) => completedSet.has(l.id)).length;
    const nextLesson = lessons.find((l) => !completedSet.has(l.id));

    return {
      ...enrollment,
      progress: {
        total: lessons.length,
        completed,
        percentage: lessons.length > 0 ? (completed / lessons.length) * 100 : 0,
      },
      nextLessonId: nextLesson?.id,
    };
  });

  return {
    courses: coursesWithProgress,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + enrollments.length < total,
    },
  };
}

export default async function LearnerDashboard({ searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'LEARNER') {
    redirect('/educator');
  }

  const resolvedParams = await searchParams;
  const currentPage = parseInt(resolvedParams.page || '1', 10);
  const result = await getEnrolledCourses(session.user.id, currentPage, 10);

  const totalEnrollments = result.pagination.total;
  
  const allEnrollmentsForStats = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  const allLessonIdsForStats = allEnrollmentsForStats.flatMap((e) =>
    e.course.lessons.map((l) => l.id)
  );

  const allProgressForStats = await db.progress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessonIdsForStats },
    },
  });

  const totalLessons = allEnrollmentsForStats.reduce(
    (sum, e) => sum + e.course.lessons.length,
    0
  );
  const completedLessons = allProgressForStats.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Learning</h1>
        <p className="text-gray-600">Track your progress and continue learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{totalEnrollments}</div>
          <div className="text-gray-600">Enrolled Courses</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">{completedLessons}</div>
          <div className="text-gray-600">Lessons Completed</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold mb-2">
            {totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0}
            %
          </div>
          <div className="text-gray-600">Overall Progress</div>
        </Card>
      </div>

      {result.courses.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">
            You haven't enrolled in any courses yet
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {result.courses.map((enrollment) => (
              <Card key={enrollment.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      By {enrollment.course.educator.name}
                    </p>
                  </div>
                  {enrollment.nextLessonId ? (
                    <Link
                      href={`/learner/courses/${enrollment.course.id}/lessons/${enrollment.nextLessonId}`}
                    >
                      <Button>Continue Learning</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" disabled>
                      Course Complete
                    </Button>
                  )}
                </div>

                <ProgressBar
                  current={enrollment.progress.completed}
                  total={enrollment.progress.total}
                />

                <p className="text-sm text-gray-600 mt-2">
                  {enrollment.progress.completed} of {enrollment.progress.total}{' '}
                  lessons completed
                </p>
              </Card>
            ))}
          </div>

          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Link
                href={`/learner?page=${currentPage - 1}`}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              </Link>

              <span className="text-sm text-gray-600">
                Page {result.pagination.page} of {result.pagination.totalPages}
              </span>

              <Link
                href={`/learner?page=${currentPage + 1}`}
                className={!result.pagination.hasMore ? 'pointer-events-none opacity-50' : ''}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!result.pagination.hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
