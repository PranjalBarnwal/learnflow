import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getLessonById } from '@/actions/lesson.actions';
import { getQuizByLessonId } from '@/actions/quiz.actions';
import { LessonForm } from '@/components/course/LessonForm';
import { QuizEditor } from '@/components/quiz/QuizEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EditLessonPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'EDUCATOR') {
    redirect('/login');
  }

  const { courseId, lessonId } = await params;
  const result = await getLessonById(lessonId);
  const quizResult = await getQuizByLessonId(lessonId);

  if (result.error || !result.lesson) {
    redirect(`/educator/courses/${courseId}`);
  }

  const lesson = result.lesson;

  // Check ownership
  if (lesson.course.educatorId !== session.user.id) {
    redirect('/educator/courses');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href={`/educator/courses/${courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>
        <div className="text-sm text-gray-600">
          Course: <span className="font-medium">{lesson.course.title}</span>
        </div>
      </div>

      {/* Lesson Form */}
      <LessonForm
        courseId={courseId}
        mode="edit"
        initialData={{
          id: lesson.id,
          title: lesson.title,
          body: lesson.body,
          videoUrl: lesson.videoUrl || '',
        }}
      />

      {/* Quiz Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>
            {quizResult.quiz
              ? 'Edit or regenerate the quiz for this lesson'
              : 'Generate an AI-powered quiz to test learners on this lesson'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizEditor lessonId={lessonId} />
        </CardContent>
      </Card>
    </div>
  );
}
