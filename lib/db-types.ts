import {
    user,
    session,
    account,
    verification,
    userProfile,
    company,
    interview,
    question,
    interviewInvitation,
    videoSubmission,
    questionResponse,
    aiAnalysisResult,
    aiAnalysisTimeline,
    recruiterFeedback,
    interviewAnalytics,
    systemSetting,
    // Enums
    userRoleEnum,
    interviewStatusEnum,
    submissionStatusEnum,
    analysisStatusEnum,
    questionTypeEnum,
} from '@/db/schema';

// Export all types for type safety
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;

export type Company = typeof company.$inferSelect;
export type NewCompany = typeof company.$inferInsert;

export type Interview = typeof interview.$inferSelect;
export type NewInterview = typeof interview.$inferInsert;

export type Question = typeof question.$inferSelect;
export type NewQuestion = typeof question.$inferInsert;

export type InterviewInvitation = typeof interviewInvitation.$inferSelect;
export type NewInterviewInvitation = typeof interviewInvitation.$inferInsert;

export type VideoSubmission = typeof videoSubmission.$inferSelect;
export type NewVideoSubmission = typeof videoSubmission.$inferInsert;

export type QuestionResponse = typeof questionResponse.$inferSelect;
export type NewQuestionResponse = typeof questionResponse.$inferInsert;

export type AIAnalysisResult = typeof aiAnalysisResult.$inferSelect;
export type NewAIAnalysisResult = typeof aiAnalysisResult.$inferInsert;

export type AIAnalysisTimeline = typeof aiAnalysisTimeline.$inferSelect;
export type NewAIAnalysisTimeline = typeof aiAnalysisTimeline.$inferInsert;

export type RecruiterFeedback = typeof recruiterFeedback.$inferSelect;
export type NewRecruiterFeedback = typeof recruiterFeedback.$inferInsert;

export type InterviewAnalytics = typeof interviewAnalytics.$inferSelect;
export type NewInterviewAnalytics = typeof interviewAnalytics.$inferInsert;

export type SystemSetting = typeof systemSetting.$inferSelect;
export type NewSystemSetting = typeof systemSetting.$inferInsert;

// Export enum types
export type UserRole = typeof userRoleEnum.enumValues;
export type InterviewStatus = typeof interviewStatusEnum.enumValues;
export type SubmissionStatus = typeof submissionStatusEnum.enumValues;
export type AnalysisStatus = typeof analysisStatusEnum.enumValues;
export type QuestionType = typeof questionTypeEnum.enumValues;

// Utility types
export interface InterviewWithQuestions extends Interview {
    questions: Question[];
    company?: Company;
    recruiter?: User;
}

export interface SubmissionWithDetails extends VideoSubmission {
    interview: Interview;
    candidate?: User;
    responses: QuestionResponse[];
    aiAnalysis: AIAnalysisResult[];
    feedback?: RecruiterFeedback;
}

export interface AIAnalysisWithTimeline extends AIAnalysisResult {
    timeline: AIAnalysisTimeline[];
    response?: QuestionResponse;
    question?: Question;
}

export interface InterviewAnalyticsWithDetails extends InterviewAnalytics {
    interview: Interview;
}

export interface QuestionResponseWithAnalysis extends QuestionResponse {
    aiAnalysis?: AIAnalysisResult;
    question: Question;
}

// Form types
export interface InterviewFormData {
    title: string;
    description?: string;
    duration?: number;
    maxAttemptCount?: number;
    allowRetake?: boolean;
    showQuestions?: boolean;
    isPublic?: boolean;
    welcomeMessage?: string;
    thankYouMessage?: string;
    questions: QuestionFormData[];
}

export interface QuestionFormData {
    id?: string;
    type: QuestionType;
    questionText: string;
    maxDuration?: number;
    prepTime?: number;
    maxRetries?: number;
    isRequired?: boolean;
    description?: string;
    helpText?: string;
    options?: string[]; // For multiple choice
}

export interface UserProfileFormData {
    name: string;
    email: string;
    role: UserRole;
    companyId?: string;
    position?: string;
    department?: string;
    phoneNumber?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    experience?: Array<{
        company: string;
        position: string;
        duration: string;
        description?: string;
    }>;
    linkedinUrl?: string;
    resumeUrl?: string;
}

export interface CompanyFormData {
    name: string;
    description?: string;
    website?: string;
    logoUrl?: string;
    industry?: string;
    size?: string;
    location?: string;
}

// API Response types
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Video upload types
export interface VideoUploadResponse {
    url: string;
    thumbnailUrl?: string;
    uploadId: string;
    duration: number;
    size: number;
}

export interface AIAnalysisProgress {
    submissionId: string;
    status: AnalysisStatus;
    progress: number; // 0-100
    currentStep: string;
    estimatedTimeRemaining?: number;
}

// Analytics types
export interface InterviewMetrics {
    totalInterviews: number;
    activeInterviews: number;
    completedSubmissions: number;
    averageScore: number;
    averageCompletionTime: number;
    dropoffRate: number;
    aiProcessingSuccess: number;
}

export interface CandidateAnalytics {
    submissionCount: number;
    averageScore: number;
    completionRate: number;
    averageResponseTime: number;
    topSkills: string[];
    improvementAreas: string[];
}

// Webhook types
export interface WebhookEvent {
    type: 'submission.completed' | 'analysis.completed' | 'interview.created';
    data: any;
    timestamp: Date;
}

// Search and filter types
export interface SearchFilters {
    query?: string;
    status?: InterviewStatus | SubmissionStatus;
    dateRange?: {
        start: Date;
        end: Date;
    };
    companyId?: string;
    recruiterId?: string;
    tags?: string[];
}

export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}