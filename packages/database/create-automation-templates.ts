import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 Creating 20 automation rule templates inspired by Jira...\n');

  const org = await prisma.organization.findFirst();
  const user = await prisma.user.findFirst();

  if (!org || !user) {
    console.error('No organization or user found');
    return;
  }

  // 20 Automation Rule Templates for Different Sectors
  const templates = [
    {
      name: 'Auto-assign to team lead when issue created',
      description: 'Automatically assign new issues to the team lead',
      icon: 'UserPlus',
      color: '#3B82F6',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'CREATED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'type', operator: 'equals', value: 'BUG' }
      ]),
      actions: JSON.stringify([
        { type: 'assign_to_team_lead', params: {} }
      ]),
      naturalLanguage: 'When a bug is created, assign it to the team lead',
    },
    {
      name: 'Send Slack notification for high priority tasks',
      description: 'Notify team on Slack when high priority task is created',
      icon: 'Bell',
      color: '#EF4444',
      isTemplate: true,
      scope: 'TEAM' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'CREATED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'priority', operator: 'in', value: ['HIGHEST', 'HIGH'] }
      ]),
      actions: JSON.stringify([
        { type: 'send_slack_notification', params: { channel: '#urgent-tasks', message: 'New high priority task created' } }
      ]),
      naturalLanguage: 'When a high priority task is created, send Slack notification',
    },
    {
      name: 'Move to QA when development complete',
      description: 'Automatically move task to QA when marked as done by developer',
      icon: 'CheckCircle2',
      color: '#10B981',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'STATUS_CHANGED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'status', operator: 'equals', value: 'DONE' },
        { field: 'type', operator: 'in', value: ['TASK', 'STORY'] }
      ]),
      actions: JSON.stringify([
        { type: 'change_status', params: { newStatus: 'IN_REVIEW' } },
        { type: 'assign_to_team', params: { teamName: 'QA Team' } }
      ]),
      naturalLanguage: 'When development is done, move to QA review',
    },
    {
      name: 'Add label based on keywords',
      description: 'Automatically tag tasks with labels based on title/description keywords',
      icon: 'Tag',
      color: '#F59E0B',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'CREATED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 2,
      conditions: JSON.stringify([
        { field: 'title', operator: 'contains', value: 'API' }
      ]),
      actions: JSON.stringify([
        { type: 'add_label', params: { label: 'backend' } }
      ]),
      naturalLanguage: 'When task title contains "API", add backend label',
    },
    {
      name: 'Escalate overdue tasks',
      description: 'Notify manager when task is overdue by 3 days',
      icon: 'AlertTriangle',
      color: '#EF4444',
      isTemplate: true,
      scope: 'ORGANIZATION' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'DUE_DATE_PASSED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'days_overdue', operator: 'greater_than', value: 3 }
      ]),
      actions: JSON.stringify([
        { type: 'send_email', params: { to: 'manager', subject: 'Overdue Task Alert' } },
        { type: 'change_priority', params: { newPriority: 'HIGHEST' } }
      ]),
      naturalLanguage: 'Escalate tasks overdue by more than 3 days to manager',
    },
    {
      name: 'Create subtasks from template',
      description: 'Auto-create standard subtasks when epic is created',
      icon: 'ListTree',
      color: '#8B5CF6',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'CREATED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'type', operator: 'equals', value: 'EPIC' }
      ]),
      actions: JSON.stringify([
        { type: 'create_subtasks', params: { tasks: ['Planning', 'Development', 'Testing', 'Documentation'] } }
      ]),
      naturalLanguage: 'When epic is created, add standard subtasks',
    },
    {
      name: 'Auto-close related tasks',
      description: 'Close all subtasks when parent task is completed',
      icon: 'CheckCheck',
      color: '#10B981',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'COMPLETED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'has_subtasks', operator: 'equals', value: true }
      ]),
      actions: JSON.stringify([
        { type: 'close_subtasks', params: {} }
      ]),
      naturalLanguage: 'When parent task completes, close all subtasks',
    },
    {
      name: 'Require approval for budget changes',
      description: 'Send for manager approval when budget is increased',
      icon: 'DollarSign',
      color: '#F59E0B',
      isTemplate: true,
      scope: 'ORGANIZATION' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'FIELD_CHANGED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'budget', operator: 'increased', value: true }
      ]),
      actions: JSON.stringify([
        { type: 'request_approval', params: { approver: 'manager', reason: 'Budget increase' } }
      ]),
      naturalLanguage: 'Require approval when task budget is increased',
    },
    {
      name: 'Log time automatically',
      description: 'Auto-log time when task moves from In Progress to Done',
      icon: 'Clock',
      color: '#06B6D4',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'STATUS_CHANGED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'previousStatus', operator: 'equals', value: 'IN_PROGRESS' },
        { field: 'status', operator: 'equals', value: 'DONE' }
      ]),
      actions: JSON.stringify([
        { type: 'log_time', params: { useEstimate: true } }
      ]),
      naturalLanguage: 'Auto-log estimated time when task is completed',
    },
    {
      name: 'Send deadline reminder',
      description: 'Remind assignee 2 days before due date',
      icon: 'CalendarClock',
      color: '#8B5CF6',
      isTemplate: true,
      scope: 'ORGANIZATION' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'DUE_DATE_APPROACHING' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'days_until_due', operator: 'equals', value: 2 }
      ]),
      actions: JSON.stringify([
        { type: 'send_email', params: { to: 'assignee', subject: 'Task Due in 2 Days' } }
      ]),
      naturalLanguage: 'Remind assignee 2 days before task is due',
    },
    {
      name: 'Archive completed sprints',
      description: 'Auto-archive sprint when all tasks are done',
      icon: 'Archive',
      color: '#64748B',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'MILESTONE' as const,
      triggerEvent: 'PROGRESS_THRESHOLD_REACHED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'completion', operator: 'equals', value: 100 }
      ]),
      actions: JSON.stringify([
        { type: 'archive_milestone', params: {} }
      ]),
      naturalLanguage: 'Archive sprint when 100% complete',
    },
    {
      name: 'Update parent task progress',
      description: 'Recalculate parent progress when subtask status changes',
      icon: 'TrendingUp',
      color: '#10B981',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'STATUS_CHANGED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 2,
      conditions: JSON.stringify([
        { field: 'has_parent', operator: 'equals', value: true }
      ]),
      actions: JSON.stringify([
        { type: 'update_parent_progress', params: {} }
      ]),
      naturalLanguage: 'Update parent task progress when subtask changes',
    },
    {
      name: 'Assign to on-call engineer',
      description: 'Route production bugs to on-call rotation',
      icon: 'PhoneCall',
      color: '#EF4444',
      isTemplate: true,
      scope: 'ORGANIZATION' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'CREATED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'type', operator: 'equals', value: 'BUG' },
        { field: 'priority', operator: 'equals', value: 'HIGHEST' },
        { field: 'labels', operator: 'contains', value: 'production' }
      ]),
      actions: JSON.stringify([
        { type: 'assign_to_on_call', params: { team: 'Engineering' } }
      ]),
      naturalLanguage: 'Assign critical production bugs to on-call engineer',
    },
    {
      name: 'Create documentation task',
      description: 'Auto-create docs task when feature is completed',
      icon: 'FileText',
      color: '#06B6D4',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'COMPLETED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'type', operator: 'equals', value: 'STORY' },
        { field: 'labels', operator: 'contains', value: 'needs-docs' }
      ]),
      actions: JSON.stringify([
        { type: 'create_task', params: { title: 'Document: {{task.title}}', type: 'TASK', assignee: 'tech-writer' } }
      ]),
      naturalLanguage: 'Create documentation task when feature completes',
    },
    {
      name: 'Block task if dependencies incomplete',
      description: 'Prevent task from moving to In Progress if dependencies not done',
      icon: 'Ban',
      color: '#EF4444',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'STATUS_CHANGED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'status', operator: 'equals', value: 'IN_PROGRESS' },
        { field: 'blocked_by_incomplete_deps', operator: 'equals', value: true }
      ]),
      actions: JSON.stringify([
        { type: 'block_transition', params: { reason: 'Dependencies not complete' } },
        { type: 'add_comment', params: { text: 'Cannot start - dependencies incomplete' } }
      ]),
      naturalLanguage: 'Block task if dependencies are not done',
    },
    {
      name: 'Sync with external tools',
      description: 'Update Jira/GitHub when task status changes',
      icon: 'RefreshCw',
      color: '#8B5CF6',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'STATUS_CHANGED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 2,
      conditions: JSON.stringify([
        { field: 'external_id', operator: 'not_empty', value: true }
      ]),
      actions: JSON.stringify([
        { type: 'sync_external', params: { tool: 'jira', syncField: 'status' } }
      ]),
      naturalLanguage: 'Sync status changes to external tools',
    },
    {
      name: 'Add watchers based on mentions',
      description: 'Auto-add users as watchers when mentioned in comments',
      icon: 'Eye',
      color: '#10B981',
      isTemplate: true,
      scope: 'ORGANIZATION' as const,
      entityType: 'COMMENT' as const,
      triggerEvent: 'CREATED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'content', operator: 'contains_mention', value: true }
      ]),
      actions: JSON.stringify([
        { type: 'add_mentioned_as_watchers', params: {} }
      ]),
      naturalLanguage: 'Add mentioned users as watchers',
    },
    {
      name: 'Smart priority adjustment',
      description: 'Increase priority if task blocked for >5 days',
      icon: 'Zap',
      color: '#F59E0B',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'TASK' as const,
      triggerEvent: 'BLOCKED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'blocked_days', operator: 'greater_than', value: 5 }
      ]),
      actions: JSON.stringify([
        { type: 'increase_priority', params: {} },
        { type: 'notify_manager', params: { message: 'Task blocked for >5 days' } }
      ]),
      naturalLanguage: 'Escalate priority if blocked >5 days',
    },
    {
      name: 'Budget threshold alert',
      description: 'Alert when project budget utilization exceeds 80%',
      icon: 'AlertCircle',
      color: '#EF4444',
      isTemplate: true,
      scope: 'PROJECT' as const,
      entityType: 'MILESTONE' as const,
      triggerEvent: 'BUDGET_THRESHOLD_REACHED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'budget_percentage', operator: 'greater_than', value: 80 }
      ]),
      actions: JSON.stringify([
        { type: 'send_alert', params: { to: 'project-manager', severity: 'high' } },
        { type: 'create_task', params: { title: 'Review Budget Utilization', priority: 'HIGH' } }
      ]),
      naturalLanguage: 'Alert project manager when budget exceeds 80%',
    },
    {
      name: 'Celebrate milestones',
      description: 'Send congratulations when major milestone reached',
      icon: 'PartyPopper',
      color: '#10B981',
      isTemplate: true,
      scope: 'TEAM' as const,
      entityType: 'MILESTONE' as const,
      triggerEvent: 'COMPLETED' as const,
      runMode: 'AUTOMATIC' as const,
      executionOrder: 1,
      conditions: JSON.stringify([
        { field: 'is_major_milestone', operator: 'equals', value: true }
      ]),
      actions: JSON.stringify([
        { type: 'send_slack_celebration', params: { channel: '#general', gif: 'celebration' } },
        { type: 'create_achievement', params: { type: 'milestone_complete' } }
      ]),
      naturalLanguage: 'Celebrate when major milestone is reached',
    },
  ];

  // Create all automation rules
  for (const template of templates) {
    await prisma.automationRule.create({
      data: {
        ...template,
        organizationId: org.id,
        createdBy: user.id,
      },
    });
  }

  console.log(`✅ Created ${templates.length} automation rule templates\n`);

  const count = await prisma.automationRule.count({ where: { isTemplate: true } });
  console.log(`📊 Total automation templates: ${count}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
