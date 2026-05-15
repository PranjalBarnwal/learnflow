'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface QuizAttempt {
  id: string;
  score: number;
  attemptedAt: Date;
}

interface QuizHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: QuizAttempt[];
  totalQuestions: number;
  onViewDetails: (attemptId: string) => void;
  onTakeNew: () => void;
}

export function QuizHistoryModal({
  isOpen,
  onClose,
  attempts,
  totalQuestions,
  onViewDetails,
  onTakeNew,
}: QuizHistoryModalProps) {
  const bestScore = Math.max(...attempts.map((a) => a.score));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quiz Attempt History</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {attempts.map((attempt, index) => {
            const percentage = Math.round((attempt.score / totalQuestions) * 100);
            const isBest = attempt.score === bestScore;

            return (
              <Card
                key={attempt.id}
                className={`p-4 ${isBest ? 'border-yellow-400 bg-yellow-50/50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        Attempt #{attempts.length - index}
                      </h3>
                      {isBest && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          <Trophy className="h-3 w-3" />
                          Best Score
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(attempt.attemptedAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span>
                        {formatDistanceToNow(new Date(attempt.attemptedAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {attempt.score}/{totalQuestions}
                        </span>
                        <span className="text-lg text-gray-600">({percentage}%)</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => onViewDetails(attempt.id)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-4 border-t mt-6">
          <Button onClick={onTakeNew} size="lg" className="w-full sm:w-auto">
            Take New Attempt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
