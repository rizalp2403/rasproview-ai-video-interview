'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Video, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AnalyticsData {
    submissionsOverTime: Array<{ date: string; submissions: number; completed: number; pending: number }>;
    interviewPerformance: Array<{ name: string; submissions: number; avgScore: number; completionRate: number }>;
    statusDistribution: Array<{ name: string; value: number; color: string }>;
    topMetrics: Array<{
        label: string;
        value: string;
        change: string;
        icon: React.ReactNode;
        trend: 'up' | 'down' | 'neutral';
    }>;
}

export function AnalyticsOverview() {
    // Mock data - akan diganti dengan API call
    const analyticsData: AnalyticsData = {
        submissionsOverTime: [
            { date: 'Jan 10', submissions: 12, completed: 10, pending: 2 },
            { date: 'Jan 11', submissions: 19, completed: 16, pending: 3 },
            { date: 'Jan 12', submissions: 15, completed: 12, pending: 3 },
            { date: 'Jan 13', submissions: 25, completed: 20, pending: 5 },
            { date: 'Jan 14', submissions: 22, completed: 18, pending: 4 },
            { date: 'Jan 15', submissions: 30, completed: 25, pending: 5 },
            { date: 'Jan 16', submissions: 28, completed: 24, pending: 4 },
        ],
        interviewPerformance: [
            { name: 'Frontend Dev', submissions: 15, avgScore: 85, completionRate: 93 },
            { name: 'Product Manager', submissions: 8, avgScore: 78, completionRate: 75 },
            { name: 'Customer Success', submissions: 12, avgScore: 82, completionRate: 88 },
            { name: 'Backend Dev', submissions: 6, avgScore: 80, completionRate: 83 },
        ],
        statusDistribution: [
            { name: 'Completed', value: 45, color: '#10b981' },
            { name: 'In Progress', value: 18, color: '#3b82f6' },
            { name: 'Pending Review', value: 12, color: '#f59e0b' },
            { name: 'Rejected', value: 3, color: '#ef4444' },
        ],
        topMetrics: [
            {
                label: 'Completion Rate',
                value: '82%',
                change: '+5%',
                icon: <CheckCircle className="h-4 w-4" />,
                trend: 'up',
            },
            {
                label: 'Avg. Response Time',
                value: '2.3 days',
                change: '-0.5 days',
                icon: <Clock className="h-4 w-4" />,
                trend: 'down',
            },
            {
                label: 'AI Processing Success',
                value: '96%',
                change: '+2%',
                icon: <TrendingUp className="h-4 w-4" />,
                trend: 'up',
            },
            {
                label: 'Candidate Satisfaction',
                value: '4.6/5',
                change: '+0.2',
                icon: <Users className="h-4 w-4" />,
                trend: 'up',
            },
        ],
    };

    const chartConfig = {
        submissions: {
            label: "Total Submissions",
            color: "hsl(var(--chart-1))",
        },
        completed: {
            label: "Completed",
            color: "hsl(var(--chart-2))",
        },
        pending: {
            label: "Pending",
            color: "hsl(var(--chart-3))",
        },
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Top Metrics Cards */}
            {analyticsData.topMetrics.map((metric, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                        <div className="text-muted-foreground">
                            {metric.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className={`inline-flex items-center ${
                                metric.trend === 'up' ? 'text-green-600' :
                                metric.trend === 'down' ? 'text-blue-600' : 'text-gray-600'
                            }`}>
                                {metric.change}
                            </span>
                            {' '}from last month
                        </p>
                    </CardContent>
                </Card>
            ))}

            {/* Submissions Over Time Chart */}
            <Card className="md:col-span-2 lg:col-span-4">
                <CardHeader>
                    <CardTitle>Submissions Over Time</CardTitle>
                    <CardDescription>Daily submission trends for the past week</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData.submissionsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="submissions"
                                    stackId="1"
                                    stroke="var(--color-submissions)"
                                    fill="var(--color-submissions)"
                                    fillOpacity={0.6}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stackId="1"
                                    stroke="var(--color-completed)"
                                    fill="var(--color-completed)"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Interview Performance Chart */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Interview Performance</CardTitle>
                    <CardDescription>Average scores and completion rates by interview</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.interviewPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar yAxisId="left" dataKey="submissions" fill="hsl(var(--chart-1))" name="Submissions" />
                                <Bar yAxisId="right" dataKey="avgScore" fill="hsl(var(--chart-2))" name="Avg Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Status Distribution Pie Chart */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Submission Status Distribution</CardTitle>
                    <CardDescription>Current status of all submissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {analyticsData.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}