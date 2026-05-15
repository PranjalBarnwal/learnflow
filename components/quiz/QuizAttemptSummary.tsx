'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QuizAttempt {
  id: string;
  score: number;
  attemptedAt: Date;
}

interface QuizAttemptSummaryProps {
  attempts: QuizAttempt[];
  totalQuestions: number;
  onRetake: () => void;
  onViewHistory: () => void;
}

export function QuizAttemptSummary({
  attempts,
  totalQuestions,
  onRetake,
  onViewHistory,
}: QuizAttemptSummaryProps) {
  if (attempts.length === 0) {
    return null;
  }

  const latestAttempt = attempts[0];
  const bestScore = Math.max(...attempts.map((a) => a.score));
  const latestPercentage = Math.round((latestAttempt.score / totalQuestions) * 100);
  const bestPercentage = Math.round((bestScore / totalQuestions) * 100);

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Quiz Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latest Score */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Latest Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {latestAttempt.score}/{totalQuestions}
              </p>
              <p className="text-sm text-gray-500">{latestPercentage}%</p>
            </div>
          </div>

          {/* Best Score */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {bestScore}/{totalQuestions}
              </p>
              <p className="text-sm text-gray-500">{bestPercentage}%</p>
            </div>
          </div>

          {/* Total Attempts */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
              <p className="text-sm text-gray-500">
                Last: {formatDistanceToNow(new Date(latestAttempt.attemptedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={onRetake} size="lg">
            Retake Quiz
          </Button>
          <Button onClick={onViewHistory} variant="outline" size="lg">
            View History ({attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
