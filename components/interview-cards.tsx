'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Briefcase,
    Users,
    Video,
    TrendingUp,
    Clock,
    Eye,
    Plus,
    Settings,
} from 'lucide-react';
import Link from 'next/link';

interface InterviewStats {
    totalInterviews: number;
    activeInterviews: number;
    totalSubmissions: number;
    pendingReviews: number;
    avgCompletionRate: number;
    avgScore: number;
}

export function InterviewCards() {
    // Mock data - akan diganti dengan API call
    const stats: InterviewStats = {
        totalInterviews: 12,
        activeInterviews: 3,
        totalSubmissions: 48,
        pendingReviews: 7,
        avgCompletionRate: 78,
        avgScore: 82,
    };

    const recentInterviews = [
        {
            id: '1',
            title: 'Senior Frontend Developer',
            status: 'active' as const,
            submissions: 15,
            views: 89,
            createdAt: '2024-01-15',
        },
        {
            id: '2',
            title: 'Product Manager Interview',
            status: 'active' as const,
            submissions: 8,
            views: 45,
            createdAt: '2024-01-12',
        },
        {
            id: '3',
            title: 'Customer Success Role',
            status: 'draft' as const,
            submissions: 0,
            views: 0,
            createdAt: '2024-01-10',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Interviews Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.activeInterviews} active
                    </p>
                    <Progress value={(stats.activeInterviews / stats.totalInterviews) * 100} className="mt-2" />
                </CardContent>
            </Card>

            {/* Total Submissions Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                    <p className="text-xs text-muted-foreground">
                        +12% from last month
                    </p>
                    <div className="mt-2 flex items-center text-xs text-green-600">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Increasing trend
                    </div>
                </CardContent>
            </Card>

            {/* Pending Reviews Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                    <p className="text-xs text-muted-foreground">
                        Requires attention
                    </p>
                    <div className="mt-2">
                        <Badge variant={stats.pendingReviews > 5 ? "destructive" : "secondary"}>
                            {stats.pendingReviews > 5 ? "High Priority" : "Normal"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Average Score Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.avgScore}%</div>
                    <p className="text-xs text-muted-foreground">
                        Completion rate: {stats.avgCompletionRate}%
                    </p>
                    <Progress value={stats.avgScore} className="mt-2" />
                </CardContent>
            </Card>

            {/* Recent Interviews Card */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Interviews</CardTitle>
                            <CardDescription>Your latest interview templates and their performance</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/interviews/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Interview
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentInterviews.map((interview) => (
                            <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{interview.title}</h4>
                                        <Badge variant={interview.status === 'active' ? 'default' : 'secondary'}>
                                            {interview.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {interview.submissions} submissions
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {interview.views} views
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(interview.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/interviews/${interview.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}