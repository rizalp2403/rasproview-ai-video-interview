'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { List, Check, RotateCcw, Info } from 'lucide-react';

interface MultipleChoiceQuestionProps {
    question: {
        id: string;
        type: string;
        questionText: string;
        description?: string;
        helpText?: string;
        options: string[];
        maxRetries: number;
        isRequired: boolean;
    };
    onResponse: (selectedOptions: string[]) => void;
    existingResponse?: {
        selectedOptions?: string[];
        attemptNumber: number;
        duration: number;
    };
}

export function MultipleChoiceQuestion({ question, onResponse, existingResponse }: MultipleChoiceQuestionProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>(
        existingResponse?.selectedOptions || []
    );
    const [isSubmitted, setIsSubmitted] = useState(!!existingResponse?.selectedOptions?.length);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine if it's single or multiple choice based on question content
    const isSingleChoice = question.questionText.toLowerCase().includes('which one') ||
                          question.questionText.toLowerCase().includes('select one') ||
                          question.questionText.toLowerCase().includes('choose the best') ||
                          !question.questionText.toLowerCase().includes('select all');

    const handleOptionChange = (option: string, checked: boolean) => {
        if (isSingleChoice) {
            // For single choice, replace the selection
            setSelectedOptions(checked ? [option] : []);
        } else {
            // For multiple choice, add/remove from selection
            if (checked) {
                setSelectedOptions(prev => [...prev, option]);
            } else {
                setSelectedOptions(prev => prev.filter(opt => opt !== option));
            }
        }
        setIsSubmitted(false);
    };

    const handleSubmit = async () => {
        if (selectedOptions.length === 0) {
            alert('Please select at least one option.');
            return;
        }

        if (isSingleChoice && selectedOptions.length > 1) {
            alert('Please select only one option for this question.');
            return;
        }

        try {
            setIsSubmitting(true);
            await onResponse(selectedOptions);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Failed to save response:', error);
            alert('Failed to save response. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setSelectedOptions([]);
        setIsSubmitted(false);
    };

    const handleRetake = () => {
        setSelectedOptions([]);
        setIsSubmitted(false);
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* Question Type */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">
                                {isSingleChoice ? 'Single Choice' : 'Multiple Choice'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {existingResponse && (
                                <Badge variant="outline" className="gap-1">
                                    Attempt {existingResponse.attemptNumber}
                                </Badge>
                            )}
                            {isSubmitted && (
                                <Badge variant="default" className="gap-1">
                                    <Check className="h-3 w-3" />
                                    Answered
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            {isSingleChoice
                                ? 'Select the best answer from the options provided below.'
                                : 'Select all that apply from the options provided below.'}
                            {question.isRequired && (
                                <span className="font-medium text-orange-600"> This question is required.</span>
                            )}
                        </AlertDescription>
                    </Alert>

                    {/* Options */}
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const optionLetter = String.fromCharCode(65 + index); // A, B, C, etc.
                            const isSelected = selectedOptions.includes(option);

                            if (isSingleChoice) {
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        } ${isSubmitted ? 'pointer-events-none opacity-75' : ''}`}
                                        onClick={() => !isSubmitted && handleOptionChange(option, !isSelected)}
                                    >
                                        <RadioGroup
                                            value={selectedOptions[0] || ''}
                                            onValueChange={(value) => !isSubmitted && handleOptionChange(value, true)}
                                            disabled={isSubmitted}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <RadioGroupItem value={option} id={`option-${index}`} />
                                                <Label
                                                    htmlFor={`option-${index}`}
                                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                                >
                                                    <div className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-white border rounded">
                                                        {optionLetter}
                                                    </div>
                                                    <span className="flex-1">{option}</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        } ${isSubmitted ? 'pointer-events-none opacity-75' : ''}`}
                                        onClick={() => !isSubmitted && handleOptionChange(option, !isSelected)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`option-${index}`}
                                                checked={isSelected}
                                                onCheckedChange={(checked) =>
                                                    !isSubmitted && handleOptionChange(option, checked as boolean)
                                                }
                                                disabled={isSubmitted}
                                            />
                                            <Label
                                                htmlFor={`option-${index}`}
                                                className="flex items-center gap-3 cursor-pointer flex-1"
                                            >
                                                <div className="flex items-center justify-center w-8 h-8 text-sm font-medium bg-white border rounded">
                                                    {optionLetter}
                                                </div>
                                                <span className="flex-1">{option}</span>
                                            </Label>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {/* Selection Summary */}
                    {selectedOptions.length > 0 && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-sm">
                                <span className="font-medium text-purple-900">
                                    {isSingleChoice ? 'Selected:' : 'Selected options:'}
                                </span>
                                <ul className="mt-1 space-y-1 text-purple-800">
                                    {selectedOptions.map((option, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {selectedOptions.length > 0 && (
                                <span>
                                    {selectedOptions.length} of {question.options.length} selected
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {!isSubmitted && selectedOptions.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleClear}
                                    disabled={isSubmitting}
                                >
                                    Clear Selection
                                </Button>
                            )}
                            {existingResponse && (
                                <Button
                                    variant="outline"
                                    onClick={handleRetake}
                                    disabled={isSubmitting}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Retake
                                </Button>
                            )}
                            <Button
                                onClick={handleSubmit}
                                disabled={selectedOptions.length === 0 || isSubmitting || isSubmitted}
                            >
                                {isSubmitting ? (
                                    'Submitting...'
                                ) : isSubmitted ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Submitted
                                    </>
                                ) : (
                                    'Submit Answer'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Help Text */}
                    {question.helpText && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Hint:</strong> {question.helpText}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}