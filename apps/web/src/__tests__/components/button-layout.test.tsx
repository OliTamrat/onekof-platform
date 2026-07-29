import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

/**
 * The Button base class carries `inline-flex justify-center whitespace-nowrap`.
 * That is right for a label and wrong for anything else, and the failure is
 * silent — `whitespace-nowrap` INHERITS, so a paragraph nested three levels
 * inside still refuses to wrap, and the height collapse reads as a styling
 * accident rather than a component contract.
 *
 * This exact class broke four screens in one day: the Customization presets,
 * its toggles and header, the AI Insights cards, and the onboarding option
 * cards.
 */

describe('Button layout contract', () => {
  it('keeps nowrap by default — correct for labels', () => {
    render(<Button>Save</Button>);
    const cls = screen.getByRole('button').className;
    expect(cls).toContain('whitespace-nowrap');
    expect(cls).toContain('inline-flex');
    expect(cls).toContain('justify-center');
  });

  it('layout="block" drops all three properties that break wrapping content', () => {
    render(<Button layout="block">card</Button>);
    const cls = screen.getByRole('button').className;
    expect(cls).toContain('whitespace-normal');
    expect(cls).toContain('items-stretch');
    expect(cls).toContain('justify-start');
    expect(cls).toContain('text-left');
    // A card sizes to its content rather than the fixed control height.
    expect(cls).toContain('h-auto');
  });

  it('block layout still carries variant styling', () => {
    // The escape hatch must not cost the button its appearance, or people
    // will reach for a raw <button> instead — which is what happened on the
    // Customization page before this existed.
    render(<Button layout="block" variant="outline">card</Button>);
    const cls = screen.getByRole('button').className;
    expect(cls).toContain('border');
    expect(cls).toContain('whitespace-normal');
  });

  it('the default is unchanged, so no existing usage shifts', () => {
    const { container: withDefault } = render(<Button>x</Button>);
    const { container: explicit } = render(<Button layout="inline">x</Button>);
    expect(withDefault.querySelector('button')!.className).toBe(
      explicit.querySelector('button')!.className
    );
  });
});
