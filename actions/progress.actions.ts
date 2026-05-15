'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function markLessonComplete(lessonId: string) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'LEARNER') {
      return { error: 'Unauthorized' };
    }

    // Check if enrolled in the course
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    });

    if (!lesson) {
      return { error: 'Lesson not found' };
    }

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return { error: 'Not enrolled in this course' };
    }

    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId,
      },
    });

    revalidatePath(`/learner/courses/${lesson.courseId}`);
    return { success: true, progress };
  } catch (error) {
    console.error('Mark complete error:', error);
    return { error: 'Failed to mark lesson complete' };
  }
}

export async function getLessonProgress(lessonId: string, userId: string) {
  try {
    const progress = await db.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    return { completed: !!progress };
  } catch (error) {
    return { completed: false };
  }
}

export async function getCourseProgress(courseId: string, userId: string) {
  try {
    const lessons = await db.lesson.findMany({
      where: { courseId },
      select: { id: true },
    });

    const progress = await db.progress.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map((l) => l.id) },
      },
    });

    return {
      total: lessons.length,
      completed: progress.length,
      percentage: lessons.length > 0 ? (progress.length / lessons.length) * 100 : 0,
    };
  } catch (error) {
    return { total: 0, completed: 0, percentage: 0 };
  }
}
