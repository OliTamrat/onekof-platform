'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, Mail, Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectTeamPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-[#1B1F23] p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <Button className="bg-[#1C8C7D] hover:bg-[#156B60]">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Members Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {members.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No team members yet</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                Add team members to collaborate on this project.
              </p>
            </div>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#1C8C7D] flex items-center justify-center text-lg text-white font-semibold">
                    {member.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.user?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {member.user?.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="h-3 w-3 text-gray-400" />
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        member.role === 'ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {member.role}
                      </span>
                      {member.budgetAccess && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          {member.budgetAccess}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
