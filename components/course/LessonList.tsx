'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderLessons, deleteLesson } from '@/actions/lesson.actions';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  orderIndex: number;
  videoUrl?: string | null;
}

interface LessonListProps {
  courseId: string;
  initialLessons: Lesson[];
}

function SortableLesson({
  lesson,
  courseId,
  index,
  onDelete,
}: {
  lesson: Lesson;
  courseId: string;
  index: number;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="text-gray-500 font-medium min-w-[2rem]">#{index + 1}</span>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{lesson.title}</h4>
        {lesson.videoUrl && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Video className="h-3 w-3" />
            <span>Has video</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/educator/courses/${courseId}/lessons/${lesson.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => onDelete(lesson.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function LessonList({ courseId, initialLessons }: LessonListProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [isReordering, setIsReordering] = useState(false);

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
    setIsReordering(true);

    const result = await reorderLessons(
      courseId,
      newLessons.map((l) => l.id)
    );

    setIsReordering(false);

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      });
      // Revert on error
      setLessons(lessons);
    } else {
      toast.success('Success', {
        description: 'Lessons reordered successfully',
      });
      router.refresh();
    }
  }

  async function handleDelete(lessonId: string) {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    const result = await deleteLesson(lessonId);

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      });
      return;
    }

    toast.success('Success', {
      description: 'Lesson deleted successfully',
    });

    setLessons(lessons.filter((l) => l.id !== lessonId));
    router.refresh();
  }

  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {isReordering && (
        <div className="text-sm text-blue-600 mb-2">Saving new order...</div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {lessons.map((lesson, index) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              index={index}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      <p className="text-sm text-gray-500 mt-4">
        💡 Tip: Drag and drop lessons to reorder them
      </p>
    </div>
  );
}
