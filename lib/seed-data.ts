import { nanoid } from 'nanoid';
import {
    company,
    interview,
    question,
    userProfile,
    type NewCompany,
    type NewInterview,
    type NewQuestion,
    type NewUserProfile,
    type QuestionType,
} from '@/db/schema';
import { db } from '@/db';

// Sample company data
const sampleCompanies: Array<Omit<NewCompany, 'id'>> = [
    {
        name: 'TechCorp Solutions',
        description: 'Leading technology company specializing in AI and machine learning solutions.',
        website: 'https://techcorp.com',
        logoUrl: '',
        industry: 'Technology',
        size: '100-500',
        location: 'San Francisco, CA',
        isActive: true,
    },
    {
        name: 'Global Finance Inc',
        description: 'Financial services company offering innovative banking solutions.',
        website: 'https://globalfinance.com',
        logoUrl: '',
        industry: 'Finance',
        size: '500-1000',
        location: 'New York, NY',
        isActive: true,
    },
    {
        name: 'HealthTech Innovations',
        description: 'Revolutionizing healthcare through technology and data-driven solutions.',
        website: 'https://healthtech.io',
        logoUrl: '',
        industry: 'Healthcare',
        size: '50-100',
        location: 'Boston, MA',
        isActive: true,
    },
];

// Sample interview templates
const sampleInterviews: Array<Omit<NewInterview, 'id' | 'recruiterId'>> = [
    {
        title: 'Software Engineer - Technical Interview',
        description: 'Comprehensive technical interview covering problem-solving, coding skills, and system design.',
        companyId: '', // Will be set dynamically
        status: 'active',
        duration: 45,
        maxAttemptCount: 3,
        allowRetake: true,
        showQuestions: false,
        isPublic: false,
        welcomeMessage: 'Welcome to our technical interview! Please take your time to answer each question thoroughly.',
        thankYouMessage: 'Thank you for completing our technical interview. We will review your responses and get back to you soon.',
        settings: {
            enableAIScreening: true,
            requireCamera: true,
            allowNotes: true,
        },
    },
    {
        title: 'Product Manager - Behavioral Interview',
        description: 'Behavioral and situational questions to assess product management skills and cultural fit.',
        companyId: '', // Will be set dynamically
        status: 'active',
        duration: 30,
        maxAttemptCount: 2,
        allowRetake: true,
        showQuestions: true,
        isPublic: false,
        welcomeMessage: 'Welcome! We\'re excited to learn more about your product management experience.',
        thankYouMessage: 'Thank you for sharing your experience with us. We appreciate your time and interest.',
        settings: {
            enableAIScreening: true,
            requireCamera: true,
            allowNotes: false,
        },
    },
    {
        title: 'Customer Success Role - Fit Interview',
        description: 'Interview focused on communication skills, problem-solving, and customer orientation.',
        companyId: '', // Will be set dynamically
        status: 'draft',
        duration: 25,
        maxAttemptCount: 2,
        allowRetake: false,
        showQuestions: true,
        isPublic: false,
        welcomeMessage: 'Welcome to your interview for the Customer Success position!',
        thankYouMessage: 'Thank you for your time. We look forward to reviewing your responses.',
        settings: {
            enableAIScreening: true,
            requireCamera: true,
            allowNotes: true,
        },
    },
];

