'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, HelpCircle, FileText, List } from 'lucide-react';
import { ReactNode } from 'react';

interface QuestionCardProps {
    question: {
        id: string;
        type: 'video' | 'text' | 'multiple_choice';
        questionText: string;
        description?: string;
        helpText?: string;
        maxDuration?: number;
        prepTime?: number;
        maxRetries: number;
        isRequired: boolean;
        options?: string[];
    };
    showQuestion: boolean;
    questionNumber: number;
    totalQuestions: number;
    children: ReactNode;
}

export function QuestionCard({
    question,
    showQuestion,
    questionNumber,
    totalQuestions,
    children,
}: QuestionCardProps) {
    const getQuestionTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
            case 'text':
                return <FileText className="h-3 w-3" />;
            case 'multiple_choice':
                return <List className="h-3 w-3" />;
            default:
                return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
        }
    };

    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'video':
                return 'Video Response';
            case 'text':
                return 'Text Response';
            case 'multiple_choice':
                return 'Multiple Choice';
            default:
                return 'Unknown';
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="gap-1">
                                {getQuestionTypeIcon(question.type)}
                                {getQuestionTypeLabel(question.type)}
                            </Badge>
                            {question.isRequired && (
                                <Badge variant="destructive" className="text-xs">
                                    Required
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-xl">
                            {showQuestion ? question.questionText : 'Question ' + questionNumber}
                        </CardTitle>
                        {showQuestion && question.description && (
                            <CardDescription className="text-base">
                                {question.description}
                            </CardDescription>
                        )}
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-sm font-medium text-gray-600">
                            Question {questionNumber} of {totalQuestions}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Question Details */}
                {showQuestion && (
                    <div className="space-y-4">
                        {/* Question Settings */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {question.type === 'video' && question.maxDuration && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Max duration: {formatDuration(question.maxDuration)}
                                </div>
                            )}
                            {question.type === 'video' && question.prepTime && question.prepTime > 0 && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Prep time: {formatDuration(question.prepTime)}
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                Retries: {question.maxRetries}
                            </div>
                        </div>

                        {/* Help Text */}
                        {question.helpText && (
                            <Alert>
                                <HelpCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Tip:</strong> {question.helpText}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Multiple Choice Options */}
                        {question.type === 'multiple_choice' && question.options && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Options:</h4>
                                <ul className="space-y-2">
                                    {question.options.map((option, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                                        >
                                            <span className="flex items-center justify-center w-6 h-6 text-sm font-medium bg-white border rounded">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span>{option}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Response Area */}
                <div className="min-h-[400px]">
                    {children}
                </div>

                {/* Instructions based on question type */}
                {showQuestion && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            {question.type === 'video' && (
                                <>
                                    <li>• Click "Start Recording" when ready to begin</li>
                                    <li>• You'll have {question.prepTime || 30} seconds to prepare</li>
                                    <li>• Speak clearly and look at the camera</li>
                                    <li>• Your response is limited to {formatDuration(question.maxDuration || 120)}</li>
                                </>
                            )}
                            {question.type === 'text' && (
                                <>
                                    <li>• Type your response in the text area provided</li>
                                    <li>• Be thorough and specific in your answer</li>
                                    <li>• Take your time to organize your thoughts</li>
                                </>
                            )}
                            {question.type === 'multiple_choice' && (
                                <>
                                    <li>• Select the best answer from the options provided</li>
                                    <li>• Read each option carefully before choosing</li>
                                    <li>• Some questions may have multiple correct answers</li>
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}