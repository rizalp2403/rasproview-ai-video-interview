'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Save, RotateCcw, Check } from 'lucide-react';

interface TextResponseQuestionProps {
    question: {
        id: string;
        type: string;
        questionText: string;
        description?: string;
        helpText?: string;
        maxRetries: number;
        isRequired: boolean;
    };
    onResponse: (text: string) => void;
    existingResponse?: {
        textAnswer?: string;
        attemptNumber: number;
        duration: number;
    };
}

export function TextResponseQuestion({ question, onResponse, existingResponse }: TextResponseQuestionProps) {
    const [text, setText] = useState(existingResponse?.textAnswer || '');
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [isCompleted, setIsCompleted] = useState(!!existingResponse?.textAnswer);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-save functionality
    useEffect(() => {
        const timer = setTimeout(() => {
            if (hasUnsavedChanges && text.trim()) {
                handleAutoSave();
            }
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(timer);
    }, [text, hasUnsavedChanges]);

    // Word count
    useEffect(() => {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(words);
    }, [text]);

    const handleAutoSave = async () => {
        if (!text.trim()) return;

        try {
            setIsSaving(true);
            // Note: In a real implementation, you might want to debouce this
            // and show a visual indicator for auto-save
            console.log('Auto-saving text response...');
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
            setHasUnsavedChanges(false);
        }
    };

    const handleSave = async () => {
        if (!text.trim()) {
            alert('Please enter your response before saving.');
            return;
        }

        try {
            setIsSaving(true);
            await onResponse(text);
            setIsCompleted(true);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to save response:', error);
            alert('Failed to save response. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRetype = () => {
        setText('');
        setIsCompleted(false);
        setHasUnsavedChanges(true);
        textareaRef.current?.focus();
    };

    const getMinWords = () => {
        // Set minimum word requirements based on question type or content
        if (question.questionText.toLowerCase().includes('describe') ||
            question.questionText.toLowerCase().includes('explain')) {
            return 50;
        }
        return 25; // Default minimum
    };

    const minWords = getMinWords();
    const meetsMinimum = wordCount >= minWords;

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Response Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Text Response</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {existingResponse && (
                                <Badge variant="outline" className="gap-1">
                                    Attempt {existingResponse.attemptNumber}
                                </Badge>
                            )}
                            {isCompleted && (
                                <Badge variant="default" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    Saved
                                </Badge>
                            )}
                            {hasUnsavedChanges && (
                                <Badge variant="secondary" className="gap-1">
                                    Draft
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                            Type your response below. Be thorough and specific in your answer.
                            {minWords > 0 && (
                                <span className="font-medium"> Minimum {minWords} words recommended.</span>
                            )}
                        </AlertDescription>
                    </Alert>

                    {/* Text Input Area */}
                    <div className="space-y-2">
                        <Textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setHasUnsavedChanges(true);
                                setIsCompleted(false);
                            }}
                            placeholder="Type your response here..."
                            className="min-h-[200px] resize-none"
                            disabled={isCompleted && !hasUnsavedChanges}
                        />

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600">
                                    Words: <span className={meetsMinimum ? 'font-medium text-green-600' : 'font-medium'}>
                                        {wordCount}
                                    </span>
                                </span>
                                {text.length > 0 && !meetsMinimum && (
                                    <span className="text-orange-600">
                                        Add at least {minWords - wordCount} more words
                                    </span>
                                )}
                            </div>
                            {hasUnsavedChanges && (
                                <span className="text-blue-600 flex items-center gap-1">
                                    {isSaving ? (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                    ) : (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                    )}
                                    {isSaving ? 'Saving...' : 'Unsaved'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {question.isRequired && (
                                <span className="text-orange-600 font-medium">This question is required</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {existingResponse && (
                                <Button
                                    variant="outline"
                                    onClick={handleRetype}
                                    disabled={isSaving}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Clear & Retype
                                </Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={!text.trim() || isSaving || (!meetsMinimum && question.isRequired)}
                            >
                                {isSaving ? (
                                    'Saving...'
                                ) : isCompleted ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Saved
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Response
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Tips for a great response:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Be specific and provide examples from your experience</li>
                            <li>• Structure your answer with clear points</li>
                            <li>• Address all parts of the question</li>
                            <li>• Review your response for clarity and completeness</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}