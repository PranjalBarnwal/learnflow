'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { lessonSchema, type LessonInput } from '@/lib/validations/lesson.schema';
import { parseVideoUrl } from '@/lib/embed';

export async function createLesson(courseId: string, data: LessonInput) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can create lessons.' };
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!course) {
      return { error: 'Course not found' };
    }

    if (course.educatorId !== session.user.id) {
      return { error: 'Unauthorized. You can only add lessons to your own courses.' };
    }

    if (data.videoUrl && data.videoUrl.trim() !== '') {
      const embed = parseVideoUrl(data.videoUrl);
      if (!embed) {
        return { error: 'Invalid video URL. Only YouTube and Loom videos are supported.' };
      }
    }

    const validated = lessonSchema.parse(data);

    const lastLesson = await db.lesson.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    const orderIndex = lastLesson ? lastLesson.orderIndex + 1 : 0;

    const lesson = await db.lesson.create({
      data: {
        ...validated,
        courseId,
        orderIndex,
      },
    });

    revalidatePath(`/educator/courses/${courseId}`);
    revalidatePath('/educator/courses');
    return { success: true, lesson };
  } catch (error) {
    console.error('Create lesson error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create lesson' };
  }
}

export async function updateLesson(lessonId: string, data: LessonInput) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can update lessons.' };
    }

    const existing = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { educatorId: true, id: true },
        },
      },
    });

    if (!existing) {
      return { error: 'Lesson not found' };
    }

    if (existing.course.educatorId !== session.user.id) {
      return { error: 'Unauthorized. You can only update lessons in your own courses.' };
    }

    if (data.videoUrl && data.videoUrl.trim() !== '') {
      const embed = parseVideoUrl(data.videoUrl);
      if (!embed) {
        return { error: 'Invalid video URL. Only YouTube and Loom videos are supported.' };
      }
    }

    const validated = lessonSchema.parse(data);

    const lesson = await db.lesson.update({
      where: { id: lessonId },
      data: {
        title: validated.title,
        body: validated.body,
        videoUrl: validated.videoUrl,
      },
    });

    revalidatePath(`/educator/courses/${existing.course.id}`);
    revalidatePath('/educator/courses');
    return { success: true, lesson };
  } catch (error) {
    console.error('Update lesson error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update lesson' };
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can delete lessons.' };
    }

    const existing = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { educatorId: true, id: true },
        },
      },
    });

    if (!existing) {
      return { error: 'Lesson not found' };
    }

    if (existing.course.educatorId !== session.user.id) {
      return { error: 'Unauthorized. You can only delete lessons in your own courses.' };
    }

    await db.lesson.delete({
      where: { id: lessonId },
    });

    revalidatePath(`/educator/courses/${existing.course.id}`);
    revalidatePath('/educator/courses');
    return { success: true };
  } catch (error) {
    console.error('Delete lesson error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to delete lesson' };
  }
}

export async function reorderLessons(courseId: string, lessonIds: string[]) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can reorder lessons.' };
    }

    // Check course ownership
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!course) {
      return { error: 'Course not found' };
    }

    if (course.educatorId !== session.user.id) {
      return { error: 'Unauthorized. You can only reorder lessons in your own courses.' };
    }

    await db.$transaction(
      lessonIds.map((lessonId, index) =>
        db.lesson.update({
          where: { id: lessonId },
          data: { orderIndex: index },
        })
      )
    );

    revalidatePath(`/educator/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error('Reorder lessons error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to reorder lessons' };
  }
}

export async function getLessonById(lessonId: string) {
  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            educatorId: true,
          },
        },
      },
    });

    if (!lesson) {
      return { error: 'Lesson not found' };
    }

    return { success: true, lesson };
  } catch (error) {
    console.error('Get lesson error:', error);
    return { error: 'Failed to fetch lesson' };
  }
}
