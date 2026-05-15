'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lessonSchema, type LessonInput } from '@/lib/validations/lesson.schema';
import { createLesson, updateLesson } from '@/actions/lesson.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoEmbed } from './VideoEmbed';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LessonFormProps {
  courseId: string;
  initialData?: LessonInput & { id?: string };
  mode: 'create' | 'edit';
}

export function LessonForm({ courseId, initialData, mode }: LessonFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LessonInput>({
    resolver: zodResolver(lessonSchema),
    defaultValues: initialData || {
      title: '',
      body: '',
      videoUrl: '',
    },
  });

  const videoUrl = watch('videoUrl');
  const body = watch('body');

  async function onSubmit(data: LessonInput) {
    setIsLoading(true);

    try {
      const result =
        mode === 'create'
          ? await createLesson(courseId, data)
          : await updateLesson(initialData?.id!, data);

      if (result.error) {
        toast.error('Error', {
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      toast.success('Success', {
        description: `Lesson ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });

      router.push(`/educator/courses/${courseId}`);
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
            {mode === 'create' ? 'Create New Lesson' : 'Edit Lesson'}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Add a new lesson to your course'
              : 'Update your lesson content'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Lesson Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Introduction to Variables"
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL (optional)</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=... or https://www.loom.com/share/..."
              {...register('videoUrl')}
              disabled={isLoading}
            />
            {errors.videoUrl && (
              <p className="text-sm text-red-600">{errors.videoUrl.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Supports YouTube and Loom videos
            </p>

            {videoUrl && videoUrl.trim() !== '' && (
              <div className="mt-4">
                <VideoEmbed url={videoUrl} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">
                Lesson Content <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
            </div>

            {showPreview ? (
              <div className="prose prose-sm max-w-none p-4 border rounded-md bg-gray-50 min-h-[200px]">
                {body ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {body}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-400">Preview will appear here...</p>
                )}
              </div>
            ) : (
              <Textarea
                id="body"
                placeholder="Write your lesson content here. You can use markdown formatting..."
                rows={12}
                {...register('body')}
                disabled={isLoading}
              />
            )}

            {errors.body && (
              <p className="text-sm text-red-600">{errors.body.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Write the main content of your lesson. Supports plain text and markdown.
            </p>
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
                'Create Lesson'
              ) : (
                'Update Lesson'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
