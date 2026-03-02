'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelection, UserRole } from './role-selection';
import { CreateOrganization } from './create-organization';

type OnboardingStep = 'role' | 'organization' | 'complete';

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);

    // Save user role preference to database
    try {
      await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: { role } }),
      });
    } catch (error) {
      console.error('Failed to save user role:', error);
    }

    // Move to organization creation
    setCurrentStep('organization');
  };

  const handleRoleSkip = () => {
    // If user skips role selection, go straight to org creation
    setCurrentStep('organization');
  };

  const handleOrganizationComplete = () => {
    // Onboarding complete, redirect to dashboard
    router.push('/dashboard');
    router.refresh();
  };

  const handleBack = () => {
    if (currentStep === 'organization') {
      setCurrentStep('role');
    }
  };

  return (
    <>
      {currentStep === 'role' && (
        <RoleSelection
          onSelect={handleRoleSelect}
          onSkip={handleRoleSkip}
        />
      )}

      {currentStep === 'organization' && (
        <CreateOrganization
          onComplete={handleOrganizationComplete}
          onBack={handleBack}
        />
      )}
    </>
  );
}
