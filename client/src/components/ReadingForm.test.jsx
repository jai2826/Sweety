import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReadingForm, { validateForm } from './ReadingForm.jsx';

function setup(onSubmit = vi.fn().mockResolvedValue()) {
  const user = userEvent.setup();
  render(<ReadingForm onSubmit={onSubmit} />);
  return { user, onSubmit };
}

describe('ReadingForm', () => {
  it('renders date, slot and value fields', () => {
    setup();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Time slot')).toBeInTheDocument();
    expect(screen.getByLabelText('Value (mg/dl)')).toBeInTheDocument();
  });

  it('shows the required-value error when submitted empty', async () => {
    const { user, onSubmit } = setup();
    await user.click(screen.getByRole('button', { name: /add reading/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please enter a glucose value.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the range error for an out-of-range value', async () => {
    const { user, onSubmit } = setup();
    await user.type(screen.getByLabelText('Value (mg/dl)'), '700');
    await user.click(screen.getByRole('button', { name: /add reading/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Value must be between 40 and 600 mg/dl.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validateForm rejects empty, out-of-range and non-integer values', () => {
    expect(validateForm({ value: '', date: '2026-01-01' })).toBe(
      'Please enter a glucose value.'
    );
    expect(validateForm({ value: '700', date: '2026-01-01' })).toBe(
      'Value must be between 40 and 600 mg/dl.'
    );
    expect(validateForm({ value: 120.5, date: '2026-01-01' })).toBe(
      'Value must be between 40 and 600 mg/dl.'
    );
    expect(validateForm({ value: '120', date: '2026-01-01' })).toBeNull();
  });

  it('submits a valid reading with the chosen slot', async () => {
    const onSubmit = vi.fn().mockResolvedValue();
    const user = userEvent.setup();
    render(<ReadingForm onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByLabelText('Time slot'), 'AFTER_LUNCH');
    await user.type(screen.getByLabelText('Value (mg/dl)'), '120');
    await user.click(screen.getByRole('button', { name: /add reading/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ slot: 'AFTER_LUNCH', value: 120 })
    );
  });

  it('surfaces a server error returned by onSubmit', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error('You already have an After lunch reading for this date.'));
    const user = userEvent.setup();
    render(<ReadingForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Value (mg/dl)'), '120');
    await user.click(screen.getByRole('button', { name: /add reading/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You already have an After lunch reading for this date.'
    );
  });
});
