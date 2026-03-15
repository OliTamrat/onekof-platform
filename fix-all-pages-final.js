const fs = require('fs');

const pages = [
  { path: './apps/web/src/app/dashboard/reports/page.tsx', icon: 'FileText', title: 'Reports & Analytics', desc: 'Analytics and reporting features are coming soon. You will be able to view insights, generate reports, and track metrics here.' },
  { path: './apps/web/src/app/dashboard/procurement/page.tsx', icon: 'ShoppingCart', title: 'Procurement', desc: 'Procurement management features are coming soon' },
  { path: './apps/web/src/app/dashboard/compliance/page.tsx', icon: 'Shield', title: 'Compliance', desc: 'Compliance management features are coming soon' },
  { path: './apps/web/src/app/dashboard/grants/page.tsx', icon: 'DollarSign', title: 'Grants', desc: 'Grant management features are coming soon' },
  { path: './apps/web/src/app/dashboard/automation/page.tsx', icon: 'Zap', title: 'Automation', desc: 'Workflow automation features are coming soon' },
  { path: './apps/web/src/app/dashboard/courses/page.tsx', icon: 'GraduationCap', title: 'Courses', desc: 'Course management features are coming soon' },
  { path: './apps/web/src/app/dashboard/research/page.tsx', icon: 'FileSpreadsheet', title: 'Research', desc: 'Research management features are coming soon' },
  { path: './apps/web/src/app/dashboard/facilities/page.tsx', icon: 'Building2', title: 'Facilities', desc: 'Facility management features are coming soon' },
  { path: './apps/web/src/app/dashboard/equipment/page.tsx', icon: 'Wrench', title: 'Equipment', desc: 'Equipment management features are coming soon' },
  { path: './apps/web/src/app/dashboard/sites/page.tsx', icon: 'MapPin', title: 'Sites', desc: 'Site management features are coming soon' },
  { path: './apps/web/src/app/dashboard/patients/page.tsx', icon: 'Heart', title: 'Patients', desc: 'Patient management features are coming soon' },
  { path: './apps/web/src/app/dashboard/impact/page.tsx', icon: 'TrendingUp', title: 'Impact Measurement', desc: 'Track and measure the impact of your projects and initiatives' },
  { path: './apps/web/src/app/dashboard/safety/page.tsx', icon: 'Shield', title: 'Safety Management', desc: 'Manage safety protocols, incidents, and compliance' },
  { path: './apps/web/src/app/dashboard/medical/page.tsx', icon: 'Stethoscope', title: 'Medical Services', desc: 'Manage medical services, equipment, and patient care' },
  { path: './apps/web/src/app/dashboard/resources/page.tsx', icon: 'Activity', title: 'Resources', desc: 'Manage and allocate resources across projects' },
  { path: './apps/web/src/app/dashboard/settings/page.tsx', icon: 'Settings', title: 'Settings', desc: 'Organization settings and preferences coming soon' },
  { path: './apps/web/src/app/dashboard/wiki/page.tsx', icon: 'BookOpen', title: 'Wiki', desc: 'Knowledge base and wiki features coming soon' },
];

console.log('🔧 Updating all placeholder pages to render inside dashboard...\n');

pages.forEach(page => {
  try {
    const content = `'use client';

import { ${page.icon} } from 'lucide-react';

export default function ${page.title.replace(/\s+/g, '').replace(/&/g, 'And')}Page() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <${page.icon} className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">${page.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            ${page.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
`;

    fs.writeFileSync(page.path, content, 'utf8');
    console.log(`✅ ${page.title}`);
  } catch (error) {
    console.error(`❌ ${page.title}: ${error.message}`);
  }
});

console.log('\n✅ All placeholder pages now render inside dashboard!');