// Sample questions
const sampleQuestions: Array<{
    interviewTitle: string;
    questions: Array<Omit<NewQuestion, 'id' | 'interviewId'>>;
}> = [
    {
        interviewTitle: 'Software Engineer - Technical Interview',
        questions: [
            {
                type: 'video' as QuestionType,
                questionText: 'Tell us about yourself and your experience in software development.',
                orderIndex: 1,
                maxDuration: 120,
                prepTime: 30,
                maxRetries: 2,
                isRequired: true,
                description: 'Introduce yourself and highlight your key technical skills and experiences.',
                helpText: 'Focus on your programming background, projects you\'re proud of, and your technical strengths.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'Describe a challenging technical problem you solved recently. What was the problem and how did you approach it?',
                orderIndex: 2,
                maxDuration: 180,
                prepTime: 45,
                maxRetries: 2,
                isRequired: true,
                description: 'Walk us through a complex technical challenge you\'ve encountered and your solution.',
                helpText: 'Include details about the problem context, your thought process, the technical solution, and the outcome.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'How do you ensure code quality and maintainability in your projects?',
                orderIndex: 3,
                maxDuration: 150,
                prepTime: 30,
                maxRetries: 2,
                isRequired: true,
                description: 'Share your approach to writing clean, maintainable code.',
                helpText: 'Discuss code reviews, testing practices, documentation, and any tools or methodologies you use.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'Explain how you would design a URL shortening service like bit.ly.',
                orderIndex: 4,
                maxDuration: 240,
                prepTime: 60,
                maxRetries: 2,
                isRequired: true,
                description: 'Design a system for URL shortening at scale.',
                helpText: 'Consider database design, API endpoints, caching strategies, and handling high traffic.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'What questions do you have for us about the role or the company?',
                orderIndex: 5,
                maxDuration: 120,
                prepTime: 15,
                maxRetries: 1,
                isRequired: false,
                description: 'Feel free to ask any questions you have about the position or our company.',
                helpText: 'This is your opportunity to learn more about us and show your interest.',
            },
        ],
    },
    {
        interviewTitle: 'Product Manager - Behavioral Interview',
        questions: [
            {
                type: 'video' as QuestionType,
                questionText: 'Walk us through your resume and tell us about your product management experience.',
                orderIndex: 1,
                maxDuration: 120,
                prepTime: 30,
                maxRetries: 2,
                isRequired: true,
                description: 'Introduce yourself and your product management background.',
                helpText: 'Highlight key achievements, products you\'ve worked on, and your approach to product management.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'Tell us about a product feature you launched from conception to completion. What was your role?',
                orderIndex: 2,
                maxDuration: 180,
                prepTime: 45,
                maxRetries: 2,
                isRequired: true,
                description: 'Describe your experience launching a product feature end-to-end.',
                helpText: 'Include ideation, research, development, launch strategy, and results.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'How do you prioritize features when you have competing demands from stakeholders?',
                orderIndex: 3,
                maxDuration: 150,
                prepTime: 30,
                maxRetries: 2,
                isRequired: true,
                description: 'Explain your prioritization framework and decision-making process.',
                helpText: 'Discuss how you balance user needs, business goals, technical constraints, and stakeholder input.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'Describe a time when you had to make a difficult product decision with incomplete data. How did you handle it?',
                orderIndex: 4,
                maxDuration: 180,
                prepTime: 30,
                maxRetries: 2,
                isRequired: true,
                description: 'Share an experience of making decisions under uncertainty.',
                helpText: 'Focus on your analytical approach, risk assessment, and how you validated your decision.',
            },
        ],
    },
    {
        interviewTitle: 'Customer Success Role - Fit Interview',
        questions: [
            {
                type: 'video' as QuestionType,
                questionText: 'Why are you interested in customer success, and what makes you a good fit for this role?',
                orderIndex: 1,
                maxDuration: 90,
                prepTime: 20,
                maxRetries: 2,
                isRequired: true,
                description: 'Tell us about your motivation and qualifications for customer success.',
                helpText: 'Share your understanding of customer success and relevant experiences.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'How would you handle an angry customer who is threatening to cancel their subscription?',
                orderIndex: 2,
                maxDuration: 120,
                prepTime: 30,
                maxRetries: 2,
                isRequired: true,
                description: 'Demonstrate your customer service and problem-solving skills.',
                helpText: 'Show empathy, active listening, problem identification, and solution-oriented thinking.',
            },
            {
                type: 'video' as QuestionType,
                questionText: 'Describe how you would onboard a new enterprise customer to ensure their success.',
                orderIndex: 3,
                maxDuration: 150,
                prepTime: 30,
                maxRetries: 2,
                isRequired: true,
                description: 'Walk us through your customer onboarding process.',
                helpText: 'Include discovery, goal setting, training, and establishing success metrics.',
            },
            {
                type: 'text' as QuestionType,
                questionText: 'What customer success metrics do you believe are most important to track?',
                orderIndex: 4,
                maxDuration: null,
                prepTime: null,
                maxRetries: 1,
                isRequired: true,
                description: 'List and explain key customer success metrics.',
                helpText: 'Include metrics like NPS, churn rate, adoption rate, and customer lifetime value.',
            },
        ],
    },
];

// Sample user profiles
const sampleUserProfiles: Array<Omit<NewUserProfile, 'id'>> = [
    {
        role: 'recruiter',
        position: 'Senior Technical Recruiter',
        department: 'Human Resources',
        phoneNumber: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        bio: 'Experienced technical recruiter with 8+ years in tech hiring. Passionate about connecting great talent with innovative companies.',
        skills: JSON.stringify(['Technical Recruiting', 'Sourcing', 'Interviewing', 'Candidate Assessment', 'Relationship Building']),
        experience: JSON.stringify([
            {
                company: 'TechCorp Solutions',
                position: 'Senior Technical Recruiter',
                duration: '3 years',
                description: 'Leading technical recruitment for engineering and product teams.'
            },
            {
                company: 'StartupHub',
                position: 'Technical Recruiter',
                duration: '2 years',
                description: 'Built engineering teams from scratch for multiple startups.'
            }
        ]),
        linkedinUrl: 'https://linkedin.com/in/john-recruiter',
        profileCompleted: true,
    },
    {
        role: 'recruiter',
        position: 'Talent Acquisition Manager',
        department: 'People Operations',
        phoneNumber: '+1 (555) 987-6543',
        location: 'New York, NY',
        bio: 'Talent acquisition leader specializing in building high-performing teams in finance and fintech.',
        skills: JSON.stringify(['Talent Strategy', 'Employer Branding', 'Executive Search', 'Process Optimization']),
        experience: JSON.stringify([
            {
                company: 'Global Finance Inc',
                position: 'Talent Acquisition Manager',
                duration: '4 years',
                description: 'Managing end-to-end recruitment processes for financial services roles.'
            }
        ]),
        linkedinUrl: 'https://linkedin.com/in/sarah-talent',
        profileCompleted: true,
    },
];

