'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseSchema, type CourseInput } from '@/lib/validations/course.schema';

export async function createCourse(data: CourseInput) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can create courses.' };
    }

    const validated = courseSchema.parse(data);

    const course = await db.course.create({
      data: {
        ...validated,
        educatorId: session.user.id,
      },
    });

    revalidatePath('/educator');
    revalidatePath('/educator/courses');
    return { success: true, course };
  } catch (error) {
    console.error('Create course error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create course' };
  }
}

export async function updateCourse(courseId: string, data: CourseInput) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can update courses.' };
    }

    const existing = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!existing) {
      return { error: 'Course not found' };
    }

    if (existing.educatorId !== session.user.id) {
      return { error: 'Unauthorized. You can only update your own courses.' };
    }

    const validated = courseSchema.parse(data);

    const course = await db.course.update({
      where: { id: courseId },
      data: validated,
    });

    revalidatePath('/educator');
    revalidatePath('/educator/courses');
    revalidatePath(`/educator/courses/${courseId}`);
    return { success: true, course };
  } catch (error) {
    console.error('Update course error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update course' };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can delete courses.' };
    }

    const existing = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!existing) {
      return { error: 'Course not found' };
    }

    if (existing.educatorId !== session.user.id) {
      return { error: 'Unauthorized. You can only delete your own courses.' };
    }

    await db.course.delete({
      where: { id: courseId },
    });

    revalidatePath('/educator');
    revalidatePath('/educator/courses');
    return { success: true };
  } catch (error) {
    console.error('Delete course error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to delete course' };
  }
}

export async function getCoursesByEducator(
  educatorId: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const skip = (page - 1) * limit;

    const [courses, total, publishedCount, totalEnrollments, totalLessons] = await Promise.all([
      db.course.findMany({
        where: { educatorId },
        include: {
          _count: {
            select: {
              lessons: true,
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.course.count({ where: { educatorId } }),
      db.course.count({ where: { educatorId, published: true } }),
      db.enrollment.count({ where: { course: { educatorId } } }),
      db.lesson.count({ where: { course: { educatorId } } }),
    ]);

    return {
      success: true,
      courses,
      publishedCount,
      totalEnrollments,
      totalLessons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + courses.length < total,
      },
    };
  } catch (error) {
    console.error('Get courses error:', error);
    return { error: 'Failed to fetch courses' };
  }
}

export async function getCourseById(courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        educator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return { error: 'Course not found' };
    }

    return { success: true, course };
  } catch (error) {
    console.error('Get course error:', error);
    return { error: 'Failed to fetch course' };
  }
}

export async function toggleCoursePublish(courseId: string) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized. Only educators can publish courses.' };
    }

    const existing = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true, published: true },
    });

    if (!existing) {
      return { error: 'Course not found' };
    }

    if (existing.educatorId !== session.user.id) {
      return { error: 'Unauthorized. You can only publish your own courses.' };
    }

    const course = await db.course.update({
      where: { id: courseId },
      data: { published: !existing.published },
    });

    revalidatePath('/educator');
    revalidatePath('/educator/courses');
    revalidatePath(`/educator/courses/${courseId}`);
    return { success: true, course };
  } catch (error) {
    console.error('Toggle publish error:', error);
    return { error: 'Failed to toggle publish status' };
  }
}
