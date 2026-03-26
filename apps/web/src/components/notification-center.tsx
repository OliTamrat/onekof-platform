'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  ListChecks,
  Target,
  BarChart3,
  Users,
  FileText,
  Zap,
  MessageSquare,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface Notification {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'comment' | 'budget_alert' | 'goal_update' | 'team_invite' | 'document_processed' | 'automation_triggered' | 'expense_approved' | 'mention';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

const typeConfig: Record<
  Notification['type'],
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  task_assigned: { icon: ListChecks, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  task_completed: { icon: Check, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  comment: { icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  budget_alert: { icon: BarChart3, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  goal_update: { icon: Target, color: 'text-primary-500', bgColor: 'bg-primary-50 dark:bg-primary-900/20' },
  team_invite: { icon: Users, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
  document_processed: { icon: FileText, color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20' },
  automation_triggered: { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
  expense_approved: { icon: BarChart3, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  mention: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
};

// Sample notifications for initial state (in production, fetched from API)
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'New task assigned',
    message: 'You were assigned to "Update API documentation" in Project Alpha',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    link: '/dashboard/issues',
  },
  {
    id: '2',
    type: 'budget_alert',
    title: 'Budget threshold reached',
    message: 'Project Beta budget has reached 80% utilization',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    link: '/dashboard/budget',
  },
  {
    id: '3',
    type: 'comment',
    title: 'New comment',
    message: 'Sarah commented on "Fix login validation bug"',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    link: '/dashboard/issues',
  },
  {
    id: '4',
    type: 'goal_update',
    title: 'Goal progress updated',
    message: '"Q1 Revenue Target" is now at 75% completion',
    read: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    link: '/dashboard/goals',
  },
  {
    id: '5',
    type: 'document_processed',
    title: 'Document processed',
    message: 'AI extraction completed for "Q4 Invoice Bundle.pdf" — 12 items found',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    link: '/dashboard/documents',
  },
];

export function NotificationCenter() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>(sampleNotifications);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative h-9 w-9 rounded-lg',
          'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
          'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
          isOpen && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-white'
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[400px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#1D2125]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 h-auto px-2 py-1 text-xs text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-200 px-2 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={() => setFilter('all')}
              className={cn(
                'h-auto rounded-none px-3 py-2 text-xs font-medium',
                filter === 'all'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              All
            </Button>
            <Button
              variant="ghost"
              onClick={() => setFilter('unread')}
              className={cn(
                'h-auto rounded-none flex items-center gap-1.5 px-3 py-2 text-xs font-medium',
                filter === 'unread'
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              Unread
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {filter === 'unread' ? 'You\'re all caught up!' : 'We\'ll notify you when something happens.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                return (
                  <Button
                    key={notification.id}
                    variant="ghost"
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'group flex w-full h-auto items-start gap-3 rounded-none px-4 py-3 text-left',
                      'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      !notification.read && 'bg-primary-50/30 dark:bg-primary-900/5'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        config.bgColor
                      )}
                    >
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm',
                            notification.read
                              ? 'text-slate-600 dark:text-slate-400'
                              : 'font-medium text-slate-900 dark:text-white'
                          )}
                        >
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => removeNotification(notification.id, e)}
                          className="shrink-0 h-auto w-auto rounded p-0.5 opacity-0 transition-opacity hover:bg-slate-200 group-hover:opacity-100 dark:hover:bg-slate-700"
                        >
                          <X className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notification.read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                    )}
                  </Button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 py-2.5 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={() => {
                router.push('/dashboard/notifications');
                setIsOpen(false);
              }}
              className="w-full h-auto rounded-lg py-1.5 text-center text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
