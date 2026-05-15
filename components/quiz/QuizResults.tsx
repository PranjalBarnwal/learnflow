'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizResultsProps {
  score: number;
  total: number;
  questions: Question[];
  userAnswers: number[];
  onRetry?: () => void;
}

export function QuizResults({
  score,
  total,
  questions,
  userAnswers,
  onRetry,
}: QuizResultsProps) {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 70;

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className={passed ? 'border-green-500' : 'border-orange-500'}>
        <CardContent className="pt-6 pb-6">
          <div className="text-center space-y-4">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                passed ? 'bg-green-100' : 'bg-orange-100'
              }`}
            >
              <Trophy
                className={`h-10 w-10 ${
                  passed ? 'text-green-600' : 'text-orange-600'
                }`}
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {score} / {total}
              </h2>
              <p className="text-xl text-gray-600">{percentage}% Score</p>
            </div>
            <div>
              {passed ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Great job! You passed!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Keep practicing!</span>
                </div>
              )}
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Review Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, qIndex) => {
            const userAnswer = userAnswers[qIndex];
            const isCorrect = userAnswer === question.correctIndex;

            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">
                      Question {qIndex + 1}: {question.text}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2 ml-9">
                  {question.options.map((option, oIndex) => {
                    const isUserAnswer = userAnswer === oIndex;
                    const isCorrectAnswer = question.correctIndex === oIndex;

                    return (
                      <div
                        key={oIndex}
                        className={`p-3 rounded-lg ${
                          isCorrectAnswer
                            ? 'bg-green-100 border-2 border-green-500'
                            : isUserAnswer
                            ? 'bg-red-100 border-2 border-red-500'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + oIndex)}.
                          </span>
                          <span className="flex-1">{option}</span>
                          {isCorrectAnswer && (
                            <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                              Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{total - score}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
