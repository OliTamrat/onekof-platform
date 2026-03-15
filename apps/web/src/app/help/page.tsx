'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { HelpCircle, BookOpen, Video, MessageCircle, Mail, ExternalLink } from 'lucide-react';

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Help & Support</h1>
              <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Get help using Onekof platform</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="#documentation"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg hover:border-[#0065FF] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF]/10 text-[#0065FF]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Documentation</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Browse our comprehensive guides and tutorials</p>
                </div>
              </a>

              <a
                href="#tutorials"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg hover:border-[#0065FF] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F59E0B]/10 text-[#F59E0B]">
                  <Video className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Video Tutorials</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Watch step-by-step video guides</p>
                </div>
              </a>

              <a
                href="#community"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg hover:border-[#0065FF] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#10B981]/10 text-[#10B981]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Community Forum</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Ask questions and share knowledge</p>
                </div>
              </a>

              <a
                href="mailto:support@onekof.com"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg hover:border-[#0065FF] transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6]">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Contact Support</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Email us at support@onekof.com</p>
                </div>
              </a>
            </div>

            {/* FAQs */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">How do I create a new project?</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Navigate to the Projects page and click the "Create Project" button. Fill in the project details and select your preferred template.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">How do I invite team members?</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Go to Settings  Team Members and click "Invite Member". Enter their email address and assign a role.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">How do I customize my dashboard?</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Admins can customize dashboard features by going to Settings  Customization. You can enable/disable sections and features based on your organization's needs.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">How do I export data?</h3>
                  <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Most pages have an export button in the toolbar. Click it to download data in CSV or Excel format.</p>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Resources</h2>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#2C333A] rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">Getting Started Guide</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#2C333A] rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">API Documentation</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#2C333A] rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">Keyboard Shortcuts</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#2C333A] rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">Release Notes</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
