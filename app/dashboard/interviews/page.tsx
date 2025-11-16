import { Suspense } from 'react';
import { InterviewsList } from '@/components/interviews-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function InterviewsPage() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
                    <p className="text-muted-foreground">
                        Manage your video interview templates and track their performance
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/interviews/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Interview
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<InterviewsListSkeleton />}>
                <InterviewsList />
            </Suspense>
        </div>
    );
}

function InterviewsListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Filters skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Interviews table skeleton */}
            <div className="rounded-md border">
                <div className="border-b bg-muted/50 p-4">
                    <div className="grid grid-cols-12 gap-4">
                        <Skeleton className="h-4 col-span-4" />
                        <Skeleton className="h-4 col-span-2" />
                        <Skeleton className="h-4 col-span-2" />
                        <Skeleton className="h-4 col-span-2" />
                        <Skeleton className="h-4 col-span-1" />
                        <Skeleton className="h-4 col-span-1" />
                    </div>
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-b p-4 last:border-b-0">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="col-span-2">
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                            <div className="col-span-1">
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="col-span-1">
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-32" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>
        </div>
    );
}