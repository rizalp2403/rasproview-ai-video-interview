import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function DashboardSkeleton() {
    return (
        <div className="grid gap-6">
            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Interviews Card Skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-9 w-32" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Overview Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Submissions Table Skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-9 w-20" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Interview</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>AI Score</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div>
                                                <Skeleton className="h-4 w-32 mb-1" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <Skeleton className="h-4 w-36 mb-1" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-8" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}