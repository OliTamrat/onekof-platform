'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { Bell, CheckCircle2, AlertCircle, Info, Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'mention';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'team' | 'project' | 'system' | 'budget';
}

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Mock notifications data
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'mention',
      title: 'You were mentioned in a comment',
      message: 'John mentioned you in "Water Dam Project" discussion',
      timestamp: '2 hours ago',
      read: false,
      category: 'project',
    },
    {
      id: '2',
      type: 'success',
      title: 'Budget approved',
      message: 'Your budget request for Q1 2026 has been approved',
      timestamp: '5 hours ago',
      read: false,
      category: 'budget',
    },
    {
      id: '3',
      type: 'info',
      title: 'Team member added',
      message: 'Sarah Johnson joined your team',
      timestamp: '1 day ago',
      read: true,
      category: 'team',
    },
    {
      id: '4',
      type: 'warning',
      title: 'Deadline approaching',
      message: 'Project milestone due in 3 days',
      timestamp: '1 day ago',
      read: true,
      category: 'project',
    },
    {
      id: '5',
      type: 'info',
      title: 'System update',
      message: 'New features have been added to the platform',
      timestamp: '2 days ago',
      read: true,
      category: 'system',
    },
  ]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'mention':
        return <Users className="h-5 w-5 text-purple-500" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'project':
        return <FileText className="h-4 w-4" />;
      case 'budget':
        return <TrendingUp className="h-4 w-4" />;
      case 'system':
        return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                All
              </Button>
              <Button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'unread'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No notifications to display</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? 'bg-white dark:bg-[#22272B] border-gray-200 dark:border-slate-700'
                      : 'bg-blue-50 dark:bg-[#1B2838] border-blue-200 dark:border-[#2C4A6A]'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryIcon(notification.category)}
                        <span className="capitalize">{notification.category}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
