# Sprint 4 — AI Quiz Generator

**Duration:** 2.5 days  
**Goal:** Implement AI-powered quiz generation using Groq and YouTube transcripts

---

## Phase 1: YouTube Transcript Extraction (4 hours)

### Tasks
- [ ] Install `youtube-transcript` package
- [ ] Create `lib/transcript.ts` utility
- [ ] Implement transcript fetching
- [ ] Implement text cleaning (remove filler words)
- [ ] Implement truncation to 3000 tokens
- [ ] Add fallback to lesson body
- [ ] Handle errors gracefully

### Acceptance Criteria
- ✅ Extracts transcript from YouTube video ID
- ✅ Cleans filler words ("um", "uh", "so basically", etc.)
- ✅ Truncates to ~3000 tokens while preserving sentence boundaries
- ✅ Falls back to lesson body if transcript unavailable
- ✅ Returns clear error messages for unsupported videos
- ✅ Handles private/unlisted videos gracefully

### Files Created
```
lib/
└── transcript.ts
```

### Implementation Notes

**Install dependencies:**
```bash
npm install youtube-transcript
```

**lib/transcript.ts:**
```typescript
import { YoutubeTranscript } from 'youtube-transcript';
import { parseVideoUrl } from './embed';

const FILLER_WORDS = [
  /\b(um|uh|er|ah|like|you know|basically|actually|literally)\b/gi,
  /\s+/g, // Multiple spaces
];

const MAX_TOKENS = 3000; // Approximate token limit
const CHARS_PER_TOKEN = 4; // Rough estimate: 1 token ≈ 4 characters

export interface TranscriptResult {
  text: string;
  source: 'transcript' | 'body' | 'none';
  error?: string;
}

/**
 * Extracts and cleans YouTube transcript, with fallback to lesson body
 */
export async function getTranscriptOrFallback(
  videoUrl: string | null,
  lessonBody: string
): Promise<TranscriptResult> {
  // Try transcript first if video URL provided
  if (videoUrl) {
    const embed = parseVideoUrl(videoUrl);

    if (embed?.provider === 'youtube') {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(embed.embedId);

        if (transcript && transcript.length > 0) {
          const rawText = transcript.map((item) => item.text).join(' ');
          const cleanedText = cleanTranscript(rawText);
          const truncatedText = truncateToTokenLimit(cleanedText, MAX_TOKENS);

          return {
            text: truncatedText,
            source: 'transcript',
          };
        }
      } catch (error: any) {
        console.error('Transcript fetch error:', error);

        // Check for specific error types
        if (error.message?.includes('Transcript is disabled')) {
          return {
            text: '',
            source: 'none',
            error: 'Transcript is disabled for this video',
          };
        }

        if (error.message?.includes('Video unavailable')) {
          return {
            text: '',
            source: 'none',
            error: 'Video is unavailable or private',
          };
        }

        // Generic transcript error - fall through to body fallback
      }
    }
  }

  // Fallback to lesson body
  if (lessonBody && lessonBody.length > 200) {
    const cleanedBody = cleanTranscript(lessonBody);
    const truncatedBody = truncateToTokenLimit(cleanedBody, MAX_TOKENS);

    return {
      text: truncatedBody,
      source: 'body',
    };
  }

  // No content available
  return {
    text: '',
    source: 'none',
    error: 'Insufficient content for quiz generation. Add lesson notes or enable video captions.',
  };
}

/**
 * Removes filler words and normalizes whitespace
 */
function cleanTranscript(text: string): string {
  let cleaned = text;

  // Remove filler words
  FILLER_WORDS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, ' ');
  });

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Truncates text to approximate token limit while preserving sentence boundaries
 */
function truncateToTokenLimit(text: string, maxTokens: number): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;

  if (text.length <= maxChars) {
    return text;
  }

  // Truncate to max chars
  let truncated = text.slice(0, maxChars);

  // Find last sentence boundary (., !, ?)
  const lastSentence = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  if (lastSentence > maxChars * 0.8) {
    // If we found a sentence boundary in the last 20%, use it
    truncated = truncated.slice(0, lastSentence + 1);
  }

  return truncated.trim();
}

/**
 * Estimates token count (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
```

---

## Phase 2: Groq Integration (3 hours)

### Tasks
- [ ] Sign up for Groq API (free tier)
- [ ] Add `GROQ_API_KEY` to environment variables
- [ ] Install Groq SDK
- [ ] Create `lib/groq.ts` utility
- [ ] Implement quiz generation prompt
- [ ] Parse and validate Groq response
- [ ] Handle API errors and rate limits

### Acceptance Criteria
- ✅ Groq client initialized with API key
- ✅ Prompt generates exactly 5 MCQs
- ✅ Response is valid JSON with correct structure
- ✅ Handles Groq API errors gracefully
- ✅ Returns typed quiz data
- ✅ API key never exposed to client

### Files Created
```
lib/
└── groq.ts
```

### Implementation Notes

