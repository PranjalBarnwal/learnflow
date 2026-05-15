'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { deleteCourse, toggleCoursePublish } from '@/actions/course.actions';
import { toast } from 'sonner';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string | null;
    category: string;
    difficulty: string;
    published: boolean;
    _count: {
      lessons: number;
      enrollments: number;
    };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    const result = await deleteCourse(course.id);

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      });
      setIsDeleting(false);
      return;
    }

    toast.success('Success', {
      description: 'Course deleted successfully',
    });

    router.refresh();
  }

  async function handleTogglePublish() {
    setIsToggling(true);

    const result = await toggleCoursePublish(course.id);

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      });
      setIsToggling(false);
      return;
    }

    toast.success('Success', {
      description: `Course ${course.published ? 'unpublished' : 'published'} successfully`,
    });

    router.refresh();
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-1">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {course.description}
            </CardDescription>
          </div>
          <span
            className={`shrink-0 px-2 py-1 text-xs rounded-full ${
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
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4 font-sans">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course._count.lessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course._count.enrollments} students</span>
          </div>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
            {course.difficulty}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Link href={`/educator/courses/${course.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
            <Link href={`/educator/courses/${course.id}/edit`} className="flex-1">
              <Button className="w-full" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isToggling}
              className="flex-1"
            >
              {course.published ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
