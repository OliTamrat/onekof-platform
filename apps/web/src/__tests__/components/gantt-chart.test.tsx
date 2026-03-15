import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GanttChart, type GanttTask } from '@/components/gantt/gantt-chart';

const mockTasks: GanttTask[] = [
  {
    id: '1',
    name: 'Design Phase',
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-03-15'),
    progress: 80,
    status: 'active',
    assignee: 'John Doe',
  },
  {
    id: '2',
    name: 'Development',
    startDate: new Date('2026-03-10'),
    endDate: new Date('2026-04-10'),
    progress: 30,
    status: 'in-progress',
    assignee: 'Jane Smith',
  },
  {
    id: '3',
    name: 'Launch',
    startDate: new Date('2026-04-15'),
    endDate: new Date('2026-04-15'),
    progress: 0,
    type: 'milestone',
  },
];

describe('GanttChart', () => {
  it('renders empty state when no tasks', () => {
    render(<GanttChart tasks={[]} />);
    expect(screen.getByText('No tasks to display on the timeline')).toBeInTheDocument();
  });

  it('renders task names in the left panel', () => {
    render(<GanttChart tasks={mockTasks} />);
    expect(screen.getByText('Design Phase')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });

  it('renders assignee names', () => {
    render(<GanttChart tasks={mockTasks} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders progress bars with correct ARIA attributes', () => {
    render(<GanttChart tasks={mockTasks} />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(2);

    const designBar = progressBars.find(
      (bar) => bar.getAttribute('aria-label')?.includes('Design Phase')
    );
    expect(designBar).toBeDefined();
    expect(designBar?.getAttribute('aria-valuenow')).toBe('80');
    expect(designBar?.getAttribute('aria-valuemin')).toBe('0');
    expect(designBar?.getAttribute('aria-valuemax')).toBe('100');
  });

  it('renders milestone with correct ARIA', () => {
    render(<GanttChart tasks={mockTasks} />);
    const milestone = screen.getByRole('img', { name: /milestone.*launch/i });
    expect(milestone).toBeInTheDocument();
  });

  it('renders Task header column', () => {
    render(<GanttChart tasks={mockTasks} />);
    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GanttChart tasks={mockTasks} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles single-day tasks', () => {
    const singleDayTask: GanttTask[] = [
      {
        id: 'single',
        name: 'Quick Task',
        startDate: new Date('2026-03-14'),
        endDate: new Date('2026-03-14'),
        progress: 50,
      },
    ];
    render(<GanttChart tasks={singleDayTask} />);
    expect(screen.getByText('Quick Task')).toBeInTheDocument();
  });
});
