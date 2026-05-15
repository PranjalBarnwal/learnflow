'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizDetailedResultsProps {
  score: number;
  totalQuestions: number;
  attemptedAt: Date;
  questions: Question[];
  userAnswers: number[];
  onRetake?: () => void;
  onBack?: () => void;
}

export function QuizDetailedResults({
  score,
  totalQuestions,
  attemptedAt,
  questions,
  userAnswers,
  onRetake,
  onBack,
}: QuizDetailedResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Quiz Results</CardTitle>
              <p className="text-sm text-gray-600">
                Attempted: {format(new Date(attemptedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-gray-900">
              {score}/{totalQuestions}
            </span>
            <span className="text-2xl text-gray-600">({percentage}%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Questions Breakdown */}
      <div className="space-y-4">
        {questions.map((question, qIndex) => {
          const userAnswer = userAnswers[qIndex];
          const isCorrect = userAnswer === question.correctIndex;

          return (
            <Card key={question.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-2">
                  <span className="text-gray-500 font-normal">Q{qIndex + 1}.</span>
                  <span className="flex-1">{question.text}</span>
                  {isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => {
                    const isUserAnswer = userAnswer === oIndex;
                    const isCorrectAnswer = question.correctIndex === oIndex;

                    let bgColor = 'bg-gray-50';
                    let borderColor = 'border-gray-200';
                    let textColor = 'text-gray-700';
                    let icon = null;

                    if (isCorrectAnswer) {
                      bgColor = 'bg-green-50';
                      borderColor = 'border-green-300';
                      textColor = 'text-green-900';
                      icon = (
                        <span className="text-green-600 font-semibold text-sm">
                          ✓ Correct Answer
                        </span>
                      );
                    }

                    if (isUserAnswer && !isCorrect) {
                      bgColor = 'bg-red-50';
                      borderColor = 'border-red-300';
                      textColor = 'text-red-900';
                      icon = (
                        <span className="text-red-600 font-semibold text-sm">
                          ✗ Your Answer
                        </span>
                      );
                    }

                    if (isUserAnswer && isCorrect) {
                      icon = (
                        <span className="text-green-600 font-semibold text-sm">
                          ✓ Your Answer (Correct)
                        </span>
                      );
                    }

                    return (
                      <div
                        key={oIndex}
                        className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} flex items-center justify-between`}
                      >
                        <span>{option}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Retake Button */}
      {onRetake && (
        <div className="flex justify-center pt-4">
          <Button onClick={onRetake} size="lg">
            Retake Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
