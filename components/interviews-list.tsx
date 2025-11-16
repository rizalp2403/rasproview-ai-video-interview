'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    MoreHorizontal,
    Search,
    Plus,
    Eye,
    Edit,
    Copy,
    Trash2,
    Users,
    Video,
    TrendingUp,
    Clock,
    Settings,
    ExternalLink,
    Calendar,
    Star,
} from 'lucide-react';
import Link from 'next/link';
import { InterviewStatus } from '@/lib/db-types';

interface Interview {
    id: string;
    title: string;
    description?: string;
    status: InterviewStatus;
    company: {
        id: string;
        name: string;
        logo?: string;
    };
    recruiter: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    duration?: number;
    questions: Array<{
        id: string;
        type: string;
        questionText: string;
    }>;
    _count: {
        invitations: number;
        submissions: number;
        completedSubmissions: number;
    };
    averageScore?: number;
}

interface InterviewsListProps {
    interviews?: Interview[];
    loading?: boolean;
}

export function InterviewsList({ interviews = [], loading = false }: InterviewsListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Mock data - akan diganti dengan API call
    const mockInterviews: Interview[] = [
        {
            id: '1',
            title: 'Senior Frontend Developer',
            description: 'Technical interview covering React, TypeScript, and system design',
            status: 'active',
            company: {
                id: '1',
                name: 'TechCorp Solutions',
                logo: '/logos/techcorp.png',
            },
            recruiter: {
                id: '1',
                name: 'John Recruiter',
                email: 'john@techcorp.com',
                avatar: '/avatars/john.jpg',
            },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-16T09:30:00Z',
            duration: 45,
            questions: [
                {
                    id: '1',
                    type: 'video',
                    questionText: 'Tell us about your experience with React',
                },
                {
                    id: '2',
                    type: 'video',
                    questionText: 'Describe a challenging technical problem you solved',
                },
            ],
            _count: {
                invitations: 25,
                submissions: 18,
                completedSubmissions: 15,
            },
            averageScore: 85,
        },
        {
            id: '2',
            title: 'Product Manager Interview',
            description: 'Behavioral interview for PM role focusing on product strategy',
            status: 'active',
            company: {
                id: '2',
                name: 'Global Finance Inc',
                logo: '/logos/globalfinance.png',
            },
            recruiter: {
                id: '2',
                name: 'Sarah Talent',
                email: 'sarah@globalfinance.com',
                avatar: '/avatars/sarah.jpg',
            },
            createdAt: '2024-01-12T14:00:00Z',
            updatedAt: '2024-01-14T11:20:00Z',
            duration: 30,
            questions: [
                {
                    id: '3',
                    type: 'video',
                    questionText: 'Walk me through a product you launched',
                },
                {
                    id: '4',
                    type: 'text',
                    questionText: 'How do you prioritize features?',
                },
            ],
            _count: {
                invitations: 15,
                submissions: 12,
                completedSubmissions: 10,
            },
            averageScore: 78,
        },
        {
            id: '3',
            title: 'Customer Success Role',
            description: 'Interview focusing on communication and problem-solving skills',
            status: 'draft',
            company: {
                id: '3',
                name: 'HealthTech Innovations',
                logo: '/logos/healthtech.png',
            },
            recruiter: {
                id: '1',
                name: 'John Recruiter',
                email: 'john@techcorp.com',
                avatar: '/avatars/john.jpg',
            },
            createdAt: '2024-01-10T16:00:00Z',
            updatedAt: '2024-01-10T16:00:00Z',
            duration: 25,
            questions: [
                {
                    id: '5',
                    type: 'video',
                    questionText: 'How would you handle an angry customer?',
                },
            ],
            _count: {
                invitations: 0,
                submissions: 0,
                completedSubmissions: 0,
            },
            averageScore: undefined,
        },
    ];

    const allInterviews = interviews.length > 0 ? interviews : mockInterviews;

    // Filter interviews
    const filteredInterviews = allInterviews.filter(interview => {
        const matchesSearch = interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (interview.description && interview.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            interview.company.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
        const matchesCompany = companyFilter === 'all' || interview.company.id === companyFilter;

        return matchesSearch && matchesStatus && matchesCompany;
    });

    // Sort interviews
    const sortedInterviews = [...filteredInterviews].sort((a, b) => {
        switch (sortBy) {
            case 'created_at':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'updated_at':
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            case 'title':
                return a.title.localeCompare(b.title);
            case 'submissions':
                return b._count.submissions - a._count.submissions;
            case 'score':
                return (b.averageScore || 0) - (a.averageScore || 0);
            default:
                return 0;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedInterviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedInterviews = sortedInterviews.slice(startIndex, startIndex + itemsPerPage);

    const getStatusBadge = (status: InterviewStatus) => {
        const variants = {
            active: 'default',
            draft: 'secondary',
            closed: 'outline',
            archived: 'destructive',
        } as const;

        const icons = {
            active: <Star className="h-3 w-3" />,
            draft: <Clock className="h-3 w-3" />,
            closed: <Users className="h-3 w-3" />,
            archived: <Trash2 className="h-3 w-3" />,
        };

        return (
            <Badge variant={variants[status]} className="capitalize">
                <span className="mr-1">{icons[status]}</span>
                {status}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getCompletionRate = (submissions: number, completed: number) => {
        if (submissions === 0) return 0;
        return Math.round((completed / submissions) * 100);
    };

    const uniqueCompanies = Array.from(new Set(allInterviews.map(i => i.company.name)));

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search interviews..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={companyFilter} onValueChange={setCompanyFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Filter by company" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Companies</SelectItem>
                                {uniqueCompanies.map(company => (
                                    <SelectItem key={company} value={company}>
                                        {company}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">Created Date</SelectItem>
                                <SelectItem value="updated_at">Last Updated</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="submissions">Submissions</SelectItem>
                                <SelectItem value="score">Average Score</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Interviews Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Interviews ({sortedInterviews.length})</CardTitle>
                            <CardDescription>
                                Manage and monitor your video interview templates
                            </CardDescription>
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Interview</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Performance</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedInterviews.map((interview) => (
                                    <TableRow key={interview.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{interview.title}</div>
                                                {interview.description && (
                                                    <div className="text-sm text-muted-foreground line-clamp-2">
                                                        {interview.description}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {interview._count.submissions} submissions
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {interview.duration}m
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={interview.company.logo} alt={interview.company.name} />
                                                    <AvatarFallback className="text-xs">
                                                        {interview.company.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">{interview.company.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(interview.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {interview.averageScore !== undefined && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{interview.averageScore}%</span>
                                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                                    </div>
                                                )}
                                                <div className="text-sm text-muted-foreground">
                                                    {getCompletionRate(interview._count.submissions, interview._count.completedSubmissions)}% completion
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Video className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{interview.questions.length}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {formatDate(interview.createdAt)}
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
                                                        <Link href={`/dashboard/interviews/${interview.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/interviews/${interview.id}/invite`}>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Send Invitations
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/interview/${interview.id}/preview`} target="_blank">
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Preview
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedInterviews.length)} of {sortedInterviews.length} interviews
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(page)}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}