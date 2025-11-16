'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface InterviewProgressProps {
    current: number;
    total: number;
    progress: number; // percentage
    className?: string;
}

export function InterviewProgress({ current, total, progress, className = '' }: InterviewProgressProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress</span>
                <Badge variant="outline">
                    Question {current} of {total}
                </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600">
                <span>{Math.round(progress)}% complete</span>
                <span>{total - current} remaining</span>
            </div>
        </div>
    );
}