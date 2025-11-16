'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Search,
    Eye,
    Download,
    MessageSquare,
    Star,
    Clock,
    CheckCircle,
    AlertCircle,
    Video,
    TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface RecentSubmission {
    id: string;
    candidate: {
        name: string;
        email: string;
        avatar?: string;
    };
    interview: {
        title: string;
        company: string;
    };
    status: 'completed' | 'in_progress' | 'submitted' | 'reviewed';
    score?: number;
    submittedAt: string;
    aiAnalysis: {
        expressions: number;
        sentiment: number;
        gestures: number;
    };
    duration: string;
    flags: string[];
}

export function RecentSubmissions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Mock data - akan diganti dengan API call
    const submissions: RecentSubmission[] = [
        {
            id: '1',
            candidate: {
                name: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                avatar: '/avatars/sarah.jpg',
            },
            interview: {
                title: 'Senior Frontend Developer',
                company: 'TechCorp Solutions',
            },
            status: 'completed',
            score: 92,
            submittedAt: '2024-01-16T10:30:00Z',
            aiAnalysis: {
                expressions: 88,
                sentiment: 94,
                gestures: 85,
            },
            duration: '24:35',
            flags: [],
        },
        {
            id: '2',
            candidate: {
                name: 'Michael Chen',
                email: 'm.chen@email.com',
                avatar: '/avatars/michael.jpg',
            },
            interview: {
                title: 'Product Manager Interview',
                company: 'Global Finance Inc',
            },
            status: 'reviewed',
            score: 78,
            submittedAt: '2024-01-16T09:15:00Z',
            aiAnalysis: {
                expressions: 75,
                sentiment: 82,
                gestures: 79,
            },
            duration: '32:18',
            flags: ['follow-up'],
        },
        {
            id: '3',
            candidate: {
                name: 'Emily Rodriguez',
                email: 'emily.r@email.com',
                avatar: '/avatars/emily.jpg',
            },
            interview: {
                title: 'Customer Success Role',
                company: 'HealthTech Innovations',
            },
            status: 'submitted',
            score: null,
            submittedAt: '2024-01-15T16:45:00Z',
            aiAnalysis: {
                expressions: 0,
                sentiment: 0,
                gestures: 0,
            },
            duration: '28:12',
            flags: [],
        },
        {
            id: '4',
            candidate: {
                name: 'David Kim',
                email: 'd.kim@email.com',
                avatar: '/avatars/david.jpg',
            },
            interview: {
                title: 'Senior Frontend Developer',
                company: 'TechCorp Solutions',
            },
            status: 'in_progress',
            score: null,
            submittedAt: '2024-01-15T14:20:00Z',
            aiAnalysis: {
                expressions: 0,
                sentiment: 0,
                gestures: 0,
            },
            duration: '15:42',
            flags: ['incomplete'],
        },
    ];

    const getStatusBadge = (status: RecentSubmission['status']) => {
        const variants = {
            completed: 'default',
            reviewed: 'secondary',
            submitted: 'outline',
            in_progress: 'destructive',
        } as const;

        const labels = {
            completed: 'Completed',
            reviewed: 'Reviewed',
            submitted: 'Submitted',
            in_progress: 'In Progress',
        };

        return (
            <Badge variant={variants[status]}>
                {labels[status]}
            </Badge>
        );
    };

    const getStatusIcon = (status: RecentSubmission['status']) => {
        const icons = {
            completed: <CheckCircle className="h-4 w-4 text-green-500" />,
            reviewed: <Star className="h-4 w-4 text-blue-500" />,
            submitted: <Clock className="h-4 w-4 text-yellow-500" />,
            in_progress: <AlertCircle className="h-4 w-4 text-red-500" />,
        };

        return icons[status];
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch = submission.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.interview.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getAverageScore = (analysis: RecentSubmission['aiAnalysis']) => {
        if (analysis.expressions === 0 && analysis.sentiment === 0 && analysis.gestures === 0) {
            return null;
        }
        return Math.round((analysis.expressions + analysis.sentiment + analysis.gestures) / 3);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>Latest candidate video submissions and their analysis status</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/submissions">
                            View All
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates, interviews..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
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
                            {filteredSubmissions.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={submission.candidate.avatar} alt={submission.candidate.name} />
                                                <AvatarFallback>
                                                    {submission.candidate.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{submission.candidate.name}</div>
                                                <div className="text-sm text-muted-foreground">{submission.candidate.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{submission.interview.title}</div>
                                            <div className="text-sm text-muted-foreground">{submission.interview.company}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(submission.status)}
                                            {getStatusBadge(submission.status)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {submission.score !== null ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium">{submission.score}%</div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                                        <span className="text-xs text-green-600">
                                                            {getAverageScore(submission.aiAnalysis)}% AI
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : getAverageScore(submission.aiAnalysis) !== null ? (
                                                <div className="text-sm text-muted-foreground">
                                                    Processing...
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    Not started
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Video className="h-3 w-3 text-muted-foreground" />
                                            {submission.duration}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {formatDate(submission.submittedAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/submissions/${submission.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/results/${submission.id}`}>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        View Analysis
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Export Data
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}