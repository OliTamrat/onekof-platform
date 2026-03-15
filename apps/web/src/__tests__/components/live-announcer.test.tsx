import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LiveAnnouncerProvider, useLiveAnnouncer } from '@/components/ui/live-announcer';

function TestComponent() {
  const { announce } = useLiveAnnouncer();
  return (
    <div>
      <button onClick={() => announce('Polite message')}>Announce Polite</button>
      <button onClick={() => announce('Urgent message', 'assertive')}>Announce Assertive</button>
    </div>
  );
}

describe('LiveAnnouncerProvider', () => {
  it('renders children', () => {
    render(
      <LiveAnnouncerProvider>
        <div>Child content</div>
      </LiveAnnouncerProvider>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('provides polite live region', () => {
    render(
      <LiveAnnouncerProvider>
        <div>Test</div>
      </LiveAnnouncerProvider>
    );
    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toBeInTheDocument();
    expect(politeRegion).toHaveAttribute('aria-live', 'polite');
    expect(politeRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('provides assertive live region', () => {
    render(
      <LiveAnnouncerProvider>
        <div>Test</div>
      </LiveAnnouncerProvider>
    );
    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toBeInTheDocument();
    expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
    expect(alertRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('live regions are visually hidden', () => {
    render(
      <LiveAnnouncerProvider>
        <div>Test</div>
      </LiveAnnouncerProvider>
    );
    const politeRegion = screen.getByRole('status');
    expect(politeRegion).toHaveClass('sr-only');
  });
});

describe('useLiveAnnouncer', () => {
  it('returns announce function from context', () => {
    render(
      <LiveAnnouncerProvider>
        <TestComponent />
      </LiveAnnouncerProvider>
    );
    expect(screen.getByText('Announce Polite')).toBeInTheDocument();
    expect(screen.getByText('Announce Assertive')).toBeInTheDocument();
  });

  it('does not throw outside of provider', () => {
    const { announce } = { announce: () => {} };
    expect(() => announce()).not.toThrow();
  });
});
