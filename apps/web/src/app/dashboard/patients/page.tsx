'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { Stethoscope } from 'lucide-react';

export default function PatientsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Patients</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Track patient records and medical history
      </p>
      <EmptyState
        icon={Stethoscope}
        title="No patients registered"
        description="Add your first patient record to start managing medical information and appointments."
        actionLabel="Add Patient"
        className="mt-8"
      />
    </div>
  );
}
