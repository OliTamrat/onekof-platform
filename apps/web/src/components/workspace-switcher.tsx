'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function WorkspaceSwitcher() {
  const {
    currentOrganization,
    organizations,
    switchOrganization,
    isLoadingOrganizations,
  } = useWorkspace();

  const [open, setOpen] = React.useState(false);

  if (isLoadingOrganizations) {
    return (
      <Button variant="outline" className="w-[200px] justify-between" disabled>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="text-sm">Loading...</span>
        </div>
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a workspace"
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {currentOrganization?.logo ? (
              <img
                src={currentOrganization.logo}
                alt={currentOrganization.name}
                className="h-5 w-5 rounded"
              />
            ) : (
              <Building2 className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate text-sm font-medium">
              {currentOrganization?.name || 'Select workspace'}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => {
              switchOrganization(org.id);
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="h-5 w-5 rounded shrink-0"
                />
              ) : (
                <Building2 className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate text-sm">{org.name}</span>
            </div>
            <Check
              className={cn(
                'ml-auto h-4 w-4 shrink-0',
                currentOrganization?.id === org.id ? 'opacity-100' : 'opacity-0'
              )}
            />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            // TODO: Open create workspace modal
            console.log('Create workspace');
            setOpen(false);
          }}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="text-sm">Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
