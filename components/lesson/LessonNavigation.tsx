import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  orderIndex: number;
}

interface LessonNavigationProps {
  courseId: string;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export function LessonNavigation({
  courseId,
  previousLesson,
  nextLesson,
}: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t pt-6">
      <div>
        {previousLesson ? (
          <Link href={`/learner/courses/${courseId}/lessons/${previousLesson.id}`}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous: {previousLesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div>
        {nextLesson ? (
          <Link href={`/learner/courses/${courseId}/lessons/${nextLesson.id}`}>
            <Button className="gap-2">
              Next: {nextLesson.title}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href={`/learner`}>
            <Button className="gap-2">
              Back to Dashboard
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
