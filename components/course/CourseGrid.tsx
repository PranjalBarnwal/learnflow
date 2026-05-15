import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: string;
  difficulty: string;
  educator: {
    name: string;
  };
  _count: {
    lessons: number;
    enrollments: number;
  };
}

interface CourseGridProps {
  courses: Course[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Link key={course.id} href={`/courses/${course.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="p-0">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge>{course.category}</Badge>
                <Badge variant="outline">{course.difficulty}</Badge>
              </div>
              <h3 className="text-xl font-bold mb-2 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {course.description}
              </p>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-between text-sm text-gray-500">
              <span>By {course.educator.name}</span>
              <span>{course._count.lessons} lessons</span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
