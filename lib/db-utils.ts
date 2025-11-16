import { eq, and, desc, asc, ilike, count, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import {
    user,
    userProfile,
    company,
    interview,
    question,
    interviewInvitation,
    videoSubmission,
    questionResponse,
    aiAnalysisResult,
    recruiterFeedback,
    interviewAnalytics,
    type Interview,
    type VideoSubmission,
    type AIAnalysisResult,
    type NewInterview,
    type NewQuestion,
    type NewVideoSubmission,
    type InterviewStatus,
    type SubmissionStatus,
    type AnalysisStatus,
} from '@/db/schema';
import { nanoid } from 'nanoid';

// User and Profile utilities
export async function createUserProfile(userId: string, data: Partial<typeof userProfile.$inferInsert>) {
    const [profile] = await db.insert(userProfile)
        .values({
            id: userId,
            ...data,
        })
        .returning();
    return profile;
}

export async function getUserProfile(userId: string) {
    const profile = await db.query.userProfile.findFirst({
        where: eq(userProfile.id, userId),
        with: {
            user: true,
        },
    });
    return profile;
}

// Company utilities
export async function createCompany(data: typeof NewCompany) {
    const [companyRecord] = await db.insert(company)
        .values({
            id: nanoid(),
            ...data,
        })
        .returning();
    return companyRecord;
}

export async function getCompanyById(companyId: string) {
    return await db.query.company.findFirst({
        where: eq(company.id, companyId),
    });
}

// Interview utilities
export async function createInterview(data: typeof NewInterview) {
    const [interviewRecord] = await db.insert(interview)
        .values({
            id: nanoid(),
            ...data,
        })
        .returning();
    return interviewRecord;
}

export async function getInterviewById(interviewId: string) {
    return await db.query.interview.findFirst({
        where: eq(interview.id, interviewId),
        with: {
            questions: {
                orderBy: [asc(question.orderIndex)],
            },
            company: true,
            recruiter: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

export async function getInterviewsByRecruiter(recruiterId: string, status?: InterviewStatus) {
    return await db.query.interview.findMany({
        where: status
            ? and(eq(interview.recruiterId, recruiterId), eq(interview.status, status))
            : eq(interview.recruiterId, recruiterId),
        with: {
            company: true,
            _count: {
                select: {
                    invitations: true,
                },
            },
        },
        orderBy: [desc(interview.createdAt)],
    });
}

// Question utilities
export async function createQuestion(data: typeof NewQuestion) {
    const [questionRecord] = await db.insert(question)
        .values({
            id: nanoid(),
            ...data,
        })
        .returning();
    return questionRecord;
}

export async function updateQuestionOrder(interviewId: string, questions: Array<{ id: string; orderIndex: number }>) {
    const updates = questions.map(({ id, orderIndex }) =>
        db.update(question)
            .set({ orderIndex })
            .where(eq(question.id, id))
    );

    await Promise.all(updates);
}

// Invitation utilities
export async function createInvitation(data: typeof interviewInvitation.$inferInsert) {
    const [invitation] = await db.insert(interviewInvitation)
        .values({
            id: nanoid(),
            token: nanoid(32),
            ...data,
        })
        .returning();
    return invitation;
}

export async function getInvitationByToken(token: string) {
    return await db.query.interviewInvitation.findFirst({
        where: eq(interviewInvitation.token, token),
        with: {
            interview: {
                with: {
                    questions: {
                        orderBy: [asc(question.orderIndex)],
                    },
                    company: true,
                },
            },
        },
    });
}

// Submission utilities
export async function createSubmission(data: typeof NewVideoSubmission) {
    const [submission] = await db.insert(videoSubmission)
        .values({
            id: nanoid(),
            ...data,
        })
        .returning();
    return submission;
}

export async function getSubmissionById(submissionId: string) {
    return await db.query.videoSubmission.findFirst({
        where: eq(videoSubmission.id, submissionId),
        with: {
            interview: {
                with: {
                    questions: {
                        orderBy: [asc(question.orderIndex)],
                    },
                    company: true,
                },
            },
            candidate: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            responses: {
                with: {
                    question: true,
                    aiAnalysis: true,
                },
                orderBy: [asc(questionResponse.createdAt)],
            },
            aiAnalysis: {
                with: {
                    timeline: {
                        orderBy: [asc('timestamp')],
                    },
                },
            },
            feedback: true,
        },
    });
}

export async function updateSubmissionStatus(submissionId: string, status: SubmissionStatus) {
    const [submission] = await db.update(videoSubmission)
        .set({
            status,
            updatedAt: new Date(),
            ...(status === 'submitted' && { submittedAt: new Date() }),
            ...(status === 'completed' && { completedAt: new Date() }),
        })
        .where(eq(videoSubmission.id, submissionId))
        .returning();
    return submission;
}

// Response utilities
export async function createResponse(data: typeof questionResponse.$inferInsert) {
    const [response] = await db.insert(questionResponse)
        .values({
            id: nanoid(),
            ...data,
        })
        .returning();
    return response;
}

export async function getResponsesBySubmission(submissionId: string) {
    return await db.query.questionResponse.findMany({
        where: eq(questionResponse.submissionId, submissionId),
        with: {
            question: true,
            aiAnalysis: {
                with: {
                    timeline: {
                        orderBy: [asc('timestamp')],
                    },
                },
            },
        },
        orderBy: [asc(questionResponse.createdAt)],
    });
}

// AI Analysis utilities
export async function createAIAnalysis(data: typeof NewAIAnalysisResult) {
    const [analysis] = await db.insert(aiAnalysisResult)
        .values({
            id: nanoid(),
            ...data,
        })
        .returning();
    return analysis;
}

export async function updateAnalysisStatus(analysisId: string, status: AnalysisStatus, data?: Partial<typeof aiAnalysisResult.$inferInsert>) {
    const [analysis] = await db.update(aiAnalysisResult)
        .set({
            status,
            ...(status === 'completed' && { processedAt: new Date() }),
            ...(data && { ...data }),
            updatedAt: new Date(),
        })
        .where(eq(aiAnalysisResult.id, analysisId))
        .returning();
    return analysis;
}

export async function getAnalysisBySubmission(submissionId: string) {
    return await db.query.aiAnalysisResult.findMany({
        where: eq(aiAnalysisResult.submissionId, submissionId),
        with: {
            response: {
                with: {
                    question: true,
                },
            },
            question: true,
            timeline: {
                orderBy: [asc('timestamp')],
            },
        },
    });
}

// Feedback utilities
export async function createFeedback(data: typeof recruiterFeedback.$inferInsert) {
    const [feedback] = await db.insert(recruiterFeedback)
        .values({
            id: nanoid(),
            ...data,
        })
        .returning();
    return feedback;
}

export async function updateFeedback(feedbackId: string, data: Partial<typeof recruiterFeedback.$inferInsert>) {
    const [feedback] = await db.update(recruiterFeedback)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(recruiterFeedback.id, feedbackId))
        .returning();
    return feedback;
}

// Analytics utilities
export async function getInterviewAnalytics(interviewId: string) {
    // Count invitations
    const [invitationCount] = await db
        .select({ count: count() })
        .from(interviewInvitation)
        .where(eq(interviewInvitation.interviewId, interviewId));

    // Count submissions
    const [submissionCount] = await db
        .select({ count: count() })
        .from(videoSubmission)
        .where(eq(videoSubmission.interviewId, interviewId));

    // Count completed submissions
    const [completedCount] = await db
        .select({ count: count() })
        .from(videoSubmission)
        .where(and(
            eq(videoSubmission.interviewId, interviewId),
            eq(videoSubmission.status, 'completed')
        ));

    // Calculate average score
    const avgScoreResult = await db
        .select({ avgScore: aiAnalysisResult.overallScore })
        .from(aiAnalysisResult)
        .where(eq(aiAnalysisResult.submissionId, interviewId));

    const avgScore = avgScoreResult.reduce((sum, row) => sum + Number(row.avgScore || 0), 0) / avgScoreResult.length || 0;

    return {
        totalInvitations: invitationCount.count,
        totalSubmissions: submissionCount.count,
        completedSubmissions: completedCount.count,
        averageScore: Number(avgScore.toFixed(2)),
        completionRate: Number(((completedCount.count / submissionCount.count) * 100).toFixed(2)) || 0,
    };
}

// Search and filter utilities
export async function searchInterviews(filters: {
    recruiterId: string;
    query?: string;
    status?: InterviewStatus;
    limit?: number;
    offset?: number;
}) {
    const { recruiterId, query, status, limit = 10, offset = 0 } = filters;

    let whereConditions = [eq(interview.recruiterId, recruiterId)];

    if (status) {
        whereConditions.push(eq(interview.status, status));
    }

    if (query) {
        whereConditions.push(ilike(interview.title, `%${query}%`));
    }

    const interviews = await db.query.interview.findMany({
        where: and(...whereConditions),
        with: {
            company: true,
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

    const [totalCount] = await db
        .select({ count: count() })
        .from(interview)
        .where(and(...whereConditions));

    return {
        interviews,
        pagination: {
            total: totalCount.count,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(totalCount.count / limit),
            limit,
        },
    };
}

export async function searchSubmissions(filters: {
    interviewId?: string;
    recruiterId?: string;
    status?: SubmissionStatus;
    dateRange?: { start: Date; end: Date };
    limit?: number;
    offset?: number;
}) {
    const { interviewId, recruiterId, status, dateRange, limit = 10, offset = 0 } = filters;

    let whereConditions: any[] = [];

    if (interviewId) {
        whereConditions.push(eq(videoSubmission.interviewId, interviewId));
    }

    if (recruiterId) {
        whereConditions.push(eq(interview.recruiterId, recruiterId));
    }

    if (status) {
        whereConditions.push(eq(videoSubmission.status, status));
    }

    if (dateRange) {
        whereConditions.push(
            and(
                gte(videoSubmission.createdAt, dateRange.start),
                lte(videoSubmission.createdAt, dateRange.end)
            )
        );
    }

    const submissions = await db.query.videoSubmission.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
            interview: {
                with: {
                    company: true,
                },
            },
            candidate: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            aiAnalysis: true,
            feedback: true,
        },
        orderBy: [desc(videoSubmission.createdAt)],
        limit,
        offset,
    });

    const [totalCount] = await db
        .select({ count: count() })
        .from(videoSubmission)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return {
        submissions,
        pagination: {
            total: totalCount.count,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(totalCount.count / limit),
            limit,
        },
    };
}

// Cleanup utilities
export async function deleteExpiredInvitations() {
    return await db.delete(interviewInvitation)
        .where(lte(interviewInvitation.expiresAt, new Date()));
}

export async function archiveOldInterviews(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await db.update(interview)
        .set({ status: 'archived', updatedAt: new Date() })
        .where(and(
            eq(interview.status, 'closed'),
            lte(interview.updatedAt, cutoffDate)
        ));
}