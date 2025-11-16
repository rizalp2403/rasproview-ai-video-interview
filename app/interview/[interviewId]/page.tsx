'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { VideoRecorder } from '@/components/video-recorder';
import { QuestionCard } from '@/components/question-card';
import { InterviewTimer } from '@/components/interview-timer';
import { InterviewProgress } from '@/components/interview-progress';
import { ErrorBoundary } from '@/components/error-boundary';
import {
    Play,
    Pause,
    RotateCcw,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    Clock,
    Video,
    VideoOff,
    Mic,
    MicOff,
    Check,
    X,
} from 'lucide-react';

interface Interview {
    id: string;
    title: string;
    description?: string;
    company: {
        name: string;
        logo?: string;
    };
    welcomeMessage: string;
    thankYouMessage: string;
    duration: number;
    allowRetake: boolean;
    showQuestions: boolean;
    maxAttemptCount: number;
    questions: Array<{
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
    }>;
}

interface InterviewState {
    currentQuestionIndex: number;
    isStarted: boolean;
    isCompleted: boolean;
    submissionId?: string;
    responses: Array<{
        questionId: string;
        videoUrl?: string;
        textAnswer?: string;
        selectedOptions?: string[];
        attemptNumber: number;
        duration: number;
    }>;
    timeRemaining: number;
}

