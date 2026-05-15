import { z } from 'zod';

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  body: z.string().min(10, 'Content must be at least 10 characters'),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  orderIndex: z.number().int().min(0).optional(),
});

export type LessonInput = z.infer<typeof lessonSchema>;
