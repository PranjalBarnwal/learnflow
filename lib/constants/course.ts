export const COURSE_CATEGORIES = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Other',
] as const;

export const COURSE_DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export type CourseCategory = typeof COURSE_CATEGORIES[number];
export type CourseDifficulty = typeof COURSE_DIFFICULTIES[number];
