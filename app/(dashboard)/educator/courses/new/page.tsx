import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CourseForm } from '@/components/course/CourseForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewCoursePage() {
  const session = await auth();

  if (!session || session.user.role !== 'EDUCATOR') {
    redirect('/login');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/educator/courses">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </Link>

      {/* Form */}
      <CourseForm mode="create" />
    </div>
  );
}
