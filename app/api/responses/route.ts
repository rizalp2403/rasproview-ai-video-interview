import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { questionResponse, videoSubmission, question } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Schema untuk validasi response
const createResponseSchema = z.object({
    submissionId: z.string().min(1),
    questionId: z.string().min(1),
    videoUrl: z.string().url().optional(),
    textAnswer: z.string().optional(),
    selectedOptions: z.array(z.string()).optional(),
    attemptNumber: z.number().min(1).default(1),
    duration: z.number().min(0).default(0),
    videoSize: z.number().min(0).optional(),
    thumbnailUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createResponseSchema.parse(body);

        // Validate submission exists and is in progress
        const [submission] = await db
            .select()
            .from(videoSubmission)
            .where(eq(videoSubmission.id, validatedData.submissionId));

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        if (submission.status !== 'in_progress') {
            return NextResponse.json({ error: 'Submission is not in progress' }, { status: 400 });
        }

        // Validate question exists and belongs to the interview
        const [questionRecord] = await db
            .select()
            .from(question)
            .where(and(
                eq(question.id, validatedData.questionId),
                eq(question.interviewId, submission.interviewId)
            ));

        if (!questionRecord) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        // Validate response type matches question type
        if (questionRecord.type === 'video' && !validatedData.videoUrl) {
            return NextResponse.json({ error: 'Video response required for video question' }, { status: 400 });
        }

        if (questionRecord.type === 'text' && !validatedData.textAnswer) {
            return NextResponse.json({ error: 'Text response required for text question' }, { status: 400 });
        }

        if (questionRecord.type === 'multiple_choice' && (!validatedData.selectedOptions || validatedData.selectedOptions.length === 0)) {
            return NextResponse.json({ error: 'Selection required for multiple choice question' }, { status: 400 });
        }

        // Create response
        const [response] = await db.insert(questionResponse)
            .values({
                id: nanoid(),
                submissionId: validatedData.submissionId,
                questionId: validatedData.questionId,
                videoUrl: validatedData.videoUrl,
                textAnswer: validatedData.textAnswer,
                selectedOptions: validatedData.selectedOptions,
                attemptNumber: validatedData.attemptNumber,
                duration: validatedData.duration,
                videoSize: validatedData.videoSize,
                thumbnailUrl: validatedData.thumbnailUrl,
                responseTime: validatedData.duration, // Time taken to respond
                uploadedAt: new Date(),
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: response,
            message: 'Response saved successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error saving response:', error);
        return NextResponse.json(
            { error: 'Failed to save response' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const submissionId = searchParams.get('submissionId');
        const questionId = searchParams.get('questionId');

        if (!submissionId) {
            return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
        }

        let whereCondition = eq(questionResponse.submissionId, submissionId);
        if (questionId) {
            whereCondition = and(
                whereCondition,
                eq(questionResponse.questionId, questionId)
            );
        }

        const responses = await db.query.questionResponse.findMany({
            where: whereCondition,
            with: {
                question: true,
            },
            orderBy: (questionResponse, { asc }) => [asc(questionResponse.createdAt)],
        });

        return NextResponse.json({
            success: true,
            data: responses,
        });
    } catch (error) {
        console.error('Error fetching responses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch responses' },
            { status: 500 }
        );
    }
}