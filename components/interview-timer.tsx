'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface InterviewTimerProps {
    duration: number; // in seconds
    onComplete: () => void;
    className?: string;
}

export function InterviewTimer({ duration, onComplete, className = '' }: InterviewTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [isRunning, setIsRunning] = useState(true);

    const formatTime = useCallback((seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const getTimerColor = useCallback((remaining: number, total: number) => {
        const percentage = (remaining / total) * 100;
        if (percentage > 50) return 'default';
        if (percentage > 20) return 'secondary';
        return 'destructive';
    }, []);

    useEffect(() => {
        if (!isRunning || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    setIsRunning(false);
                    onComplete();
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, timeRemaining, onComplete]);

    // Reset timer when duration changes
    useEffect(() => {
        setTimeRemaining(duration);
        setIsRunning(true);
    }, [duration]);

    const isLowTime = timeRemaining <= 300; // Less than 5 minutes
    const isVeryLowTime = timeRemaining <= 60; // Less than 1 minute

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Clock className={`h-4 w-4 ${
                isVeryLowTime ? 'text-red-600 animate-pulse' :
                isLowTime ? 'text-orange-600' :
                'text-gray-600'
            }`} />
            <Badge
                variant={getTimerColor(timeRemaining, duration) as any}
                className={`font-mono ${
                    isVeryLowTime ? 'animate-pulse border-red-600 text-red-600' :
                    isLowTime ? 'border-orange-600 text-orange-600' :
                    ''
                }`}
            >
                {formatTime(timeRemaining)}
            </Badge>
            {isLowTime && (
                <span className={`text-xs font-medium ${
                    isVeryLowTime ? 'text-red-600' : 'text-orange-600'
                }`}>
                    {isVeryLowTime ? 'Time\'s almost up!' : 'Low on time'}
                </span>
            )}
        </div>
    );
}