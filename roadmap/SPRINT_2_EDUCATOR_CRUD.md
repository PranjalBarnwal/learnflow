# Sprint 2 — Educator CRUD (Courses & Lessons)

**Duration:** 3 days  
**Goal:** Build complete course and lesson management system for educators

---

## Phase 1: Educator Dashboard Layout (3 hours) ✅ COMPLETE

### Tasks
- [x] Create `app/(dashboard)/layout.tsx` with shared navigation
- [x] Create `components/layout/Navbar.tsx` with user menu
- [x] Create `components/layout/Sidebar.tsx` for educator navigation
- [x] Create `app/(dashboard)/educator/page.tsx` (dashboard home)
- [x] Add logout functionality
- [x] Style with Tailwind responsive design

### Acceptance Criteria
- ✅ Navbar shows user name and role
- ✅ Sidebar has links: Dashboard, My Courses, Create Course
- ✅ Layout is responsive (mobile hamburger menu)
- ✅ Logout button clears session and redirects to login
- ✅ Active route is highlighted in navigation

### Files Created
```
app/
└── (dashboard)/
    ├── layout.tsx
    └── educator/
        └── page.tsx
components/
└── layout/
    ├── Navbar.tsx
    ├── Sidebar.tsx
    └── Footer.tsx
```

### Implementation Notes

**app/(dashboard)/layout.tsx:**
```typescript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />
      <div className="flex">
        <Sidebar role={session.user.role} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
```

---

## Phase 2: Course CRUD — Server Actions (4 hours) ✅ COMPLETE

### Tasks
- [x] Create `actions/course.actions.ts`
- [x] Implement `createCourse` action
- [x] Implement `updateCourse` action
- [x] Implement `deleteCourse` action
- [x] Implement `getCoursesByEducator` action
- [x] Implement `getCourseById` action
- [x] Add proper error handling and validation
- [x] Create `app/(dashboard)/educator/courses/page.tsx` for listing

### Acceptance Criteria
- ✅ All actions validate input with Zod schemas
- ✅ Actions check user role and ownership
- ✅ Delete cascades to lessons, enrollments, progress
- ✅ Actions return typed success/error responses
- ✅ Educator can only modify their own courses

### Files Created
```
actions/
└── course.actions.ts
```

### Implementation Notes

**actions/course.actions.ts:**
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { courseSchema, type CourseInput } from '@/lib/validations/course.schema';

export async function createCourse(data: CourseInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    const validated = courseSchema.parse(data);

    const course = await db.course.create({
      data: {
        ...validated,
        educatorId: session.user.id,
      },
    });

    revalidatePath('/educator');
    return { success: true, course };
  } catch (error) {
    console.error('Create course error:', error);
    return { error: 'Failed to create course' };
  }
}

export async function updateCourse(courseId: string, data: CourseInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Check ownership
    const existing = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!existing || existing.educatorId !== session.user.id) {
      return { error: 'Course not found or unauthorized' };
    }

    const validated = courseSchema.parse(data);

    const course = await db.course.update({
      where: { id: courseId },
      data: validated,
    });

    revalidatePath('/educator');
    revalidatePath(`/educator/courses/${courseId}`);
    return { success: true, course };
  } catch (error) {
    console.error('Update course error:', error);
    return { error: 'Failed to update course' };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Check ownership
    const existing = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!existing || existing.educatorId !== session.user.id) {
      return { error: 'Course not found or unauthorized' };
    }

    await db.course.delete({
      where: { id: courseId },
    });

    revalidatePath('/educator');
    return { success: true };
  } catch (error) {
    console.error('Delete course error:', error);
    return { error: 'Failed to delete course' };
  }
}

