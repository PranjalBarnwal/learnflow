import { z } from 'zod';

export const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(z.string()).length(4, 'Must have exactly 4 options'),
  correctIndex: z.number().int().min(0).max(3),
});

export const quizSchema = z.object({
  questions: z.array(questionSchema).min(1, 'Must have at least 1 question'),
});

export const quizAttemptSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.number().int().min(0).max(3)),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;
