const { PrismaClient } = require('@prisma/client');
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
      scope: 'PROJECT',
      entityType: 'TASK',
      triggerEvent: 'CREATED',
      runMode: 'AUTOMATIC',
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
      scope: 'TEAM',
      entityType: 'TASK',
      triggerEvent: 'CREATED',
      runMode: 'AUTOMATIC',
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
      scope: 'PROJECT',
      entityType: 'TASK',
      triggerEvent: 'STATUS_CHANGED',
      runMode: 'AUTOMATIC',
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
      scope: 'PROJECT',
      entityType: 'TASK',
      triggerEvent: 'CREATED',
      runMode: 'AUTOMATIC',
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
      scope: 'ORGANIZATION',
      entityType: 'TASK',
      triggerEvent: 'DUE_DATE_PASSED',
      runMode: 'AUTOMATIC',
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
      scope: 'PROJECT',
      entityType: 'TASK',
      triggerEvent: 'CREATED',
      runMode: 'AUTOMATIC',
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
      scope: 'PROJECT',
      entityType: 'TASK',
      triggerEvent: 'COMPLETED',
      runMode: 'AUTOMATIC',
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
      scope: 'ORGANIZATION',
      entityType: 'TASK',
      triggerEvent: 'FIELD_CHANGED',
      runMode: 'AUTOMATIC',
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
      scope: 'PROJECT',
      entityType: 'TASK',
      triggerEvent: 'STATUS_CHANGED',
      runMode: 'AUTOMATIC',
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
      scope: '