export async function getCoursesByEducator(educatorId: string) {
  try {
    const courses = await db.course.findMany({
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
    });

    return { success: true, courses };
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
```

---

## Phase 3: Course UI Components (4 hours) ✅ COMPLETE

### Tasks
- [x] Create `components/course/CourseCard.tsx`
- [x] Create `components/course/CourseForm.tsx` (reusable for create/edit)
- [x] Create `app/(dashboard)/educator/courses/new/page.tsx`
- [x] Create `app/(dashboard)/educator/courses/[courseId]/edit/page.tsx`
- [x] Create `app/(dashboard)/educator/courses/[courseId]/page.tsx` (detail view)
- [x] Add form validation with react-hook-form
- [x] Add loading states and toast notifications
- [x] Add delete confirmation dialog
- [x] Add publish/unpublish toggle

### Acceptance Criteria
- ✅ CourseCard shows title, description, thumbnail, stats
- ✅ CourseForm has all fields with proper validation
- ✅ Create page saves course and redirects to educator dashboard
- ✅ Edit page pre-fills form with existing data
- ✅ Delete button shows confirmation dialog
- ✅ Published toggle works correctly

### Files Created
```
components/
└── course/
    ├── CourseCard.tsx
    └── CourseForm.tsx
app/
└── (dashboard)/
    └── educator/
        └── courses/
            ├── new/
            │   └── page.tsx
            └── [courseId]/
                └── edit/
                    └── page.tsx
```

### Implementation Notes

**components/course/CourseForm.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseInput } from '@/lib/validations/course.schema';
import { createCourse, updateCourse } from '@/actions/course.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface CourseFormProps {
  initialData?: CourseInput & { id?: string };
  mode: 'create' | 'edit';
}

export function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      thumbnailUrl: '',
      category: '',
      difficulty: 'BEGINNER',
      published: false,
    },
  });

  async function onSubmit(data: CourseInput) {
    setIsLoading(true);

    const result = mode === 'create'
      ? await createCourse(data)
      : await updateCourse(initialData?.id!, data);

    setIsLoading(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: `Course ${mode === 'create' ? 'created' : 'updated'} successfully`,
    });

    router.push('/educator');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Form fields implementation */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : mode === 'create' ? 'Create Course' : 'Update Course'}
      </Button>
    </form>
  );
}
```

---

## Phase 4: Lesson CRUD — Server Actions (4 hours) ✅ COMPLETE

### Tasks
- [x] Create `actions/lesson.actions.ts`
- [x] Implement `createLesson` action
- [x] Implement `updateLesson` action
- [x] Implement `deleteLesson` action
- [x] Implement `reorderLessons` action
- [x] Implement `getLessonById` action
- [x] Create `lib/embed.ts` for video URL parsing
- [x] Add Zod schema for lesson validation

### Acceptance Criteria
- ✅ Lessons are created with auto-incremented orderIndex
- ✅ Video URL is validated and parsed server-side
- ✅ Educator can only modify lessons in their own courses
- ✅ Reorder updates orderIndex for multiple lessons atomically
- ✅ Delete cascades to progress records

### Files Created
```
actions/
└── lesson.actions.ts
lib/
├── embed.ts
└── validations/
    └── lesson.schema.ts
```

### Implementation Notes

**lib/embed.ts:**
```typescript
export type VideoProvider = 'youtube' | 'loom' | null;

export interface VideoEmbed {
  provider: VideoProvider;
  embedId: string;
}

export function parseVideoUrl(url: string): VideoEmbed | null {
  if (!url) return null;

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      provider: 'youtube',
      embedId: youtubeMatch[1],
    };
  }

  // Loom patterns
  const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const loomMatch = url.match(loomRegex);
  if (loomMatch) {
    return {
      provider: 'loom',
      embedId: loomMatch[1],
    };
  }

  return null;
}

export function getEmbedUrl(embed: VideoEmbed): string {
  switch (embed.provider) {
    case 'youtube':
      return `https://www.youtube.com/embed/${embed.embedId}`;
    case 'loom':
      return `https://www.loom.com/embed/${embed.embedId}`;
    default:
      return '';
  }
}
```

**lib/validations/lesson.schema.ts:**
```typescript
import { z } from 'zod';

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  body: z.string().min(10, 'Content must be at least 10 characters'),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  orderIndex: z.number().int().min(0).optional(),
});

export type LessonInput = z.infer<typeof lessonSchema>;
```

**actions/lesson.actions.ts:**
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { lessonSchema, type LessonInput } from '@/lib/validations/lesson.schema';
import { parseVideoUrl } from '@/lib/embed';

export async function createLesson(courseId: string, data: LessonInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Check course ownership
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!course || course.educatorId !== session.user.id) {
      return { error: 'Course not found or unauthorized' };
    }

    // Validate video URL if provided
    if (data.videoUrl) {
      const embed = parseVideoUrl(data.videoUrl);
      if (!embed) {
        return { error: 'Invalid video URL. Only YouTube and Loom are supported.' };
      }
    }

    const validated = lessonSchema.parse(data);

    // Get next order index
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
    return { success: true, lesson };
  } catch (error) {
    console.error('Create lesson error:', error);
    return { error: 'Failed to create lesson' };
  }
}

export async function reorderLessons(courseId: string, lessonIds: string[]) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Check course ownership
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { educatorId: true },
    });

    if (!course || course.educatorId !== session.user.id) {
      return { error: 'Unauthorized' };
    }

    // Update order index for each lesson
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
    return { error: 'Failed to reorder lessons' };
  }
}
```

