import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    uuid,
    pgEnum,
    decimal,
    primaryKey
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Enums for different statuses and types
export const userRoleEnum = pgEnum("user_role", ["recruiter", "candidate"]);
export const interviewStatusEnum = pgEnum("interview_status", ["draft", "active", "closed", "archived"]);
export const submissionStatusEnum = pgEnum("submission_status", ["in_progress", "submitted", "reviewed", "rejected", "accepted"]);
export const analysisStatusEnum = pgEnum("analysis_status", ["pending", "processing", "completed", "failed"]);
export const questionTypeEnum = pgEnum("question_type", ["text", "video", "multiple_choice"]);

// Enhanced user table with role
export const userProfile = pgTable("user_profile", {
    id: text("id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull().default("candidate"),
    companyId: text("company_id"),
    position: text("position"),
    department: text("department"),
    phoneNumber: text("phone_number"),
    location: text("location"),
    bio: text("bio"),
    skills: text("skills"), // JSON string of skills array
    experience: text("experience"), // JSON string of experience
    linkedinUrl: text("linkedin_url"),
    resumeUrl: text("resume_url"),
    profileCompleted: boolean("profile_completed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table for recruiter organizations
export const company = pgTable("company", {
    id: text("id").primaryKey().default(uuid()),
    name: text("name").notNull(),
    description: text("description"),
    website: text("website"),
    logoUrl: text("logo_url"),
    industry: text("industry"),
    size: text("size"), // e.g., "1-10", "11-50", etc.
    location: text("location"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interviews table
export const interview = pgTable("interview", {
    id: text("id").primaryKey().default(uuid()),
    title: text("title").notNull(),
    description: text("description"),
    companyId: text("company_id").references(() => company.id, { onDelete: "cascade" }),
    recruiterId: text("recruiter_id").references(() => user.id, { onDelete: "cascade" }),
    status: interviewStatusEnum("status").default("draft").notNull(),
    duration: integer("duration"), // Estimated duration in minutes
    maxAttemptCount: integer("max_attempt_count").default(3), // Max recording attempts per question
    allowRetake: boolean("allow_retake").default(true),
    showQuestions: boolean("show_questions").default(false), // Show questions during recording
    isPublic: boolean("is_public").default(false),
    welcomeMessage: text("welcome_message"),
    thankYouMessage: text("thank_you_message"),
    settings: jsonb("settings"), // Additional settings as JSON
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
});

// Questions table
export const question = pgTable("question", {
    id: text("id").primaryKey().default(uuid()),
    interviewId: text("interview_id").references(() => interview.id, { onDelete: "cascade" }),
    type: questionTypeEnum("type").notNull().default("video"),
    questionText: text("question_text").notNull(),
    orderIndex: integer("order_index").notNull(),
    maxDuration: integer("max_duration"), // Max video duration in seconds
    prepTime: integer("prep_time"), // Preparation time in seconds before recording
    maxRetries: integer("max_retries").default(3),
    isRequired: boolean("is_required").default(true),
    description: text("description"),
    helpText: text("help_text"),
    options: jsonb("options"), // For multiple choice questions
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interview invitations
export const interviewInvitation = pgTable("interview_invitation", {
    id: text("id").primaryKey().default(uuid()),
    interviewId: text("interview_id").references(() => interview.id, { onDelete: "cascade" }),
    candidateEmail: text("candidate_email").notNull(),
    candidateName: text("candidate_name"),
    recruiterId: text("recruiter_id").references(() => user.id, { onDelete: "cascade" }),
    status: text("status").default("pending"), // pending, accepted, rejected, expired
    token: text("token").unique().notNull(), // Unique access token
    sentAt: timestamp("sent_at"),
    acceptedAt: timestamp("accepted_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Video submissions table
export const videoSubmission = pgTable("video_submission", {
    id: text("id").primaryKey().default(uuid()),
    interviewId: text("interview_id").references(() => interview.id, { onDelete: "cascade" }),
    candidateId: text("candidate_id").references(() => user.id, { onDelete: "cascade" }),
    invitationId: text("invitation_id").references(() => interviewInvitation.id, { onDelete: "set null" }),
    status: submissionStatusEnum("status").default("in_progress").notNull(),
    currentQuestionIndex: integer("current_question_index").default(0),
    totalQuestions: integer("total_questions"),
    startedAt: timestamp("started_at"),
    submittedAt: timestamp("submitted_at"),
    completedAt: timestamp("completed_at"),
    notes: text("notes"),
    metadata: jsonb("metadata"), // Device info, browser info, etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual question responses
export const questionResponse = pgTable("question_response", {
    id: text("id").primaryKey().default(uuid()),
    submissionId: text("submission_id").references(() => videoSubmission.id, { onDelete: "cascade" }),
    questionId: text("question_id").references(() => question.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").default(1),
    videoUrl: text("video_url"),
    videoSize: integer("video_size"), // File size in bytes
    videoDuration: integer("video_duration"), // Duration in seconds
    thumbnailUrl: text("thumbnail_url"),
    transcript: text("transcript"),
    textAnswer: text("text_answer"), // For text questions
    selectedOptions: jsonb("selected_options"), // For multiple choice
    responseTime: integer("response_time"), // Time taken to respond in seconds
    uploadedAt: timestamp("uploaded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Analysis Results table
export const aiAnalysisResult = pgTable("ai_analysis_result", {
    id: text("id").primaryKey().default(uuid()),
    submissionId: text("submission_id").references(() => videoSubmission.id, { onDelete: "cascade" }),
    questionId: text("question_id").references(() => question.id, { onDelete: "cascade" }),
    responseId: text("response_id").references(() => questionResponse.id, { onDelete: "cascade" }),
    status: analysisStatusEnum("status").default("pending").notNull(),
    processedAt: timestamp("processed_at"),

    // Facial expression analysis
    facialExpressions: jsonb("facial_expressions"), // Detailed emotion analysis timeline
    expressionConfidence: decimal("expression_confidence", { precision: 3, scale: 2 }),
    emotionBreakdown: jsonb("emotion_breakdown"), // Percentages of different emotions
    eyeContactScore: decimal("eye_contact_score", { precision: 3, scale: 2 }),
    smileFrequency: decimal("smile_frequency", { precision: 3, scale: 2 }),

    // Voice analysis
    voiceSentiment: jsonb("voice_sentiment"), // Sentiment analysis timeline
    speechTranscript: text("speech_transcript"),
    voiceClarity: decimal("voice_clarity", { precision: 3, scale: 2 }),
    speakingRate: decimal("speaking_rate", { precision: 5, scale: 2 }), // Words per minute
    fillerWordsCount: integer("filler_words_count"),
    pauseFrequency: decimal("pause_frequency", { precision: 3, scale: 2 }),
    confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),

    // Gesture analysis
    gestures: jsonb("gestures"), // Timeline of detected gestures
    gestureFrequency: decimal("gesture_frequency", { precision: 3, scale: 2 }),
    restlessnessScore: decimal("restlessness_score", { precision: 3, scale: 2 }),
    postureAnalysis: jsonb("posture_analysis"),

    // Overall scores
    overallScore: decimal("overall_score", { precision: 3, scale: 2 }),
    engagementScore: decimal("engagement_score", { precision: 3, scale: 2 }),
    professionalismScore: decimal("professionalism_score", { precision: 3, scale: 2 }),

    // Analysis metadata
    analysisVersion: text("analysis_version").default("1.0"),
    processingTime: integer("processing_time"), // Time taken to analyze in seconds
    modelVersions: jsonb("model_versions"), // AI model versions used
    rawResults: jsonb("raw_results"), // Raw AI service responses

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI analysis timeline for synchronized playback
export const aiAnalysisTimeline = pgTable("ai_analysis_timeline", {
    id: text("id").primaryKey().default(uuid()),
    analysisId: text("analysis_id").references(() => aiAnalysisResult.id, { onDelete: "cascade" }),
    timestamp: integer("timestamp").notNull(), // Milliseconds from video start

    // Expression data at this timestamp
    emotions: jsonb("emotions"), // Emotion scores at this moment
    dominantEmotion: text("dominant_emotion"),
    expression: text("expression"),

    // Voice data at this timestamp
    voiceSentiment: text("voice_sentiment"),
    speaking: boolean("speaking").default(false),
    volume: integer("volume"), // 0-100

    // Gesture data at this timestamp
    gesture: text("gesture"),
    posture: text("posture"),
    eyeContact: boolean("eye_contact").default(false),

    // Events
    eventType: text("event_type"), // "expression_change", "gesture", "pause", etc.
    confidence: decimal("confidence", { precision: 3, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recruiter feedback and ratings
export const recruiterFeedback = pgTable("recruiter_feedback", {
    id: text("id").primaryKey().default(uuid()),
    submissionId: text("submission_id").references(() => videoSubmission.id, { onDelete: "cascade" }),
    recruiterId: text("recruiter_id").references(() => user.id, { onDelete: "cascade" }),

    // Overall ratings
    overallRating: integer("overall_rating"), // 1-5 scale
    communicationRating: integer("communication_rating"), // 1-5 scale
    technicalRating: integer("technical_rating"), // 1-5 scale
    culturalFitRating: integer("cultural_fit_rating"), // 1-5 scale

    // Feedback notes
    strengths: text("strengths"),
    weaknesses: text("weaknesses"),
    generalFeedback: text("general_feedback"),

    // Hiring decision
    decision: text("decision"), // "proceed", "reject", "consider"
    recommendedNextStep: text("recommended_next_step"),

    // Tags and categorization
    tags: text("tags"), // JSON array of tags
    flagged: boolean("flagged").default(false),
    flagReason: text("flag_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics and metrics
export const interviewAnalytics = pgTable("interview_analytics", {
    id: text("id").primaryKey().default(uuid()),
    interviewId: text("interview_id").references(() => interview.id, { onDelete: "cascade" }),

    // Completion metrics
    totalInvitations: integer("total_invitations").default(0),
    startedSubmissions: integer("started_submissions").default(0),
    completedSubmissions: integer("completed_submissions").default(0),

    // Performance metrics
    averageCompletionTime: integer("average_completion_time"), // In minutes
    averageScore: decimal("average_score", { precision: 3, scale: 2 }),

    // Question analytics
    questionDropoffRates: jsonb("question_dropoff_rates"), // Dropoff rates per question
    questionAverageScores: jsonb("question_average_scores"),

    // AI analysis metrics
    aiProcessingStats: jsonb("ai_processing_stats"),

    // Time-based analytics
    date: timestamp("date").notNull(), // For daily/weekly aggregation

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System settings and configuration
export const systemSetting = pgTable("system_setting", {
    id: text("id").primaryKey().default(uuid()),
    key: text("key").unique().notNull(),
    value: jsonb("value").notNull(),
    description: text("description"),
    category: text("category"),
    isPublic: boolean("is_public").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});