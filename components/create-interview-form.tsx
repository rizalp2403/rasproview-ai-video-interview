'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Plus,
    Trash2,
    GripVertical,
    Clock,
    Video,
    Settings,
    Eye,
    EyeOff,
    HelpCircle,
    ArrowRight,
    ArrowLeft,
    Check,
    X,
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/sortable-question-item';
import { QuestionFormData, InterviewFormData, QuestionType } from '@/lib/db-types';
import { cn } from '@/lib/utils';

// Schema untuk validasi form
const questionSchema = z.object({
    type: z.enum(['video', 'text', 'multiple_choice']),
    questionText: z.string().min(1, 'Question text is required'),
    maxDuration: z.number().min(10).max(600).optional(),
    prepTime: z.number().min(0).max(300).optional(),
    maxRetries: z.number().min(0).max(10).default(3),
    isRequired: z.boolean().default(true),
    description: z.string().optional(),
    helpText: z.string().optional(),
    options: z.array(z.string()).optional(),
});

const interviewSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().optional(),
    companyId: z.string().min(1, 'Company is required'),
    duration: z.number().min(5).max(180).optional(),
    maxAttemptCount: z.number().min(1).max(10).default(3),
    allowRetake: z.boolean().default(true),
    showQuestions: z.boolean().default(false),
    isPublic: z.boolean().default(false),
    welcomeMessage: z.string().optional(),
    thankYouMessage: z.string().optional(),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

type InterviewFormValues = z.infer<typeof interviewSchema>;

interface CreateInterviewFormProps {
    initialData?: Partial<InterviewFormData>;
    onSubmit?: (data: InterviewFormData) => void;
    onCancel?: () => void;
}

