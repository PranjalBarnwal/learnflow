'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { enrollInCourse } from '@/actions/enrollment.actions';
import { toast } from 'sonner';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
}

export function EnrollButton({
  courseId,
  isEnrolled,
  isAuthenticated,
}: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleEnroll() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    const result = await enrollInCourse(courseId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Successfully enrolled in course!');
      router.refresh();
    }
  }

  function handleGoToCourse() {
    router.push(`/learner`);
  }

  if (isEnrolled) {
    return (
      <Button size="lg" onClick={handleGoToCourse}>
        Go to Course
      </Button>
    );
  }

  return (
    <Button size="lg" onClick={handleEnroll} disabled={isLoading}>
      {isLoading ? 'Enrolling...' : 'Enroll Now'}
    </Button>
  );
}
