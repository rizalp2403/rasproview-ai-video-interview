import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videoSubmission, interview, userProfile } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Schema untuk validasi submission
const createSubmissionSchema = z.object({
    interviewId: z.string().min(1),
    totalQuestions: z.number().min(1),
    candidateInfo: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
    }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { interviewId, totalQuestions, candidateInfo } = createSubmissionSchema.parse(body);

        // Validate interview exists and is active
        const [interviewRecord] = await db
            .select()
            .from(interview)
            .where(eq(interview.id, interviewId));

        if (!interviewRecord) {
            return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
        }

        if (interviewRecord.status !== 'active') {
            return NextResponse.json({ error: 'Interview is not active' }, { status: 400 });
        }

        // Check if interview has expired
        if (interviewRecord.expiresAt && new Date(interviewRecord.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Interview has expired' }, { status: 400 });
        }

        // Create submission
        const [submission] = await db.insert(videoSubmission)
            .values({
                id: nanoid(),
                interviewId,
                candidateId: candidateInfo?.email || 'anonymous', // In a real app, this would be the user ID
                totalQuestions,
                status: 'in_progress',
                currentQuestionIndex: 0,
                startedAt: new Date(),
                metadata: {
                    userAgent: request.headers.get('user-agent'),
                    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                    timestamp: new Date().toISOString(),
                },
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: submission,
            message: 'Submission created successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error creating submission:', error);
        return NextResponse.json(
            { error: 'Failed to create submission' },
            { status: 500 }
        );
    }
}