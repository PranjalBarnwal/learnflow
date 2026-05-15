'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function enrollInCourse(courseId: string) {
  try {
    const session = await auth();

    if (!session) {
      return { error: 'You must be logged in to enroll' };
    }

    if (session.user.role !== 'LEARNER') {
      return { error: 'Only learners can enroll in courses' };
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { published: true },
    });

    if (!course || !course.published) {
      return { error: 'Course not found or not available' };
    }

    const existing = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existing) {
      return { error: 'Already enrolled in this course' };
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    });

    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/learner');
    return { success: true, enrollment };
  } catch (error) {
    console.error('Enrollment error:', error);
    return { error: 'Failed to enroll in course' };
  }
}

export async function checkEnrollment(courseId: string, userId: string) {
  try {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return { enrolled: !!enrollment };
  } catch (error) {
    return { enrolled: false };
  }
}
