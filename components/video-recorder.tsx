'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Play,
    Pause,
    Square,
    RotateCcw,
    Check,
    X,
    Clock,
    AlertCircle,
} from 'lucide-react';

interface VideoRecorderProps {
    maxDuration: number;
    prepTime: number;
    maxRetries: number;
    allowRetake: boolean;
    onRecordingComplete: (videoBlob: Blob, duration: number) => void;
    existingResponse?: {
        videoUrl?: string;
        attemptNumber: number;
        duration: number;
    };
}

type RecordingState = 'idle' | 'preparing' | 'recording' | 'reviewing' | 'completed';

export function VideoRecorder({
    maxDuration,
    prepTime,
    maxRetries,
    allowRetake,
    onRecordingComplete,
    existingResponse,
}: VideoRecorderProps) {
    const [state, setState] = useState<RecordingState>(existingResponse ? 'reviewing' : 'idle');
    const [isRecording, setIsRecording] = useState(false);
    const [prepTimeRemaining, setPrepTimeRemaining] = useState(prepTime);
    const [recordedTime, setRecordedTime] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(existingResponse?.videoUrl || null);
    const [attemptCount, setAttemptCount] = useState(existingResponse?.attemptNumber || 0);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [showRecordingDialog, setShowRecordingDialog] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const prepTimerRef = useRef<NodeJS.Timeout | null>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recordedUrl) {
                URL.revokeObjectURL(recordedUrl);
            }
            if (timerRef.current) clearInterval(timerRef.current);
            if (prepTimerRef.current) clearInterval(prepTimerRef.current);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, [recordedUrl]);

    const startPreparing = useCallback(() => {
        setState('preparing');
        setPrepTimeRemaining(prepTime);
        setShowRecordingDialog(true);

        prepTimerRef.current = setInterval(() => {
            setPrepTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                    startRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [prepTime]);

    const startRecording = useCallback(() => {
        if (!webcamRef.current) return;

        try {
            const stream = webcamRef.current.stream;
            if (!stream) {
                throw new Error('Camera stream not available');
            }

            chunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp8,opus',
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                setRecordedBlob(blob);
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);
                setState('reviewing');
                setShowRecordingDialog(false);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            setState('recording');
            setRecordedTime(0);

            // Timer for recording duration
            recordingTimerRef.current = setInterval(() => {
                setRecordedTime((prev) => {
                    const newTime = prev + 1;
                    if (newTime >= maxDuration) {
                        stopRecording();
                        return maxDuration;
                    }
                    return newTime;
                });
            }, 1000);

        } catch (error) {
            console.error('Failed to start recording:', error);
            setCameraError('Failed to start recording. Please check camera permissions.');
            setState('idle');
        }
    }, [maxDuration]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    }, [isRecording]);

    const retakeRecording = useCallback(() => {
        if (recordedUrl) {
            URL.revokeObjectURL(recordedUrl);
        }
        setRecordedBlob(null);
        setRecordedUrl(null);
        setRecordedTime(0);
        setState('idle');

        if (attemptCount < maxRetries) {
            setAttemptCount(prev => prev + 1);
        }
    }, [recordedUrl, attemptCount, maxRetries]);

    const acceptRecording = useCallback(() => {
        if (recordedBlob) {
            setState('completed');
            onRecordingComplete(recordedBlob, recordedTime);
        }
    }, [recordedBlob, recordedTime, onRecordingComplete]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const canRetry = allowRetake && attemptCount < maxRetries;
    const progress = state === 'recording' ? (recordedTime / maxDuration) * 100 : 0;

    if (state === 'idle') {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                            {cameraEnabled ? (
                                <Webcam
                                    ref={webcamRef}
                                    audio={!isMuted}
                                    videoConstraints={{
                                        width: 1280,
                                        height: 720,
                                        facingMode: 'user',
                                    }}
                                    className="w-full h-full object-cover"
                                    onUserMediaError={(error) => {
                                        console.error('Camera error:', error);
                                        setCameraError('Camera access denied. Please check permissions.');
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <VideoOff className="h-16 w-16 text-gray-600" />
                                </div>
                            )}

                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setCameraEnabled(!cameraEnabled)}
                                >
                                    {cameraEnabled ? (
                                        <VideoOff className="h-4 w-4" />
                                    ) : (
                                        <Video className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsMuted(!isMuted)}
                                >
                                    {isMuted ? (
                                        <MicOff className="h-4 w-4" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {cameraError && (
                            <Alert className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{cameraError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                Click start to begin recording. You will have {prepTime} seconds to prepare,
                                then up to {formatTime(maxDuration)} to record your answer.
                            </p>
                            {attemptCount > 0 && (
                                <Badge variant="outline">
                                    Attempt {attemptCount} of {maxRetries}
                                </Badge>
                            )}
                        </div>

                        <Button
                            onClick={startPreparing}
                            disabled={!cameraEnabled}
                            size="lg"
                            className="w-full"
                        >
                            <Play className="mr-2 h-5 w-5" />
                            Start Recording
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (state === 'preparing') {
        return (
            <Dialog open={showRecordingDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Get Ready to Record</DialogTitle>
                        <DialogDescription>
                            You have {prepTimeRemaining} seconds to prepare before recording starts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="text-center space-y-6">
                        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                            <Webcam
                                ref={webcamRef}
                                audio={!isMuted}
                                mirrored={true}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-white mb-4">
                                        {prepTimeRemaining}
                                    </div>
                                    <p className="text-white text-lg">Get ready...</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            <p>• Speak clearly and look at the camera</p>
                            <p>• Make sure you're in a quiet environment</p>
                            <p>• Recording will start automatically</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (state === 'recording') {
        return (
            <Dialog open={showRecordingDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                            Recording...
                        </DialogTitle>
                        <DialogDescription>
                            Speak clearly and naturally. Recording will stop automatically at {formatTime(maxDuration)}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                            <Webcam
                                ref={webcamRef}
                                audio={!isMuted}
                                mirrored={true}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute top-4 right-4">
                                <Badge variant="destructive" className="animate-pulse">
                                    REC {formatTime(recordedTime)}
                                </Badge>
                            </div>
                        </div>

                        <Progress value={progress} className="w-full" />

                        <div className="flex items-center justify-center gap-4">
                            <Button
                                onClick={stopRecording}
                                size="lg"
                                variant="destructive"
                            >
                                <Square className="mr-2 h-5 w-5" />
                                Stop Recording
                            </Button>
                        </div>

                        <div className="text-sm text-gray-600 text-center">
                            Time remaining: {formatTime(maxDuration - recordedTime)}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (state === 'reviewing') {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Review Your Recording</h3>
                            <Badge variant="outline">
                                Duration: {formatTime(recordedTime)}
                            </Badge>
                        </div>

                        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                            {recordedUrl ? (
                                <video
                                    src={recordedUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                    onEnded={(e) => {
                                        const video = e.currentTarget;
                                        video.currentTime = 0;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <VideoOff className="h-16 w-16 text-gray-600" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {attemptCount > 0 && (
                                    <span>Attempt {attemptCount} of {maxRetries}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {canRetry && (
                                    <Button
                                        onClick={retakeRecording}
                                        variant="outline"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Retake
                                    </Button>
                                )}
                                <Button
                                    onClick={acceptRecording}
                                    disabled={!recordedUrl}
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Accept Recording
                                </Button>
                            </div>
                        </div>

                        {existingResponse && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    You have an existing response. You can either keep it or record a new one.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (state === 'completed') {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-green-600">Recording Saved</h3>
                            <p className="text-sm text-gray-600">
                                Duration: {formatTime(recordedTime)} • Attempt {attemptCount}
                            </p>
                        </div>
                        {recordedUrl && (
                            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden max-w-md mx-auto">
                                <video
                                    src={recordedUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}