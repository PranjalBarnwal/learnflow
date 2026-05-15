import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, Eye, Edit } from 'lucide-react';
import { getCoursesByEducator } from '@/actions/course.actions';

export default async function EducatorDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check if user is an educator
  if (session.user.role !== 'EDUCATOR') {
    redirect('/learner');
  }

  const result = await getCoursesByEducator(session.user.id, 1, 5);
  const recentCourses = result.success ? result.courses : [];
  const pagination = result.pagination;

  const totalCourses = pagination?.total || 0;
  const totalStudents = result.totalEnrollments ?? recentCourses.reduce((sum, course) => sum + course._count.enrollments, 0);
  const publishedCourses = result.publishedCount ?? recentCourses.filter(c => c.published).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, {session.user.name}!
        </h1>
        <p className="font-sans text-gray-600 mt-2">
          Here's what's happening with your courses today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCourses} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {result.totalLessons ?? recentCourses.reduce((sum, course) => sum + course._count.lessons, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Content created
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
          <CardDescription>
            Your recently created or updated courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="font-heading text-lg font-semibold">No courses yet</p>
              <p className="font-sans text-sm mt-2 mb-4">
                Create your first course to get started!
              </p>
              <Link href="/educator/courses/new">
                <Button>Create Course</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCourses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      {course.published ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-sm text-gray-600 mt-1 line-clamp-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{course._count.lessons} lessons</span>
                      <span>{course._count.enrollments} students</span>
                      <span className="capitalize">{course.difficulty.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/educator/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/educator/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {recentCourses.length > 5 && (
                <div className="text-center pt-4">
                  <Link href="/educator/courses">
                    <Button variant="outline">View All Courses</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
