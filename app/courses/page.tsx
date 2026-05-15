import { Suspense } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CourseGrid } from '@/components/course/CourseGrid';
import { CourseFilters } from '@/components/course/CourseFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { auth } from '@/lib/auth';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    search?: string;
    page?: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: 'Browse Courses | LearnFlow',
    description: 'Discover and enroll in courses to advance your skills',
  };
}

async function getCourses(
  filters: {
    category?: string;
    difficulty?: string;
    search?: string;
  },
  page: number = 1,
  limit: number = 12
) {
  const where: any = { published: true };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      include: {
        educator: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.course.count({ where }),
  ]);

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + courses.length < total,
    },
  };
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const result = await getCourses(resolvedSearchParams, currentPage, 12);
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar 
        showBack 
        backHref="/" 
        backLabel="Home" 
        user={session?.user}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Courses</h1>
          <p className="text-gray-600">
            Discover courses and start learning today
            {result.pagination.total > 0 && (
              <span className="ml-2">({result.pagination.total} courses available)</span>
            )}
          </p>
        </div>

        <Suspense fallback={<div className="mb-8 h-10" />}>
          <CourseFilters />
        </Suspense>

        {result.courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found</p>
          </div>
        ) : (
          <>
            <CourseGrid courses={result.courses} />
            
            {result.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  href={buildPaginationUrl(resolvedSearchParams, currentPage - 1)}
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
                  href={buildPaginationUrl(resolvedSearchParams, currentPage + 1)}
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
    </div>
  );
}

function buildPaginationUrl(
  params: { category?: string; difficulty?: string; search?: string },
  page: number
): string {
  const searchParams = new URLSearchParams();
  
  if (params.category) searchParams.set('category', params.category);
  if (params.difficulty) searchParams.set('difficulty', params.difficulty);
  if (params.search) searchParams.set('search', params.search);
  searchParams.set('page', page.toString());
  
  return `/courses?${searchParams.toString()}`;
}

function CoursesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-lg" />
      ))}
    </div>
  );
}
