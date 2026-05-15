'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateQuizFromPrompt, type QuizQuestion } from '@/lib/groq';

export async function generateQuizFromPromptAction(
  lessonId: string,
  topic: string,
  difficulty: string
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Verify lesson ownership
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            educatorId: true,
          },
        },
      },
    });

    if (!lesson || lesson.course.educatorId !== session.user.id) {
      return { error: 'Lesson not found or unauthorized' };
    }

    const quizResult = await generateQuizFromPrompt(topic, difficulty);

    if (quizResult.error || !quizResult.questions.length) {
      return {
        error: quizResult.error || 'Failed to generate quiz',
      };
    }

    return {
      success: true,
      questions: quizResult.questions,
    };
  } catch (error) {
    console.error('Generate quiz error:', error);
    return { error: 'Failed to generate quiz' };
  }
}

export async function saveQuiz(lessonId: string, questions: QuizQuestion[]) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Verify ownership
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            educatorId: true,
          },
        },
      },
    });

    if (!lesson || lesson.course.educatorId !== session.user.id) {
      return { error: 'Unauthorized' };
    }

    const existingQuiz = await db.quiz.findUnique({
      where: { lessonId },
    });

    if (existingQuiz) {
      await db.quiz.delete({
        where: { id: existingQuiz.id },
      });
    }

    const quiz = await db.quiz.create({
      data: {
        lessonId,
        questions: {
          create: questions.map((q) => ({
            text: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    revalidatePath(`/educator/courses/${lesson.courseId}`);
    revalidatePath(`/educator/courses/${lesson.courseId}/lessons/${lessonId}/edit`);
    return { success: true, quiz };
  } catch (error) {
    console.error('Save quiz error:', error);
    return { error: 'Failed to save quiz' };
  }
}

export async function getQuizByLessonId(lessonId: string) {
  try {
    const quiz = await db.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { id: 'asc' },
        },
        attempts: {
          select: { id: true },
        },
      },
    });

    return { success: true, quiz };
  } catch (error) {
    console.error('Get quiz error:', error);
    return { error: 'Failed to fetch quiz' };
  }
}

export async function submitQuizAttempt(
  quizId: string,
  answers: number[]
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'LEARNER') {
      return { error: 'Unauthorized' };
    }

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { id: 'asc' },
        },
        lesson: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!quiz) {
      return { error: 'Quiz not found' };
    }

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: quiz.lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return { error: 'Not enrolled in this course' };
    }

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctIndex) {
        score++;
      }
    });

    const attempt = await db.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        answers,
      },
    });

    revalidatePath(`/learner/courses/${quiz.lesson.courseId}`);
    return {
      success: true,
      score,
      total: quiz.questions.length,
      attempt,
    };
  } catch (error) {
    console.error('Submit quiz error:', error);
    return { error: 'Failed to submit quiz' };
  }
}

export async function deleteQuiz(lessonId: string) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Verify ownership
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            educatorId: true,
          },
        },
        quiz: true,
      },
    });

    if (!lesson || lesson.course.educatorId !== session.user.id) {
      return { error: 'Unauthorized' };
    }

    if (!lesson.quiz) {
      return { error: 'Quiz not found' };
    }

    await db.quiz.delete({
      where: { id: lesson.quiz.id },
    });

    revalidatePath(`/educator/courses/${lesson.courseId}`);
    revalidatePath(`/educator/courses/${lesson.courseId}/lessons/${lessonId}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Delete quiz error:', error);
    return { error: 'Failed to delete quiz' };
  }
}

export async function getUserQuizAttempts(quizId: string) {
  try {
    const session = await auth();

    if (!session) {
      return { error: 'Unauthorized' };
    }

    const attempts = await db.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        quizId,
      },
      orderBy: {
        attemptedAt: 'desc',
      },
    });

    return { success: true, attempts };
  } catch (error) {
    console.error('Get user quiz attempts error:', error);
    return { error: 'Failed to fetch quiz attempts' };
  }
}

export async function getQuizAttemptDetails(attemptId: string) {
  try {
    const session = await auth();

    if (!session) {
      return { error: 'Unauthorized' };
    }

    const attempt = await db.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { id: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt) {
      return { error: 'Attempt not found' };
    }

    if (attempt.userId !== session.user.id) {
      return { error: 'Unauthorized' };
    }

    return { success: true, attempt };
  } catch (error) {
    console.error('Get quiz attempt details error:', error);
    return { error: 'Failed to fetch attempt details' };
  }
}
