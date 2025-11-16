import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { interview, question, userProfile } from '@/db/schema';
import { eq, and, desc, ilike, count } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schema untuk validasi create interview
const createInterviewSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().optional(),
    companyId: z.string().min(1),
    duration: z.number().min(5).max(180).optional(),
    maxAttemptCount: z.number().min(1).max(10).default(3),
    allowRetake: z.boolean().default(true),
    showQuestions: z.boolean().default(false),
    isPublic: z.boolean().default(false),
    welcomeMessage: z.string().optional(),
    thankYouMessage: z.string().optional(),
    questions: z.array(z.object({
        type: z.enum(['video', 'text', 'multiple_choice']),
        questionText: z.string().min(1),
        maxDuration: z.number().min(10).max(600).optional(),
        prepTime: z.number().min(0).max(300).optional(),
        maxRetries: z.number().min(0).max(10).default(3),
        isRequired: z.boolean().default(true),
        description: z.string().optional(),
        helpText: z.string().optional(),
        options: z.array(z.string()).optional(),
    })).min(1),
});

// GET - List interviews for current user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile to check role
        const userProfileRecord = await db.query.userProfile.findFirst({
            where: eq(userProfile.id, session.user.id),
        });

        if (!userProfileRecord) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const companyId = searchParams.get('companyId') || '';

        const offset = (page - 1) * limit;

        // Build query conditions
        let whereConditions: any[] = [eq(interview.recruiterId, session.user.id)];

        if (search) {
            whereConditions.push(ilike(interview.title, `%${search}%`));
        }

        if (status && status !== 'all') {
            whereConditions.push(eq(interview.status, status as any));
        }

        if (companyId) {
            whereConditions.push(eq(interview.companyId, companyId));
        }

        // Get interviews with counts and relations
        const interviews = await db.query.interview.findMany({
            where: whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0],
            with: {
                company: true,
                recruiter: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                questions: {
                    columns: {
                        id: true,
                        type: true,
                    },
                },
                _count: {
                    select: {
                        invitations: true,
                    },
                },
            },
            orderBy: [desc(interview.createdAt)],
            limit,
            offset,
        });

        // Get total count for pagination
        const [totalCount] = await db
            .select({ count: count() })
            .from(interview)
            .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]);

        // Get submission stats for each interview
        const { videoSubmission, aiAnalysisResult } = await import('@/db/schema');
        const interviewsWithStats = await Promise.all(
            interviews.map(async (interview) => {
                const [submissionStats] = await db
                    .select({
                        totalSubmissions: count(videoSubmission.id),
                        completedSubmissions: count(videoSubmission.id),
                    })
                    .from(videoSubmission)
                    .where(eq(videoSubmission.interviewId, interview.id));

                // Get average AI score
                const [avgScoreResult] = await db
                    .select({
                        avgScore: aiAnalysisResult.overallScore,
                    })
                    .from(aiAnalysisResult)
                    .where(eq(aiAnalysisResult.submissionId, interview.id));

                return {
                    ...interview,
                    _count: {
                        ...interview._count,
                        submissions: submissionStats.totalSubmissions || 0,
                        completedSubmissions: submissionStats.completedSubmissions || 0,
                    },
                    averageScore: avgScoreResult?.avgScore ? Number(avgScoreResult.avgScore) : null,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: interviewsWithStats,
            pagination: {
                page,
                limit,
                total: totalCount.count,
                totalPages: Math.ceil(totalCount.count / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching interviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch interviews' },
            { status: 500 }
        );
    }
}

// POST - Create new interview
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile to check role
        const userProfileRecord = await db.query.userProfile.findFirst({
            where: eq(userProfile.id, session.user.id),
        });

        if (!userProfileRecord || userProfileRecord.role !== 'recruiter') {
            return NextResponse.json({ error: 'Only recruiters can create interviews' }, { status: 403 });
        }

        const body = await request.json();
        const validatedData = createInterviewSchema.parse(body);

        // Create interview
        const [newInterview] = await db.insert(interview)
            .values({
                id: nanoid(),
                title: validatedData.title,
                description: validatedData.description,
                companyId: validatedData.companyId,
                recruiterId: session.user.id,
                status: 'draft',
                duration: validatedData.duration,
                maxAttemptCount: validatedData.maxAttemptCount,
                allowRetake: validatedData.allowRetake,
                showQuestions: validatedData.showQuestions,
                isPublic: validatedData.isPublic,
                welcomeMessage: validatedData.welcomeMessage,
                thankYouMessage: validatedData.thankYouMessage,
                settings: {
                    enableAIScreening: true,
                    requireCamera: true,
                    allowNotes: true,
                },
            })
            .returning();

        // Create questions
        const questionsToInsert = validatedData.questions.map((q, index) => ({
            id: nanoid(),
            interviewId: newInterview.id,
            type: q.type,
            questionText: q.questionText,
            orderIndex: index,
            maxDuration: q.maxDuration,
            prepTime: q.prepTime,
            maxRetries: q.maxRetries,
            isRequired: q.isRequired,
            description: q.description,
            helpText: q.helpText,
            options: q.options,
        }));

        await db.insert(question).values(questionsToInsert);

        // Fetch created interview with relations
        const createdInterview = await db.query.interview.findFirst({
            where: eq(interview.id, newInterview.id),
            with: {
                company: true,
                recruiter: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                questions: {
                    orderBy: [(q: any) => q.orderIndex],
                },
                _count: {
                    select: {
                        invitations: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: createdInterview,
            message: 'Interview created successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error creating interview:', error);
        return NextResponse.json(
            { error: 'Failed to create interview' },
            { status: 500 }
        );
    }
}