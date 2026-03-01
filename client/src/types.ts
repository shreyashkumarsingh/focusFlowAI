// client/src/types.ts

export interface User {
    _id: string;
    name: string;
    email: string;
    token: string;
    bio?: string;
    avatar?: string;
    preferences?: UserPreferences;
    stats?: UserStats;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    defaultPomodoroLength: number;
    defaultBreakLength: number;
    notifications: boolean;
    weekStartDay: 'sunday' | 'monday';
}

export interface UserStats {
    totalTasksCompleted: number;
    totalFocusMinutes: number;
    streak: number;
    lastActiveDate?: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    estimatedMinutes: number;
    actualMinutesSpent: number;
    createdAt: string;
    updatedAt?: string;
    dueDate?: string;
    category?: 'work' | 'personal' | 'health' | 'learning' | 'other';
    tags?: string[];
    isRecurring?: boolean;
    recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'none';
    notes?: string;
    subtasks?: Subtask[];
    focusSessions?: FocusSession[];
}

export interface Subtask {
    _id?: string;
    title: string;
    completed: boolean;
}

export interface FocusSession {
    startedAt: string;
    duration: number;
    completed: boolean;
}

export interface Statistics {
    overview: {
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        todoTasks: number;
        completionRate: number;
        totalFocusMinutes: number;
        totalEstimatedMinutes: number;
        totalFocusHours: string;
    };
    categoryStats: Record<string, { total: number; completed: number }>;
    priorityStats: {
        high: number;
        medium: number;
        low: number;
    };
    recentActivity: {
        tasksCreated: number;
        tasksCompleted: number;
    };
}

export interface BurnoutAnalysis {
    risk_level: 'low' | 'medium' | 'high' | 'unknown';
    risk_score: number;
    factors: string[];
    metrics?: {
        completion_rate: number;
        avg_estimation_error: number;
        intensity_ratio: number;
    };
}

export interface TaskPrediction {
    predicted_minutes: number;
    confidence: 'low' | 'medium' | 'high';
    suggestion: string;
    historical_avg_ratio?: number;
}

export interface ProductivityInsights {
    insights: string[];
}