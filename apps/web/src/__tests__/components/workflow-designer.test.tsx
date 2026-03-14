import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowDesigner } from '@/components/automations/workflow-designer';

describe('WorkflowDesigner', () => {
  it('renders trigger selector initially', () => {
    render(<WorkflowDesigner />);
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByLabelText('Select trigger')).toBeInTheDocument();
  });

  it('does not show conditions or actions before selecting trigger', () => {
    render(<WorkflowDesigner />);
    expect(screen.queryByText('Conditions (optional)')).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('shows conditions and actions after selecting a trigger', () => {
    render(<WorkflowDesigner />);
    const triggerSelect = screen.getByLabelText('Select trigger');
    fireEvent.change(triggerSelect, { target: { value: 'CREATED' } });

    expect(screen.getByText('When item is created')).toBeInTheDocument();
    expect(screen.getByText('Conditions (optional)')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('can add and remove conditions', () => {
    render(<WorkflowDesigner />);
    fireEvent.change(screen.getByLabelText('Select trigger'), { target: { value: 'CREATED' } });

    fireEvent.click(screen.getByText('Add condition'));
    expect(screen.getAllByLabelText('Condition field')).toHaveLength(1);

    fireEvent.click(screen.getByText('Add condition'));
    expect(screen.getAllByLabelText('Condition field')).toHaveLength(2);

    const removeButtons = screen.getAllByLabelText('Remove condition');
    fireEvent.click(removeButtons[0]);
    expect(screen.getAllByLabelText('Condition field')).toHaveLength(1);
  });

  it('can add actions from dropdown', () => {
    render(<WorkflowDesigner />);
    fireEvent.change(screen.getByLabelText('Select trigger'), { target: { value: 'STATUS_CHANGED' } });

    const actionSelect = screen.getByLabelText('Add action');
    fireEvent.change(actionSelect, { target: { value: 'SEND_NOTIFICATION' } });
    // Action should appear as a removable item (with Remove action button)
    expect(screen.getByLabelText('Remove action')).toBeInTheDocument();
  });

  it('can remove actions', () => {
    render(<WorkflowDesigner />);
    fireEvent.change(screen.getByLabelText('Select trigger'), { target: { value: 'CREATED' } });
    fireEvent.change(screen.getByLabelText('Add action'), { target: { value: 'CHANGE_STATUS' } });

    expect(screen.getByLabelText('Remove action')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Remove action'));
    expect(screen.queryByLabelText('Remove action')).not.toBeInTheDocument();
  });

  it('can remove a trigger', () => {
    render(<WorkflowDesigner />);
    fireEvent.change(screen.getByLabelText('Select trigger'), { target: { value: 'CREATED' } });
    // Trigger is set - remove button should be visible
    expect(screen.getByLabelText('Remove trigger')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Remove trigger'));
    // After removal, the select trigger dropdown should reappear and no remove button
    expect(screen.queryByLabelText('Remove trigger')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Select trigger')).toBeInTheDocument();
  });

  it('shows save button when trigger + action exist', () => {
    const onSave = vi.fn();
    render(<WorkflowDesigner onSave={onSave} />);
    fireEvent.change(screen.getByLabelText('Select trigger'), { target: { value: 'CREATED' } });

    // No save before action
    expect(screen.queryByText('Save Automation')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Add action'), { target: { value: 'SEND_EMAIL' } });
    const saveButton = screen.getByRole('button', { name: 'Save Automation' });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0].trigger.type).toBe('CREATED');
    expect(onSave.mock.calls[0][0].actions).toHaveLength(1);
  });

  it('loads initial rule', () => {
    const initialRule = {
      trigger: { id: '1', type: 'COMPLETED', label: 'When completed', config: {} },
      conditions: [],
      actions: [{ id: '2', type: 'SEND_NOTIFICATION', label: 'Send notification', config: {} }],
    };
    render(<WorkflowDesigner initialRule={initialRule} />);
    expect(screen.getByText('When completed')).toBeInTheDocument();
    // The action is loaded - verify by the remove button and trigger label
    expect(screen.getByLabelText('Remove trigger')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove action')).toBeInTheDocument();
  });
});
