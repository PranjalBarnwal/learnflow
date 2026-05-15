import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { VideoEmbed } from '@/components/course/VideoEmbed';
import { LessonNavigation } from '@/components/lesson/LessonNavigation';
import { MarkCompleteButton } from '@/components/lesson/MarkCompleteButton';
import { QuizSection } from '@/components/quiz/QuizSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

async function getLesson(lessonId: string, userId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      quiz: {
        include: {
          questions: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  if (!lesson) return null;

  // Check enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (!enrollment) return null;

  // Get progress
  const progress = await db.progress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId,
      },
    },
  });

  // Get all lessons for navigation
  const allLessons = await db.lesson.findMany({
    where: { courseId: lesson.courseId },
    select: { id: true, title: true, orderIndex: true },
    orderBy: { orderIndex: 'asc' },
  });

  return { lesson, isCompleted: !!progress, allLessons };
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const session = await auth();
  if (!session) return { title: 'Lesson' };

  const data = await getLesson(lessonId, session.user.id);
  if (!data) return { title: 'Lesson Not Found' };

  return {
    title: `${data.lesson.title} | ${data.lesson.course.title}`,
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;
  const session = await auth();

  if (!session || session.user.role !== 'LEARNER') {
    redirect('/login');
  }

  const data = await getLesson(lessonId, session.user.id);

  if (!data) {
    notFound();
  }

  const { lesson, isCompleted, allLessons } = data;

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/learner" className="hover:underline">
          Dashboard
        </Link>
        {' / '}
        <Link
          href={`/learner`}
          className="hover:underline"
        >
          {lesson.course.title}
        </Link>
        {' / '}
        <span>{lesson.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        {isCompleted && (
          <span className="text-green-600 text-sm font-medium">✓ Completed</span>
        )}
      </div>

      {/* Video */}
      {lesson.videoUrl && (
        <div className="mb-8">
          <VideoEmbed url={lesson.videoUrl} />
        </div>
      )}

      {/* Lesson Body */}
      <div className="prose prose-lg max-w-none mb-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {lesson.body}
        </ReactMarkdown>
      </div>

      {/* Mark Complete Button */}
      <div className="mb-8">
        <MarkCompleteButton
          lessonId={lessonId}
          isCompleted={isCompleted}
        />
      </div>

      {/* Quiz Section */}
      {lesson.quiz && lesson.quiz.questions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Test Your Knowledge</h2>
          <QuizSection
            quizId={lesson.quiz.id}
            questions={lesson.quiz.questions}
          />
        </div>
      )}

      {/* Navigation */}
      <LessonNavigation
        courseId={courseId}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
      />
    </div>
  );
}
