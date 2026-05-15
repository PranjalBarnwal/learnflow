'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { markLessonComplete } from '@/actions/progress.actions';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface MarkCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export function MarkCompleteButton({
  lessonId,
  isCompleted,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleMarkComplete() {
    setIsLoading(true);
    const result = await markLessonComplete(lessonId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Lesson marked as complete!');
      router.refresh();
    }
  }

  if (isCompleted) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Check className="h-4 w-4" />
        Completed
      </Button>
    );
  }

  return (
    <Button onClick={handleMarkComplete} disabled={isLoading} className="gap-2">
      {isLoading ? 'Marking...' : 'Mark as Complete'}
    </Button>
  );
}