export default function InterviewPage() {
    const params = useParams();
    const router = useRouter();
    const interviewId = params.interviewId as string;

    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentState, setCurrentState] = useState<InterviewState>({
        currentQuestionIndex: 0,
        isStarted: false,
        isCompleted: false,
        responses: [],
        timeRemaining: 0,
    });
    const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [micPermission, setMicPermission] = useState<boolean | null>(null);

    // Load interview data
    useEffect(() => {
        const loadInterview = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/interviews/public/${interviewId}`);

                if (!response.ok) {
                    throw new Error('Interview not found');
                }

                const data = await response.json();
                setInterview(data.data);

                // Calculate total time
                const totalDuration = data.data.questions.reduce((total: number, q: any) =>
                    total + (q.maxDuration || 120) + (q.prepTime || 30), 0
                );

                setCurrentState(prev => ({
                    ...prev,
                    timeRemaining: totalDuration,
                }));

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load interview');
            } finally {
                setLoading(false);
            }
        };

        if (interviewId) {
            loadInterview();
        }
    }, [interviewId]);

    // Check permissions
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                // Check camera permission
                const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraStream.getTracks().forEach(track => track.stop());
                setCameraPermission(true);

                // Check microphone permission
                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStream.getTracks().forEach(track => track.stop());
                setMicPermission(true);
            } catch (err) {
                console.error('Permission check failed:', err);
                if (err instanceof Error) {
                    if (err.name === 'NotAllowedError') {
                        if (err.message.includes('video')) {
                            setCameraPermission(false);
                        } else if (err.message.includes('audio')) {
                            setMicPermission(false);
                        }
                    }
                }
            }
        };

        checkPermissions();
    }, []);

    const startInterview = useCallback(async () => {
        if (!interview) return;

        try {
            // Create submission
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interviewId,
                    totalQuestions: interview.questions.length,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start interview');
            }

            const data = await response.json();

            setCurrentState(prev => ({
                ...prev,
                isStarted: true,
                submissionId: data.data.id,
            }));

            setShowWelcomeDialog(false);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start interview');
        }
    }, [interview, interviewId]);

    const handleVideoResponse = useCallback(async (videoBlob: Blob, duration: number) => {
        if (!interview || !currentState.submissionId) return;

        const currentQuestion = interview.questions[currentState.currentQuestionIndex];

        try {
            // Upload video
            const formData = new FormData();
            formData.append('video', videoBlob);
            formData.append('submissionId', currentState.submissionId);
            formData.append('questionId', currentQuestion.id);
            formData.append('duration', duration.toString());

            const uploadResponse = await fetch('/api/upload/video', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload video');
            }

            const uploadData = await uploadResponse.json();

            // Save response
            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submissionId: currentState.submissionId,
                    questionId: currentQuestion.id,
                    videoUrl: uploadData.url,
                    duration,
                    attemptNumber: currentState.responses.filter(r => r.questionId === currentQuestion.id).length + 1,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save response');
            }

            const responseData = await response.json();

            setCurrentState(prev => ({
                ...prev,
                responses: [
                    ...prev.responses.filter(r => r.questionId !== currentQuestion.id),
                    {
                        questionId: currentQuestion.id,
                        videoUrl: uploadData.url,
                        duration,
                        attemptNumber: responseData.data.attemptNumber,
                    },
                ],
            }));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save response');
        }
    }, [interview, currentState.currentQuestionIndex, currentState.responses, currentState.submissionId]);

    const handleTextResponse = useCallback(async (text: string) => {
        if (!interview || !currentState.submissionId) return;

        const currentQuestion = interview.questions[currentState.currentQuestionIndex];

        try {
            // Save text response
            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submissionId: currentState.submissionId,
                    questionId: currentQuestion.id,
                    textAnswer: text,
                    attemptNumber: currentState.responses.filter(r => r.questionId === currentQuestion.id).length + 1,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save response');
            }

            const responseData = await response.json();

            setCurrentState(prev => ({
                ...prev,
                responses: [
                    ...prev.responses.filter(r => r.questionId !== currentQuestion.id),
                    {
                        questionId: currentQuestion.id,
                        textAnswer: text,
                        attemptNumber: responseData.data.attemptNumber,
                        duration: 0,
                    },
                ],
            }));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save response');
        }
    }, [interview, currentState.currentQuestionIndex, currentState.responses, currentState.submissionId]);

    const handleMultipleChoiceResponse = useCallback(async (selectedOptions: string[]) => {
        if (!interview || !currentState.submissionId) return;

        const currentQuestion = interview.questions[currentState.currentQuestionIndex];

        try {
            // Save multiple choice response
            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submissionId: currentState.submissionId,
                    questionId: currentQuestion.id,
                    selectedOptions,
                    attemptNumber: currentState.responses.filter(r => r.questionId === currentQuestion.id).length + 1,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save response');
            }

            const responseData = await response.json();

            setCurrentState(prev => ({
                ...prev,
                responses: [
                    ...prev.responses.filter(r => r.questionId !== currentQuestion.id),
                    {
                        questionId: currentQuestion.id,
                        selectedOptions,
                        attemptNumber: responseData.data.attemptNumber,
                        duration: 0,
                    },
                ],
            }));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save response');
        }
    }, [interview, currentState.currentQuestionIndex, currentState.responses, currentState.submissionId]);

    const nextQuestion = useCallback(() => {
        if (!interview) return;

        const nextIndex = currentState.currentQuestionIndex + 1;

        if (nextIndex >= interview.questions.length) {
            // Complete interview
            completeInterview();
        } else {
            setCurrentState(prev => ({
                ...prev,
                currentQuestionIndex: nextIndex,
            }));
        }
    }, [interview, currentState.currentQuestionIndex]);

    const previousQuestion = useCallback(() => {
        if (currentState.currentQuestionIndex > 0) {
            setCurrentState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex - 1,
            }));
        }
    }, [currentState.currentQuestionIndex]);

    const completeInterview = useCallback(async () => {
        if (!currentState.submissionId) return;

        try {
            const response = await fetch(`/api/submissions/${currentState.submissionId}/complete`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to complete interview');
            }

            setCurrentState(prev => ({
                ...prev,
                isCompleted: true,
            }));

            setShowCompletionDialog(true);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete interview');
        }
    }, [currentState.submissionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading interview...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => router.push('/')} className="w-full">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Interview Not Found</CardTitle>
                        <CardDescription>The interview you're looking for doesn't exist or has been removed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/')} className="w-full">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (cameraPermission === false || micPermission === false) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                            Permissions Required
                        </CardTitle>
                        <CardDescription>
                            This interview requires camera and microphone access to record video responses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            {cameraPermission === false ? (
                                <>
                                    <VideoOff className="h-4 w-4 text-red-500" />
                                    <span className="text-sm">Camera access denied</span>
                                </>
                            ) : (
                                <>
                                    <Video className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Camera access granted</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {micPermission === false ? (
                                <>
                                    <MicOff className="h-4 w-4 text-red-500" />
                                    <span className="text-sm">Microphone access denied</span>
                                </>
                            ) : (
                                <>
                                    <Mic className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Microphone access granted</span>
                                </>
                            )}
                        </div>
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Please enable camera and microphone permissions in your browser settings and refresh the page.
                            </AlertDescription>
                        </Alert>
                        <Button onClick={() => window.location.reload()} className="w-full">
                            Reload Page
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = interview.questions[currentState.currentQuestionIndex];
    const progress = ((currentState.currentQuestionIndex + 1) / interview.questions.length) * 100;
    const currentResponse = currentState.responses.find(r => r.questionId === currentQuestion.id);

    if (currentState.isCompleted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-green-600">Interview Completed!</CardTitle>
                        <CardDescription>
                            Thank you for completing the interview. Your responses have been saved.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-gray-600">
                            <p>{interview.thankYouMessage}</p>
                        </div>
                        <Button onClick={() => router.push('/')} className="w-full">
                            Return to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{interview.title}</h1>
                                <p className="text-sm text-gray-600">{interview.company.name}</p>
                            </div>
                            {currentState.isStarted && (
                                <InterviewTimer
                                    duration={currentState.timeRemaining}
                                    onComplete={completeInterview}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {currentState.isStarted && (
                    <div className="bg-white border-b">
                        <div className="max-w-6xl mx-auto px-4 py-3">
                            <InterviewProgress
                                current={currentState.currentQuestionIndex + 1}
                                total={interview.questions.length}
                                progress={progress}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {!currentState.isStarted ? (
                        <WelcomeDialog
                            interview={interview}
                            onStart={startInterview}
                            open={showWelcomeDialog}
                            onOpenChange={setShowWelcomeDialog}
                        />
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Question Area */}
                            <div className="lg:col-span-2">
                                <QuestionCard
                                    question={currentQuestion}
                                    showQuestion={interview.showQuestions}
                                    questionNumber={currentState.currentQuestionIndex + 1}
                                    totalQuestions={interview.questions.length}
                                >
                                    {currentQuestion.type === 'video' ? (
                                        <VideoRecorder
                                            maxDuration={currentQuestion.maxDuration || 120}
                                            prepTime={currentQuestion.prepTime || 30}
                                            maxRetries={currentQuestion.maxRetries}
                                            allowRetake={interview.allowRetake}
                                            onRecordingComplete={handleVideoResponse}
                                            existingResponse={currentResponse}
                                        />
                                    ) : currentQuestion.type === 'text' ? (
                                        <TextResponseQuestion
                                            question={currentQuestion}
                                            onResponse={handleTextResponse}
                                            existingResponse={currentResponse}
                                        />
                                    ) : (
                                        <MultipleChoiceQuestion
                                            question={currentQuestion}
                                            onResponse={handleMultipleChoiceResponse}
                                            existingResponse={currentResponse}
                                        />
                                    )}
                                </QuestionCard>

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={previousQuestion}
                                        disabled={currentState.currentQuestionIndex === 0}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        {currentResponse && (
                                            <Badge variant="default" className="gap-1">
                                                <Check className="h-3 w-3" />
                                                Answered
                                            </Badge>
                                        )}
                                        {currentQuestion.isRequired && !currentResponse && (
                                            <Badge variant="destructive" className="gap-1">
                                                <X className="h-3 w-3" />
                                                Required
                                            </Badge>
                                        )}
                                    </div>

                                    <Button
                                        onClick={nextQuestion}
                                        disabled={currentQuestion.isRequired && !currentResponse}
                                    >
                                        {currentState.currentQuestionIndex === interview.questions.length - 1
                                            ? 'Complete Interview'
                                            : 'Next'
                                        }
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Interview Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Questions</h4>
                                            <div className="space-y-2">
                                                {interview.questions.map((q, index) => {
                                                    const hasResponse = currentState.responses.find(r => r.questionId === q.id);
                                                    return (
                                                        <div
                                                            key={q.id}
                                                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                                                                index === currentState.currentQuestionIndex
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-gray-200'
                                                            }`}
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                hasResponse ? 'bg-green-500' : 'bg-gray-300'
                                                            }`} />
                                                            <span className="text-sm">Question {index + 1}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {q.type}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h4 className="font-medium mb-2">Settings</h4>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Max retries: {interview.maxAttemptCount}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Video className="h-4 w-4" />
                                                    Camera & mic required
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Help</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-gray-600 space-y-2">
                                            <p>• Ensure you're in a quiet, well-lit environment</p>
                                            <p>• Test your camera and microphone before starting</p>
                                            <p>• Speak clearly and look at the camera</p>
                                            <p>• Take your time to think before answering</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}

// Helper components
interface WelcomeDialogProps {
    interview: Interview;
    onStart: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function WelcomeDialog({ interview, onStart, open, onOpenChange }: WelcomeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Welcome to {interview.company.name}</DialogTitle>
                    <DialogDescription>
                        You're about to start the interview for <strong>{interview.title}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">What to Expect:</h4>
                        <ul className="text-sm space-y-1 text-gray-700">
                            <li>• {interview.questions.length} questions total</li>
                            <li>• Estimated duration: {interview.duration} minutes</li>
                            <li>• Video responses for technical questions</li>
                            <li>• You can retry answers up to {interview.maxAttemptCount} times</li>
                        </ul>
                    </div>

                    <div className="text-sm text-gray-600">
                        <p className="mb-2">{interview.welcomeMessage}</p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-orange-800">Before You Start:</h4>
                        <ul className="text-sm space-y-1 text-orange-700">
                            <li>• Make sure your camera and microphone are working</li>
                            <li>• Find a quiet, well-lit environment</li>
                            <li>• Ensure stable internet connection</li>
                            <li>• Close other applications that might use camera/mic</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onStart} className="w-full">
                        Start Interview
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}