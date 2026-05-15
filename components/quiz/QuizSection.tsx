'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizPlayer } from './QuizPlayer';
import { QuizAttemptSummary } from './QuizAttemptSummary';
import { QuizHistoryModal } from './QuizHistoryModal';
import { QuizDetailedResults } from './QuizDetailedResults';
import { getUserQuizAttempts, getQuizAttemptDetails } from '@/actions/quiz.actions';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizAttempt {
  id: string;
  score: number;
  answers: number[];
  attemptedAt: Date;
}

interface QuizSectionProps {
  quizId: string;
  questions: Question[];
}

type ViewMode = 'summary' | 'taking' | 'history' | 'details';

export function QuizSection({ quizId, questions }: QuizSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<{
    score: number;
    answers: number[];
    attemptedAt: Date;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, [quizId]);

  async function loadAttempts() {
    setIsLoading(true);
    const result = await getUserQuizAttempts(quizId);
    
    if (result.success && result.attempts) {
      setAttempts(result.attempts as QuizAttempt[]);
      
      // If no attempts, show the quiz player directly
      if (result.attempts.length === 0) {
        setViewMode('taking');
      }
    } else if (result.error) {
      toast.error('Failed to load quiz history');
    }
    
    setIsLoading(false);
  }

  async function handleViewDetails(attemptId: string) {
    const result = await getQuizAttemptDetails(attemptId);
    
    if (result.success && result.attempt) {
      setSelectedAttempt({
        score: result.attempt.score,
        answers: result.attempt.answers,
        attemptedAt: result.attempt.attemptedAt,
      });
      setViewMode('details');
    } else {
      toast.error('Failed to load attempt details');
    }
  }

  function handleRetake() {
    setViewMode('taking');
    setSelectedAttempt(null);
  }

  function handleQuizComplete() {
    // Reload attempts after completing quiz
    loadAttempts();
    setViewMode('summary');
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Loading quiz...</p>
        </CardContent>
      </Card>
    );
  }

  // View: Taking Quiz
  if (viewMode === 'taking') {
    return (
      <div>
        {attempts.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setViewMode('summary')}
            className="mb-4"
          >
            ← Back to Summary
          </Button>
        )}
        <QuizPlayer 
          quizId={quizId} 
          questions={questions}
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }

  // View: Detailed Results
  if (viewMode === 'details' && selectedAttempt) {
    return (
      <QuizDetailedResults
        score={selectedAttempt.score}
        totalQuestions={questions.length}
        attemptedAt={selectedAttempt.attemptedAt}
        questions={questions}
        userAnswers={selectedAttempt.answers}
        onRetake={handleRetake}
        onBack={() => setViewMode('summary')}
      />
    );
  }

  // View: Summary (default)
  return (
    <div>
      {attempts.length === 0 ? (
        // First time taking quiz
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to test your knowledge?</h3>
            <p className="text-gray-600 mb-6">
              This quiz has {questions.length} questions. Take your time and good luck!
            </p>
            <Button onClick={handleRetake} size="lg">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Has previous attempts
        <>
          <QuizAttemptSummary
            attempts={attempts}
            totalQuestions={questions.length}
            onRetake={handleRetake}
            onViewHistory={() => setViewMode('history')}
          />

          <QuizHistoryModal
            isOpen={viewMode === 'history'}
            onClose={() => setViewMode('summary')}
            attempts={attempts}
            totalQuestions={questions.length}
            onViewDetails={handleViewDetails}
            onTakeNew={handleRetake}
          />
        </>
      )}
    </div>
  );
}