export function CreateInterviewForm({ initialData, onSubmit, onCancel }: CreateInterviewFormProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [previewQuestion, setPreviewQuestion] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const form = useForm<InterviewFormValues>({
        resolver: zodResolver(interviewSchema),
        defaultValues: {
            title: '',
            description: '',
            companyId: '',
            duration: 30,
            maxAttemptCount: 3,
            allowRetake: true,
            showQuestions: false,
            isPublic: false,
            welcomeMessage: 'Welcome to our video interview! Please take your time to answer each question thoroughly.',
            thankYouMessage: 'Thank you for completing our interview. We will review your responses and get back to you soon.',
            questions: [
                {
                    type: 'video',
                    questionText: 'Tell us about yourself and your experience.',
                    maxDuration: 120,
                    prepTime: 30,
                    maxRetries: 3,
                    isRequired: true,
                },
            ],
            ...initialData,
        },
    });

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: 'questions',
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = fields.findIndex((field) => field.id === active.id);
            const newIndex = fields.findIndex((field) => field.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                move(oldIndex, newIndex);
            }
        }
    };

    const addQuestion = (type: QuestionType) => {
        const newQuestion: QuestionFormData = {
            type,
            questionText: '',
            maxDuration: type === 'video' ? 120 : undefined,
            prepTime: type === 'video' ? 30 : undefined,
            maxRetries: 3,
            isRequired: true,
            options: type === 'multiple_choice' ? [''] : undefined,
        };

        append(newQuestion as any);
    };

    const removeQuestion = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const duplicateQuestion = (index: number) => {
        const question = form.getValues(`questions.${index}`);
        append({ ...question, id: undefined } as any);
    };

    const handleSubmit = (data: InterviewFormValues) => {
        // Format data untuk submission
        const formattedData: InterviewFormData = {
            ...data,
            questions: data.questions.map((q, index) => ({
                ...q,
                orderIndex: index,
            })),
        };

        onSubmit?.(formattedData);
    };

    // Mock company data - akan diganti dengan API call
    const companies = [
        { id: '1', name: 'TechCorp Solutions' },
        { id: '2', name: 'Global Finance Inc' },
        { id: '3', name: 'HealthTech Innovations' },
    ];

    const questionTypeOptions = [
        { value: 'video', label: 'Video Response', icon: Video, description: 'Candidates record video answers' },
        { value: 'text', label: 'Text Response', icon: <span className="font-mono">T</span>, description: 'Candidates type written answers' },
        { value: 'multiple_choice', label: 'Multiple Choice', icon: <span className="font-mono">✓</span>, description: 'Candidates select from predefined options' },
    ];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Interview Details</TabsTrigger>
                            <TabsTrigger value="questions">Questions</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Provide the basic details about your video interview
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Interview Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Senior Frontend Developer Interview" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe what this interview covers and who it's for..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="companyId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a company" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {companies.map((company) => (
                                                            <SelectItem key={company.id} value={company.id}>
                                                                {company.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estimated Duration (minutes)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="30"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Estimated time for candidates to complete all questions
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Candidate Messages</CardTitle>
                                    <CardDescription>
                                        Customize messages shown to candidates during the interview
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="welcomeMessage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Welcome Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Message shown to candidates before starting..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="thankYouMessage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Thank You Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Message shown after candidates complete the interview..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="questions" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Interview Questions</CardTitle>
                                            <CardDescription>
                                                Add and arrange questions for candidates to answer
                                            </CardDescription>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Question
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Choose Question Type</DialogTitle>
                                                    <DialogDescription>
                                                        Select the type of question you want to add
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    {questionTypeOptions.map((option) => (
                                                        <Button
                                                            key={option.value}
                                                            variant="outline"
                                                            className="h-auto p-4 justify-start"
                                                            onClick={() => {
                                                                addQuestion(option.value as QuestionType);
                                                                // Close dialog
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                                                                    {option.icon}
                                                                </div>
                                                                <div className="text-left">
                                                                    <div className="font-medium">{option.label}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {option.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                                            <div className="space-y-4">
                                                {fields.map((field, index) => (
                                                    <SortableItem key={field.id} id={field.id}>
                                                        <QuestionEditor
                                                            index={index}
                                                            onRemove={() => removeQuestion(index)}
                                                            onDuplicate={() => duplicateQuestion(index)}
                                                            onPreview={() => setPreviewQuestion(index)}
                                                            form={form}
                                                        />
                                                    </SortableItem>
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>

                                    {fields.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                            <Video className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                            <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Add your first question to get started
                                            </p>
                                            <Button onClick={() => addQuestion('video')}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Question
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Interview Settings</CardTitle>
                                    <CardDescription>
                                        Configure how candidates interact with your interview
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="maxAttemptCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Max Recording Attempts per Question</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Number of times candidates can re-record their answers
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="allowRetake"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Allow Interview Retake</FormLabel>
                                                    <FormDescription>
                                                        Candidates can restart the entire interview if needed
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="showQuestions"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Show Questions During Recording</FormLabel>
                                                    <FormDescription>
                                                        Display question text while candidates record their answers
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isPublic"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Public Interview</FormLabel>
                                                    <FormDescription>
                                                        Allow anyone with the link to access this interview
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                            <CardDescription>
                                Review your interview configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Questions</span>
                                    <span className="font-medium">{fields.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estimated Duration</span>
                                    <span className="font-medium">{form.watch('duration') || 30} minutes</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Max Attempts</span>
                                    <span className="font-medium">{form.watch('maxAttemptCount')} per question</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Retake Allowed</span>
                                    <Badge variant={form.watch('allowRetake') ? 'default' : 'secondary'}>
                                        {form.watch('allowRetake') ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Question Types</h4>
                                <div className="flex flex-wrap gap-2">
                                    {form.watch('questions').map((q, i) => (
                                        <Badge key={i} variant="outline" className="capitalize">
                                            {q.type.replace('_', ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => form.reset()}
                            >
                                Reset Form
                            </Button>

                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>
                            )}

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Creating...' : 'Create Interview'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}

interface QuestionEditorProps {
    index: number;
    onRemove: () => void;
    onDuplicate: () => void;
    onPreview: () => void;
    form: ReturnType<typeof useForm<InterviewFormValues>>;
}

function QuestionEditor({ index, onRemove, onDuplicate, onPreview, form }: QuestionEditorProps) {
    const questionType = form.watch(`questions.${index}.type`);

    return (
        <Card className="relative">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Question {index + 1}
                        </span>
                        <Badge variant="outline" className="capitalize">
                            {questionType.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onPreview}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onDuplicate}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onRemove}
                            disabled={form.getValues('questions').length <= 1}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name={`questions.${index}.questionText`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter your question here..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`questions.${index}.description`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional context or instructions for candidates..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {questionType === 'video' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`questions.${index}.maxDuration`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Duration (seconds)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="120"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`questions.${index}.prepTime`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preparation Time (seconds)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="30"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name={`questions.${index}.maxRetries`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Retries</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="10"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`questions.${index}.isRequired`}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Required</FormLabel>
                                    <FormDescription className="text-xs">
                                        Candidates must answer this question
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}