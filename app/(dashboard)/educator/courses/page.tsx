import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCoursesByEducator } from '@/actions/course.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { CourseCard } from '@/components/course/CourseCard';

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'EDUCATOR') {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const currentPage = parseInt(resolvedParams.page || '1', 10);
  const result = await getCoursesByEducator(session.user.id, currentPage, 12);

  if (result.error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Courses</h1>
        </div>
        <div className="text-red-600">Error: {result.error}</div>
      </div>
    );
  }

  const courses = result.courses || [];
  const pagination = result.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-gray-600 mt-2">
            Manage and organize your courses
            {pagination && pagination.total > 0 && (
              <span className="ml-2">({pagination.total} total)</span>
            )}
          </p>
        </div>
        <Link href="/educator/courses/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first course
            </p>
            <Link href="/educator/courses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Link
                href={`/educator/courses?page=${currentPage - 1}`}
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
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Link
                href={`/educator/courses?page=${currentPage + 1}`}
                className={!pagination.hasMore ? 'pointer-events-none opacity-50' : ''}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasMore}
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
