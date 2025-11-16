import { Suspense } from 'react';
import { CreateInterviewForm } from '@/components/create-interview-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateInterviewPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/interviews">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Interviews
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Interview</h1>
                        <p className="text-muted-foreground">
                            Design a comprehensive video interview with AI-powered screening
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                </Button>
            </div>

            <Suspense fallback={<CreateInterviewSkeleton />}>
                <CreateInterviewForm />
            </Suspense>
        </div>
    );
}

function CreateInterviewSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}