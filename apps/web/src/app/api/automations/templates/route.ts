import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Pre-built automation templates
const AUTOMATION_TEMPLATES = [
  {
    id: 'auto-assign-new-tasks',
    name: 'Auto-assign new tasks',
    description: 'Automatically assign new tasks to team members based on workload',
    category: 'Task Management',
    icon: 'UserPlus',
    color: '#10B981',
    entityType: 'TASK',
    triggerEvent: 'CREATED',
    scope: 'PROJECT',
    runMode: 'AUTOMATIC',
    conditions: [
      {
        field: 'assigneeId',
        operator: 'is_empty',
        value: null,
      },
    ],
    actions: [
      {
        type: 'assign_to_user',
        params: {
          strategy: 'least_workload', // Will be resolved at activation
        },
      },
    ],
    estimatedTimeSaved: 2, // hours per week
    popularity: 95,
  },
  {
    id: 'notify-overdue-tasks',
    name: 'Notify on overdue tasks',
    description: 'Send notification when a task becomes overdue',
    category: 'Notifications',
    icon: 'Bell',
    color: '#EF4444',
    entityType: 'TASK',
    triggerEvent: 'DUE_DATE_PASSED',
    scope: 'ORGANIZATION',
    runMode: 'AUTOMATIC',
    conditions: [
      {
        field: 'status',
        operator: 'not_equals',
        value: 'COMPLETED',
      },
    ],
    actions: [
      {
        type: 'send_notification',
        params: {
          recipients: ['assignee', 'project_lead'],
          message: 'Task "{{task.title}}" is overdue',
        },
      },
      {
        type: 'change_status',
        params: {
          status: 'AT_RISK',
        },
      },
    ],
    estimatedTimeSaved: 3,
    popularity: 88,
  },
  {
    id: 'auto-close-completed-tasks',
    name: 'Auto-close completed tasks',
    description: 'Automatically move tasks to Done when all subtasks are completed',
    category: 'Task Management',
    icon: 'CheckCircle',
    color: '#10B981',
    entityType: 'TASK',
    triggerEvent: 'UPDATED',
    scope: 'ORGANIZATION',
    runMode: 'AUTOMATIC',
    conditions: [
      {
        field: 'subtasks_completed',
        operator: 'equals',
        value: true,
      },
      {
        field: 'status',
        operator: 'not_equals',
        value: 'COMPLETED',
      },
    ],
    actions: [
      {
        type: 'change_status',
        params: {
          status: 'COMPLETED',
        },
      },
      {
        type: 'add_comment',
        params: {
          comment: '✅ All subtasks completed - automatically moving to Done',
        },
      },
    ],
    estimatedTimeSaved: 1.5,
    popularity: 76,
  },
  {
    id: 'escalate-high-priority',
    name: 'Escalate high-priority tasks',
    description: 'Notify project lead when high-priority task is created',
    category: 'Escalation',
    icon: 'AlertTriangle',
    color: '#F59E0B',
    entityType: 'TASK',
    triggerEvent: 'CREATED',
    scope: 'ORGANIZATION',
    runMode: 'AUTOMATIC',
    conditions: [
      {
        field: 'priority',
        operator: 'equals',
        value: 'HIGH',
      },
    ],
    actions: [
      {
        type: 'send_notification',
        params: {
          recipients: ['project_lead', 'team_lead'],
          message: '🚨 High-priority task created: "{{task.title}}"',
        },
      },
      {
        type: 'add_comment',
        params: {
          comment: '⚡ High-priority task - requires immediate attention',
        },
      },
    ],
    estimatedTimeSaved: 2.5,
    popularity: 82,
  },
  {
    id: 'sync-goal-progress',
    name: 'Sync goal progress with projects',
    description: 'Update goal progress when linked project status changes',
    category: 'Goal Tracking',
    icon: 'Target',
    color: '#8B5CF6',
    entityType: 'PROJECT',
    triggerEvent: 'STATUS_CHANGED',
    scope: 'ORGANIZATION',
    runMode: 'AUTOMATIC',
    conditions: [
      {
        field: 'linked_goal',
        operator: 'is_not_empty',
        value: null,
      },
    ],
    actions: [
      {
        type: 'update_goal_progress',
        params: {
          calculation: 'weighted_average',
        },
      },
    ],
    estimatedTimeSaved: 4,
    popularity: 91,
  },
  {
    id: 'welcome-new-team-member',
    name: 'Welcome new team members',
    description: 'Send welcome message and assign onboarding tasks to new members',
    category: 'Team Management',
    icon: 'Users',
    color: '#3B82F6',
    entityType: 'TEAM_MEMBER',
    triggerEvent: 'MEMBER_ADDED',
    scope: 'TEAM',
    runMode: 'AUTOMATIC',
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        params: {
          recipients: ['new_member'],
          message: '👋 Welcome to the team! Check your onboarding tasks.',
        },
      },
      {
        type: 'create_task',
        params: {
          title: 'Complete onboarding checklist',
          assignee: 'new_member',
          priority: 'MEDIUM',
        },
      },
    ],
    estimatedTimeSaved: 1,
    popularity: 68,
  },
  {
    id: 'milestone-alert',
    name: 'Milestone approaching alert',
    description: 'Send reminder 3 days before milestone due date',
    category: 'Project Management',
    icon: 'Calendar',
    color: '#EC4899',
    entityType: 'MILESTONE',
    triggerEvent: 'MILESTONE_APPROACHING',
    scope: 'PROJECT',
    runMode: 'SCHEDULED',
    conditions: [
      {
        field: 'days_until_due',
        operator: 'less_than',
        value: 3,
      },
      {
        field: 'status',
        operator: 'not_equals',
        value: 'COMPLETED',
      },
    ],
    actions: [
      {
        type: 'send_notification',
        params: {
          recipients: ['project_lead', 'team_members'],
          message: '📅 Milestone "{{milestone.title}}" is due in {{days_until_due}} days',
        },
      },
    ],
    estimatedTimeSaved: 2,
    popularity: 74,
  },
  {
    id: 'budget-threshold-alert',
    name: 'Budget threshold alert',
    description: 'Alert when project budget reaches 80% of allocated amount',
    category: 'Financial',
    icon: 'DollarSign',
    color: '#F59E0B',
    entityType: 'PROJECT',
    triggerEvent: 'BUDGET_THRESHOLD_REACHED',
    scope: 'PROJECT',
    runMode: 'AUTOMATIC',
    conditions: [
      {
        field: 'budget_percentage',
        operator: 'greater_than',
        value: 80,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        params: {
          recipients: ['project_lead', 'finance_team'],
          message: '💰 Budget alert: Project has used {{budget_percentage}}% of allocated budget',
        },
      },
      {
        type: 'update_field',
        params: {
          field: 'status',
          value: 'AT_RISK',
        },
      },
    ],
    estimatedTimeSaved: 3,
    popularity: 85,
  },
  {
    id: 'auto-archive-old-projects',
    name: 'Auto-archive completed projects',
    description: 'Archive projects 30 days after completion',
    category: 'Project Management',
    icon: 'Archive',
    color: '#6B7280',
    entityType: 'PROJECT',
    triggerEvent: 'SCHEDULED_TIME',
    scope: 'ORGANIZATION',
    runMode: 'SCHEDULED',
    conditions: [
      {
        field: 'status',
        operator: 'equals',
        value: 'COMPLETED',
      },
      {
        field: 'days_since_completion',
        operator: 'greater_than',
        value: 30,
      },
    ],
    actions: [
      {
        type: 'archive_project',
        params: {},
      },
      {
        type: 'send_notification',
        params: {
          recipients: ['project_lead'],
          message: '📦 Project "{{project.name}}" has been automatically archived',
        },
      },
    ],
    estimatedTimeSaved: 1,
    popularity: 62,
  },
  {
    id: 'slack-daily-standup',
    name: 'Daily standup reminder',
    description: 'Send daily standup reminder to team every morning',
    category: 'Team Management',
    icon: 'MessageSquare',
    color: '#8B5CF6',
    entityType: 'TEAM',
    triggerEvent: 'SCHEDULED_TIME',
    scope: 'TEAM',
    runMode: 'SCHEDULED',
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        params: {
          recipients: ['team_members'],
          message: '🌅 Good morning! Daily standup in 15 minutes. What did you accomplish yesterday?',
        },
      },
    ],
    estimatedTimeSaved: 0.5,
    popularity: 58,
  },
];

// GET /api/automations/templates - Get all automation templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const entityType = searchParams.get('entityType');

    let templates = AUTOMATION_TEMPLATES;

    // Filter by category
    if (category) {
      templates = templates.filter((t) => t.category === category);
    }

    // Filter by entity type
    if (entityType) {
      templates = templates.filter((t) => t.entityType === entityType);
    }

    // Sort by popularity
    templates.sort((a, b) => b.popularity - a.popularity);

    // Get unique categories
    const categories = [...new Set(AUTOMATION_TEMPLATES.map((t) => t.category))];

    return NextResponse.json({
      templates,
      categories,
      total: templates.length,
    });
  } catch (error) {
    console.error('Error fetching automation templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation templates' },
      { status: 500 }
    );
  }
}
