'use client';

import {
  SlideoutPanel,
  SlideoutPanelContent,
  SlideoutPanelSection,
} from '@/components/ui/slideout-panel';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  GitCommit,
  MessageSquare,
  FileText,
  Plus,
} from 'lucide-react';

interface ProjectDetailModalProps {
  open: boolean;
  onClose: () => void;
  project: any;
  type: 'metric' | 'project' | 'activity' | 'milestone';
  data?: any;
}

export function ProjectDetailModal({ open, onClose, project, type, data }: ProjectDetailModalProps) {
  if (type === 'metric') {
    return (
      <SlideoutPanel open={open} onClose={onClose} title={data?.title || 'Metric Details'} size="lg">
        <SlideoutPanelContent>
          <div className="space-y-6">
            {/* Metric Overview */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.current || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Current</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {data?.change >= 0 ? '+' : ''}{data?.change || 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Change</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.previous || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Previous</div>
                </div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Breakdown</h3>
              <div className="space-y-3">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: Math.floor(Math.random() * 10) + 5,
                    change: Math.floor(Math.random() * 20) - 10,
                  };
                }).map((day, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{day.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{day.value}</span>
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        day.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        <TrendingUp className={`h-3 w-3 ${day.change < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(day.change)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {['Sarah Johnson', 'Mike Chen', 'Alex Kumar'].map((name, index) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {Math.floor(Math.random() * 20) + 10} contributions
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideoutPanelContent>
      </SlideoutPanel>
    );
  }

  if (type === 'project') {
    return (
      <SlideoutPanel open={open} onClose={onClose} title={project?.name || 'Project Details'} size="xl">
        <SlideoutPanelContent>
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Completed</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project?.tasksCompleted || 45}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-400">In Progress</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Team Members</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project?.memberCount || 8}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Blocked</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Activity Timeline</h3>
              <div className="space-y-6">
                {[
                  { time: '2 hours ago', user: 'Sarah Johnson', action: 'completed task', task: 'User authentication flow', type: 'completed' },
                  { time: '5 hours ago', user: 'Mike Chen', action: 'created milestone', task: 'Beta Release Checkpoint', type: 'milestone' },
                  { time: '8 hours ago', user: 'Alex Kumar', action: 'commented on', task: 'API endpoint documentation', type: 'comment' },
                  { time: '1 day ago', user: 'Emma Davis', action: 'updated task', task: 'Design system components', type: 'updated' },
                  { time: '1 day ago', user: 'John Smith', action: 'assigned task to', task: 'Sarah Johnson', type: 'assigned' },
                ].map((activity, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        activity.type === 'completed' ? 'bg-green-500/20' :
                        activity.type === 'milestone' ? 'bg-purple-500/20' :
                        activity.type === 'comment' ? 'bg-blue-500/20' :
                        'bg-orange-500/20'
                      }`}>
                        {activity.type === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {activity.type === 'milestone' && <Clock className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'updated' && <GitCommit className="h-4 w-4 text-orange-500" />}
                        {activity.type === 'assigned' && <Users className="h-4 w-4 text-blue-500" />}
                      </div>
                      {index < 4 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-slate-700 mt-2" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        <span className="text-gray-600 dark:text-slate-400">{activity.action}</span>{' '}
                        <span className="font-semibold">{activity.task}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Members</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Sarah Johnson', 'Mike Chen', 'Alex Kumar', 'Emma Davis', 'John Smith', 'Lisa Anderson'].map((name) => (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1B1F23]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {Math.floor(Math.random() * 15) + 5} tasks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideoutPanelContent>
      </SlideoutPanel>
    );
  }

  if (type === 'activity') {
    return (
      <SlideoutPanel open={open} onClose={onClose} title={`${data?.month} Activity Details`} size="lg">
        <SlideoutPanelContent>
          <div className="space-y-6">
            {/* Month Overview */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-500/10">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data?.created || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">Projects Created</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{data?.completed || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">Projects Completed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{data?.total || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">Total Activity</div>
                </div>
              </div>
            </div>

            {/* Projects Created This Month */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projects Created</h3>
              <div className="space-y-3">
                {Array.from({ length: data?.created || 0 }, (_, i) => {
                  const creators = ['Sarah Johnson', 'Mike Chen', 'Alex Kumar', 'Emma Davis', 'John Smith'];
                  const projectNames = [
                    'Mobile App Redesign', 'Customer Portal v2', 'API Integration',
                    'Marketing Automation', 'Security Audit', 'Data Migration',
                    'Design System Update', 'Performance Optimization'
                  ];
                  const daysAgo = Math.floor(Math.random() * 30) + 1;
                  return {
                    name: projectNames[i % projectNames.length],
                    creator: creators[i % creators.length],
                    date: `${data?.month} ${daysAgo}`,
                    daysAgo: `${daysAgo} days ago`
                  };
                }).map((proj, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1B1F23]">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500 text-white">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{proj.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Created by {proj.creator} • {proj.daysAgo}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{proj.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Completed This Month */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projects Completed</h3>
              <div className="space-y-3">
                {Array.from({ length: data?.completed || 0 }, (_, i) => {
                  const completers = ['Sarah Johnson', 'Mike Chen', 'Alex Kumar', 'Emma Davis'];
                  const projectNames = [
                    'Q4 Marketing Campaign', 'User Onboarding Flow', 'Email Templates',
                    'Payment Integration', 'Admin Dashboard', 'Mobile Notifications'
                  ];
                  const daysAgo = Math.floor(Math.random() * 30) + 1;
                  return {
                    name: projectNames[i % projectNames.length],
                    completer: completers[i % completers.length],
                    date: `${data?.month} ${daysAgo}`,
                    daysAgo: `${daysAgo} days ago`,
                    duration: `${Math.floor(Math.random() * 60) + 20} days`
                  };
                }).map((proj, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1B1F23]">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-green-500 text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{proj.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Completed by {proj.completer} • Duration: {proj.duration}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{proj.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Contributors This Month</h3>
              <div className="space-y-3">
                {['Sarah Johnson', 'Mike Chen', 'Alex Kumar'].map((name, index) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-600 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {Math.floor(Math.random() * 5) + 3} projects • {Math.floor(Math.random() * 20) + 10} tasks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insight */}
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Great Progress!
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                    {data?.month} showed a <span className="font-semibold text-green-600 dark:text-green-400">
                    {Math.round((data?.completed / (data?.created || 1)) * 100)}% completion rate
                    </span>. Your team is consistently delivering projects on time!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SlideoutPanelContent>
      </SlideoutPanel>
    );
  }

  if (type === 'milestone') {
    return (
      <SlideoutPanel open={open} onClose={onClose} title={data?.title || 'Milestone Details'} size="lg">
        <SlideoutPanelContent>
          <div className="space-y-6">
            {/* Milestone Info */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Project</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{data?.project}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Due Date</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{data?.date}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Days Remaining</div>
                  <div className="text-lg font-semibold text-orange-500">{data?.daysLeft} days</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Progress</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">65%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks for this Milestone */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Tasks</h3>
              <div className="space-y-2">
                {[
                  { title: 'Complete UI mockups', status: 'completed', assignee: 'Sarah Johnson' },
                  { title: 'Implement authentication', status: 'in_progress', assignee: 'Mike Chen' },
                  { title: 'Write API documentation', status: 'in_progress', assignee: 'Alex Kumar' },
                  { title: 'Set up testing environment', status: 'todo', assignee: 'Emma Davis' },
                  { title: 'Code review and QA', status: 'todo', assignee: 'John Smith' },
                ].map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1B1F23]">
                    <div className={`flex h-6 w-6 items-center justify-center rounded ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-gray-300 dark:bg-slate-700'
                    }`}>
                      {task.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-white" />}
                      {task.status === 'in_progress' && <Activity className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{task.assignee}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockers & Risks */}
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Potential Risks</h4>
                  <ul className="text-xs text-gray-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li>API dependencies not yet finalized</li>
                    <li>Waiting for design approval on 2 components</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </SlideoutPanelContent>
      </SlideoutPanel>
    );
  }

  return null;
}