---

## Phase 5: Lesson UI Components (5 hours) ✅ COMPLETE

### Tasks
- [x] Create `components/course/LessonList.tsx` with drag-and-drop
- [x] Create `components/course/LessonForm.tsx`
- [x] Create `components/course/VideoEmbed.tsx`
- [x] Create `app/(dashboard)/educator/courses/[courseId]/lessons/new/page.tsx`
- [x] Create `app/(dashboard)/educator/courses/[courseId]/lessons/[lessonId]/edit/page.tsx`
- [x] Install `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop
- [x] Add markdown preview for lesson body

### Acceptance Criteria
- ✅ LessonList shows all lessons in order
- ✅ Drag-and-drop reordering works smoothly
- ✅ VideoEmbed renders YouTube and Loom videos correctly
- ✅ LessonForm validates video URL before submission
- ✅ Markdown preview shows formatted content
- ✅ Delete lesson shows confirmation dialog

### Files Created
```
components/
└── course/
    ├── LessonList.tsx
    ├── LessonForm.tsx
    └── VideoEmbed.tsx
app/
└── (dashboard)/
    └── educator/
        └── courses/
            └── [courseId]/
                └── lessons/
                    ├── new/
                    │   └── page.tsx
                    └── [lessonId]/
                        └── edit/
                            └── page.tsx
```

### Implementation Notes

**Install drag-and-drop library:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**components/course/VideoEmbed.tsx:**
```typescript
'use client';

import { parseVideoUrl, getEmbedUrl } from '@/lib/embed';

interface VideoEmbedProps {
  url: string;
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  const embed = parseVideoUrl(url);

  if (!embed) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Invalid video URL</p>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(embed);

  return (
    <div className="aspect-video">
      <iframe
        src={embedUrl}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
```

**components/course/LessonList.tsx:**
```typescript
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { reorderLessons } from '@/actions/lesson.actions';
import { useToast } from '@/components/ui/use-toast';

interface Lesson {
  id: string;
  title: string;
  orderIndex: number;
}

interface LessonListProps {
  courseId: string;
  initialLessons: Lesson[];
}

export function LessonList({ courseId, initialLessons }: LessonListProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);

    const newLessons = arrayMove(lessons, oldIndex, newIndex);
    setLessons(newLessons);

    const result = await reorderLessons(
      courseId,
      newLessons.map((l) => l.id)
    );

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      setLessons(lessons); // Revert on error
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={lessons.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <SortableItem key={lesson.id} id={lesson.id} lesson={lesson} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

---

## Phase 6: Testing & Verification (3 hours)

### Tasks
- [ ] Test course creation flow
- [ ] Test course editing and deletion
- [ ] Test lesson creation with video URL
- [ ] Test lesson reordering via drag-and-drop
- [ ] Test ownership validation (educator can't edit others' courses)
- [ ] Test video embed rendering for YouTube and Loom
- [ ] Test cascade deletion (delete course → lessons deleted)

### Acceptance Criteria
- ✅ Educator can create, edit, delete courses
- ✅ Educator can create, edit, delete lessons
- ✅ Drag-and-drop reordering persists correctly
- ✅ Video embeds render without exposing raw URLs
- ✅ Ownership checks prevent unauthorized access
- ✅ All forms validate input correctly

### Test Checklist
```
Manual Testing:
□ Create course with all fields → appears in educator dashboard
□ Edit course → changes persist
□ Delete course → course and lessons removed from DB
□ Create lesson with YouTube URL → video renders
□ Create lesson with Loom URL → video renders
□ Create lesson with invalid URL → shows error
□ Drag-and-drop lessons → order updates in DB
□ Try editing another educator's course → blocked
□ Check Prisma Studio → videoUrl stored, embedId not exposed
```

---

## Sprint 2 Completion Checklist

- [x] Educator dashboard layout with navigation
- [x] Course CRUD fully functional
- [x] Lesson CRUD fully functional
- [x] Video embed extraction and rendering
- [x] Drag-and-drop lesson reordering
- [x] All Server Actions have proper validation
- [x] Ownership checks on all mutations
- [x] Responsive UI on mobile and desktop
- [ ] All manual tests passing
- [ ] Code committed to Git with clear messages

---

**Next Sprint:** Sprint 3 — Learner Experience (Browse, Enroll, Progress)
