'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { generateQuizFromPromptAction, saveQuiz, getQuizByLessonId, deleteQuiz } from '@/actions/quiz.actions';
import type { QuizQuestion } from '@/lib/groq';
import { Loader2, Sparkles, Save, RefreshCw, Trash2, BookOpen } from 'lucide-react';

interface QuizEditorProps {
  lessonId: string;
  onSaved?: () => void;
}

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', description: 'Basic concepts and fundamentals' },
  { value: 'medium', label: 'Medium', description: 'Moderate understanding required' },
  { value: 'hard', label: 'Hard', description: 'Deep critical thinking needed' },
] as const;

export function QuizEditor({ lessonId, onSaved }: QuizEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [hasExistingQuiz, setHasExistingQuiz] = useState(false);

  // Input state for the generation form
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  // Load existing quiz on mount
  useEffect(() => {
    loadExistingQuiz();
  }, [lessonId]);

  async function loadExistingQuiz() {
    setIsLoading(true);
    const result = await getQuizByLessonId(lessonId);

    if (result.success && result.quiz) {
      const loadedQuestions: QuizQuestion[] = result.quiz.questions.map((q: any) => ({
        question: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
      }));

      setQuestions(loadedQuestions);
      setHasExistingQuiz(true);
    }

    setIsLoading(false);
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error('Please enter a topic', {
        description: 'Enter a topic or subject for the quiz questions.',
      });
      return;
    }

    if (topic.trim().length < 3) {
      toast.error('Topic too short', {
        description: 'Please enter a more descriptive topic (at least 3 characters).',
      });
      return;
    }

    // Warn if overwriting existing quiz
    if (hasExistingQuiz || questions.length > 0) {
      const attemptsResult = await getQuizByLessonId(lessonId);
      const hasAttempts = attemptsResult.quiz?.attempts && attemptsResult.quiz.attempts.length > 0;

      const attemptCount = hasAttempts ? (attemptsResult.quiz?.attempts?.length || 0) : 0;

      let warningMessage = 'Regenerating will replace the current quiz questions.';

      if (hasAttempts) {
        warningMessage = `⚠️ WARNING: ${attemptCount} learner${attemptCount > 1 ? 's have' : ' has'} attempted this quiz.\n\nRegenerating will:\n• Replace all quiz questions\n• Delete all learner attempt history\n• Erase all scores and progress\n\nThis action cannot be undone.`;
      }

      if (!confirm(warningMessage + '\n\nAre you sure you want to continue?')) {
        return;
      }
    }

    setIsGenerating(true);

    const result = await generateQuizFromPromptAction(lessonId, topic.trim(), difficulty);

    setIsGenerating(false);

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      });
      return;
    }

    setQuestions(result.questions!);

    toast.success('Quiz Generated', {
      description: `5 ${difficulty} questions about "${topic.trim()}"`,
    });
  }

  async function handleSave() {
    // Check if saving will overwrite existing quiz with attempts
    if (hasExistingQuiz) {
      const attemptsResult = await getQuizByLessonId(lessonId);
      const hasAttempts = attemptsResult.quiz?.attempts && attemptsResult.quiz.attempts.length > 0;

      if (hasAttempts) {
        const attemptCount = attemptsResult.quiz?.attempts?.length || 0;
        const warningMessage = `⚠️ WARNING: ${attemptCount} learner${attemptCount > 1 ? 's have' : ' has'} attempted the current quiz.\n\nSaving these changes will:\n• Replace the existing quiz questions\n• Delete all learner attempt history\n• Erase all scores and progress\n\nThis action cannot be undone.\n\nAre you sure you want to save?`;

        if (!confirm(warningMessage)) {
          return;
        }
      }
    }

    setIsSaving(true);

    const result = await saveQuiz(lessonId, questions);

    setIsSaving(false);

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      });
      return;
    }

    setHasExistingQuiz(true);
    toast.success('Success', {
      description: 'Quiz saved successfully',
    });

    onSaved?.();
  }

  async function handleDelete() {
    const attemptsResult = await getQuizByLessonId(lessonId);
    const hasAttempts = attemptsResult.quiz?.attempts && attemptsResult.quiz.attempts.length > 0;

    const attemptCount = hasAttempts ? (attemptsResult.quiz?.attempts?.length || 0) : 0;

    let warningMessage = '⚠️ Are you sure you want to delete this quiz?';

    if (hasAttempts) {
      warningMessage = `⚠️ WARNING: ${attemptCount} learner${attemptCount > 1 ? 's have' : ' has'} attempted this quiz.\n\nDeleting will:\n• Remove all quiz questions\n• Delete all learner attempt history\n• Erase all scores and progress\n\nThis action cannot be undone.`;
    } else {
      warningMessage = '⚠️ Are you sure you want to delete this quiz?\n\nThis will remove all quiz questions.\n\nThis action cannot be undone.';
    }

    if (!confirm(warningMessage + '\n\nAre you sure you want to continue?')) {
      return;
    }

    setIsDeleting(true);

    const result = await deleteQuiz(lessonId);

    setIsDeleting(false);

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      });
      return;
    }

    setQuestions([]);
    setTopic('');
    setDifficulty('medium');
    setHasExistingQuiz(false);

    toast.success('Success', {
      description: 'Quiz deleted successfully',
    });

    onSaved?.();
  }

  function handleStartOver() {
    setQuestions([]);
    setTopic('');
    setDifficulty('medium');
  }

  function updateQuestion(index: number, field: keyof QuizQuestion, value: any) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    const updated = [...questions];
    const options = [...updated[qIndex].options];
    options[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options: options as any };
    setQuestions(updated);
  }

  function deleteQuestion(index: number) {
    if (hasExistingQuiz) {
      const warningMessage = '⚠️ Removing this question will affect the quiz structure.\n\nIf learners have already attempted this quiz, their history will be deleted when you save.\n\nAre you sure you want to remove this question?';

      if (!confirm(warningMessage)) {
        return;
      }
    }

    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    toast.success('Question removed');
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-500">Loading quiz...</p>
        </CardContent>
      </Card>
    );
  }

  // ── Empty state: show the generation form ──────────────────────────
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
            <div className="rounded-full bg-blue-100 p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Generate AI Quiz</h3>
              <p className="text-gray-500 text-sm mb-6">
                Describe a topic and choose a difficulty level. The AI will create 5 multiple-choice questions.
              </p>
            </div>

            <div className="w-full space-y-4">
              {/* Topic input */}
              <div className="space-y-2">
                <Label htmlFor="quiz-topic">Quiz Topic</Label>
                <Input
                  id="quiz-topic"
                  placeholder="e.g. Photosynthesis, World War II, JavaScript Promises..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              {/* Difficulty selector */}
              <div className="space-y-2">
                <Label htmlFor="quiz-difficulty">Difficulty Level</Label>                  <Select
                    value={difficulty}
                    onValueChange={(value: string | null) => {
                      if (value) setDifficulty(value);
                    }}
                    disabled={isGenerating}
                  >
                  <SelectTrigger id="quiz-difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label} — {d.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>

              {isGenerating && (
                <p className="text-sm text-gray-500 text-center animate-pulse">
                  Crafting questions about &ldquo;{topic.trim()}&rdquo;...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Questions exist: show review/edit UI ──────────────────────────
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Review & Edit Quiz</CardTitle>
              <CardDescription>
                {hasExistingQuiz
                  ? 'Edit the existing quiz or regenerate new questions'
                  : `Generated — ${difficulty} difficulty`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {hasExistingQuiz && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Quiz
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleStartOver}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              <Button onClick={handleSave} disabled={isSaving || questions.length === 0}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {questions.map((q, qIndex) => (
        <Card key={qIndex}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Question {qIndex + 1}
                  </label>
                  <Input
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'question', e.target.value)
                    }
                    placeholder="Enter question"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium block">Options</label>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.correctIndex === oIndex}
                      onChange={() =>
                        updateQuestion(qIndex, 'correctIndex', oIndex)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-1">
                  Select the radio button to mark the correct answer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