**Install Groq SDK:**
```bash
npm install groq-sdk
```

**Add to .env.local:**
```env
GROQ_API_KEY="your-groq-api-key-here"
```

**lib/groq.ts:**
```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface GenerateQuizResult {
  questions: QuizQuestion[];
  error?: string;
}

/**
 * Generates 5 multiple choice questions from lesson content using Groq
 */
export async function generateQuiz(content: string): Promise<GenerateQuizResult> {
  if (!content || content.length < 100) {
    return {
      questions: [],
      error: 'Content too short for quiz generation',
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert quiz creator. Given lesson content, generate exactly 5 multiple choice questions to test understanding.

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Rules:
- Return raw JSON only - no markdown fences, no preamble, no explanation
- Exactly 5 questions
- Each question must have exactly 4 options
- correctIndex must be 0, 1, 2, or 3
- Questions should test comprehension, not memorization
- Options should be plausible and similar in length`,
        },
        {
          role: 'user',
          content: `Generate 5 quiz questions from this lesson content:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return {
        questions: [],
        error: 'No response from AI',
      };
    }

    // Parse JSON response
    let questions: QuizQuestion[];
    try {
      // Remove markdown fences if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      questions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      return {
        questions: [],
        error: 'Failed to parse AI response',
      };
    }

    // Validate structure
    if (!Array.isArray(questions) || questions.length !== 5) {
      return {
        questions: [],
        error: 'AI returned invalid number of questions',
      };
    }

    // Validate each question
    for (const q of questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctIndex !== 'number' ||
        q.correctIndex < 0 ||
        q.correctIndex > 3
      ) {
        return {
          questions: [],
          error: 'AI returned invalid question structure',
        };
      }
    }

    return { questions };
  } catch (error: any) {
    console.error('Groq API error:', error);

    if (error.status === 429) {
      return {
        questions: [],
        error: 'Rate limit exceeded. Please try again in a minute.',
      };
    }

    if (error.status === 401) {
      return {
        questions: [],
        error: 'Invalid API key',
      };
    }

    return {
      questions: [],
      error: 'Failed to generate quiz',
    };
  }
}
```

---

## Phase 3: Quiz Generation Server Action (3 hours)

### Tasks
- [ ] Create `actions/quiz.actions.ts`
- [ ] Implement `generateQuizFromLesson` action
- [ ] Implement `saveQuiz` action
- [ ] Implement `getQuizByLessonId` action
- [ ] Add proper authorization checks
- [ ] Integrate transcript extraction + Groq generation

### Acceptance Criteria
- ✅ Only course educator can generate quiz
- ✅ Transcript extracted and cleaned before sending to Groq
- ✅ Generated questions saved to database
- ✅ Existing quiz can be regenerated (replaces old one)
- ✅ Returns clear error messages
- ✅ All operations are server-side only

### Files Created
```
actions/
└── quiz.actions.ts
```

### Implementation Notes

**actions/quiz.actions.ts:**
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { getTranscriptOrFallback } from '@/lib/transcript';
import { generateQuiz, type QuizQuestion } from '@/lib/groq';

export async function generateQuizFromLesson(lessonId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'EDUCATOR') {
      return { error: 'Unauthorized' };
    }

    // Get lesson with course ownership check
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

    // Extract transcript or use lesson body
    const transcriptResult = await getTranscriptOrFallback(
      lesson.videoUrl,
      lesson.body
    );

    if (transcriptResult.source === 'none' || !transcriptResult.text) {
      return {
        error:
          transcriptResult.error ||
          'Insufficient content for quiz generation',
      };
    }

    // Generate quiz with Groq
    const quizResult = await generateQuiz(transcriptResult.text);

    if (quizResult.error || !quizResult.questions.length) {
      return {
        error: quizResult.error || 'Failed to generate quiz',
      };
    }

    return {
      success: true,
      questions: quizResult.questions,
      source: transcriptResult.source,
    };
  } catch (error) {
    console.error('Generate quiz error:', error);
    return { error: 'Failed to generate quiz' };
  }
}

export async function saveQuiz(lessonId: string, questions: QuizQuestion[]) {
  try {
    const session = await getServerSession(authOptions);

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

    // Delete existing quiz if present
    const existingQuiz = await db.quiz.findUnique({
      where: { lessonId },
    });

    if (existingQuiz) {
      await db.quiz.delete({
        where: { id: existingQuiz.id },
      });
    }

    // Create new quiz with questions
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
    const session = await getServerSession(authOptions);

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

    // Check enrollment
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

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctIndex) {
        score++;
      }
    });

    // Save attempt
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
```

---

## Phase 4: Quiz UI Components (4 hours)

### Tasks
- [ ] Create `components/quiz/QuizEditor.tsx` (educator review/edit)
- [ ] Create `components/quiz/QuizPlayer.tsx` (learner attempt)
- [ ] Create `components/quiz/QuizResults.tsx` (score display)
- [ ] Add "Generate Quiz" button to lesson edit page
- [ ] Add quiz section to lesson viewer (learner)
- [ ] Add loading states for AI generation

### Acceptance Criteria
- ✅ Educator can trigger quiz generation from lesson
- ✅ QuizEditor shows generated questions for review
- ✅ Educator can edit questions before saving
- ✅ QuizPlayer shows one question at a time
- ✅ QuizResults shows score and correct answers
- ✅ Loading state shows during AI generation

### Files Created
```
components/
└── quiz/
    ├── QuizEditor.tsx
    ├── QuizPlayer.tsx
    └── QuizResults.tsx
