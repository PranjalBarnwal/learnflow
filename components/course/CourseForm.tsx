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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { COURSE_CATEGORIES } from '@/lib/constants/course';

interface CourseFormProps {
  initialData?: CourseInput & { id?: string };
  mode: 'create' | 'edit';
}

export function CourseForm({ initialData, mode }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseInput>({
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

  const difficulty = watch('difficulty');
  const category = watch('category');
  const published = watch('published');

  async function onSubmit(data: CourseInput) {
    setIsLoading(true);

    try {
      const result =
        mode === 'create'
          ? await createCourse(data)
          : await updateCourse(initialData?.id!, data);

      if (result.error) {
        toast.error('Error', {
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      toast.success('Success', {
        description: `Course ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });

      router.push('/educator/courses');
      router.refresh();
    } catch (error) {
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'Create New Course' : 'Edit Course'}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Fill in the details to create a new course'
              : 'Update your course information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to TypeScript"
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              rows={4}
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('thumbnailUrl')}
              disabled={isLoading}
            />
            {errors.thumbnailUrl && (
              <p className="text-sm text-red-600">{errors.thumbnailUrl.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Provide a URL to an image for your course thumbnail
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setValue('category', value || '')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">
              Difficulty Level <span className="text-red-500">*</span>
            </Label>
            <Select
              value={difficulty}
              onValueChange={(value) =>
                setValue('difficulty', value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED')
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-sm text-red-600">{errors.difficulty.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="published" className="cursor-pointer">
              Publish course (make it visible to learners)
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Course'
              ) : (
                'Update Course'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