export async function seedDatabase() {
    console.log('Starting database seeding...');

    try {
        // Seed companies
        console.log('Seeding companies...');
        const createdCompanies = [];
        for (const companyData of sampleCompanies) {
            const [company] = await db.insert(company)
                .values({
                    id: nanoid(),
                    ...companyData,
                })
                .returning();
            createdCompanies.push(company);
            console.log(`Created company: ${company.name}`);
        }

        // Seed user profiles
        console.log('Seeding user profiles...');
        const createdProfiles = [];
        for (const profileData of sampleUserProfiles) {
            const [profile] = await db.insert(userProfile)
                .values({
                    id: nanoid(), // This would normally come from auth system
                    ...profileData,
                })
                .returning();
            createdProfiles.push(profile);
            console.log(`Created user profile: ${profile.position}`);
        }

        // Seed interviews and assign companies
        console.log('Seeding interviews...');
        const createdInterviews = [];
        for (let i = 0; i < sampleInterviews.length; i++) {
            const interviewData = {
                ...sampleInterviews[i],
                companyId: createdCompanies[i % createdCompanies.length].id,
                recruiterId: createdProfiles[i % createdProfiles.length].id,
            };

            const [interview] = await db.insert(interview)
                .values({
                    id: nanoid(),
                    ...interviewData,
                })
                .returning();
            createdInterviews.push(interview);
            console.log(`Created interview: ${interview.title}`);
        }

        // Seed questions for each interview
        console.log('Seeding questions...');
        for (const interviewQuestions of sampleQuestions) {
            const targetInterview = createdInterviews.find(
                interview => interview.title === interviewQuestions.interviewTitle
            );

            if (targetInterview) {
                for (const questionData of interviewQuestions.questions) {
                    const [question] = await db.insert(question)
                        .values({
                            id: nanoid(),
                            interviewId: targetInterview.id,
                            ...questionData,
                        })
                        .returning();
                    console.log(`Created question: ${question.questionText.substring(0, 50)}...`);
                }
            }
        }

        console.log('Database seeding completed successfully!');
        return {
            companies: createdCompanies.length,
            profiles: createdProfiles.length,
            interviews: createdInterviews.length,
        };

    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// System settings seed data
export const systemSettings = [
    {
        key: 'ai.analysis.enabled',
        value: true,
        description: 'Enable AI analysis for video submissions',
        category: 'ai',
        isPublic: false,
    },
    {
        key: 'video.max_file_size',
        value: 104857600, // 100MB in bytes
        description: 'Maximum file size for video uploads in bytes',
        category: 'video',
        isPublic: true,
    },
    {
        key: 'video.max_duration',
        value: 600, // 10 minutes in seconds
        description: 'Maximum duration for video recordings in seconds',
        category: 'video',
        isPublic: true,
    },
    {
        key: 'email.notifications.enabled',
        value: true,
        description: 'Enable email notifications for interviews and submissions',
        category: 'notifications',
        isPublic: false,
    },
    {
        key: 'ai.models.facial_expression',
        value: {
            provider: 'aws',
            model: 'rekognition',
            version: '1.0',
        },
        description: 'Facial expression analysis model configuration',
        category: 'ai',
        isPublic: false,
    },
    {
        key: 'ai.models.voice_sentiment',
        value: {
            provider: 'assemblyai',
            model: 'sentiment-analysis',
            version: '1.0',
        },
        description: 'Voice sentiment analysis model configuration',
        category: 'ai',
        isPublic: false,
    },
    {
        key: 'ai.models.gesture_detection',
        value: {
            provider: 'mediapipe',
            model: 'pose',
            version: '1.0',
        },
        description: 'Gesture detection model configuration',
        category: 'ai',
        isPublic: false,
    },
    {
        key: 'branding.company_name',
        value: 'RasproView AI',
        description: 'Company name displayed throughout the application',
        category: 'branding',
        isPublic: true,
    },
    {
        key: 'branding.primary_color',
        value: '#3B82F6',
        description: 'Primary brand color',
        category: 'branding',
        isPublic: true,
    },
    {
        key: 'branding.logo_url',
        value: '/logo.png',
        description: 'URL for company logo',
        category: 'branding',
        isPublic: true,
    },
];

export async function seedSystemSettings() {
    console.log('Seeding system settings...');

    try {
        const { systemSetting } = await import('@/db/schema');

        for (const setting of systemSettings) {
            await db.insert(systemSetting)
                .values({
                    id: nanoid(),
                    ...setting,
                })
                .onConflictDoUpdate({
                    target: systemSetting.key,
                    set: setting,
                });
        }

        console.log('System settings seeded successfully!');
    } catch (error) {
        console.error('Error seeding system settings:', error);
        throw error;
    }
}