```

### Implementation Notes

**components/quiz/QuizEditor.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { generateQuizFromLesson, saveQuiz } from '@/actions/quiz.actions';
import type { QuizQuestion } from '@/lib/groq';

interface QuizEditorProps {
  lessonId: string;
  onSaved?: () => void;
}

export function QuizEditor({ lessonId, onSaved }: QuizEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [source, setSource] = useState<string>('');
  const { toast } = useToast();

  async function handleGenerate() {
    setIsGenerating(true);

    const result = await generateQuizFromLesson(lessonId);

    setIsGenerating(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
      return;
    }

    setQuestions(result.questions!);
    setSource(result.source!);

    toast({
      title: 'Quiz Generated',
      description: `Generated from ${result.source === 'transcript' ? 'video transcript' : 'lesson content'}`,
    });
  }

  async function handleSave() {
    setIsSaving(true);

    const result = await saveQuiz(lessonId, questions);

    setIsSaving(false);

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
      description: 'Quiz saved successfully',
    });

    onSaved?.();
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

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">
            Generate a quiz from this lesson's content using AI
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Review & Edit Quiz</h3>
              <p className="text-sm text-gray-600">
                Generated from {source === 'transcript' ? 'video transcript' : 'lesson content'}
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                Regenerate
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Quiz'}
              </Button>
            </div>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Question {qIndex + 1}
                  </label>
                  <Input
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'question', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={q.correctIndex === oIndex}
                        onChange={() =>
                          updateQuestion(qIndex, 'correctIndex', oIndex)
                        }
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
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
```

**components/quiz/QuizPlayer.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { submitQuizAttempt } from '@/actions/quiz.actions';
import { QuizResults } from './QuizResults';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizPlayerProps {
  quizId: string;
  questions: Question[];
}

export function QuizPlayer({ quizId, questions }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = answers.every((a) => a !== -1);

  function handleAnswer(optionIndex: number) {
    const updated = [...answers];
    updated[currentIndex] = optionIndex;
    setAnswers(updated);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    const submitResult = await submitQuizAttempt(quizId, answers);

    setIsSubmitting(false);

    if (submitResult.error) {
      alert(submitResult.error);
      return;
    }

    setResult({
      score: submitResult.score!,
      total: submitResult.total!,
    });
  }

  if (result) {
    return (
      <QuizResults
        score={result.score}
        total={result.total}
        questions={questions}
        userAnswers={answers}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Question {currentIndex + 1} of {questions.length}
        </h3>
        <div className="text-sm text-gray-600">
          {answers.filter((a) => a !== -1).length} answered
        </div>
      </div>

      <Card className="p-6">
        <h4 className="text-xl font-medium mb-6">{currentQuestion.text}</h4>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                answers[currentIndex] === index
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
    </div>
  );
}
```

---

## Phase 5: Testing & Verification (3 hours)

### Tasks
- [ ] Test transcript extraction from YouTube video
- [ ] Test quiz generation with Groq
- [ ] Test quiz editor (review and edit)
- [ ] Test quiz player (learner attempt)
- [ ] Test score calculation
- [ ] Test fallback to lesson body
- [ ] Test error handling (no transcript, API failure)

### Acceptance Criteria
- ✅ Transcript extracts correctly from YouTube
- ✅ Groq generates 5 valid MCQs
- ✅ Educator can edit questions before saving
- ✅ Learner can attempt quiz and see score
- ✅ Fallback works when transcript unavailable
- ✅ Error messages are clear and helpful

### Test Checklist
```
Manual Testing:
□ Generate quiz from lesson with YouTube video → transcript extracted
□ Review generated questions → all valid
□ Edit question text → changes persist
□ Change correct answer → updates correctly
□ Save quiz → saved to database
□ Attempt quiz as learner → all questions render
□ Submit quiz → score calculated correctly
□ Try lesson without video → falls back to body
□ Try video with disabled captions → shows error
□ Check Prisma Studio → Quiz and Question records created
```

---

## Sprint 4 Completion Checklist

- [ ] YouTube transcript extraction working
- [ ] Groq integration generating valid quizzes
- [ ] Quiz editor for educator review
- [ ] Quiz player for learner attempts
- [ ] Score calculation and display
- [ ] Fallback to lesson body implemented
- [ ] Error handling for all edge cases
- [ ] All manual tests passing
- [ ] Code committed to Git

---

**Next Sprint:** Sprint 5 — Testing & Polish
