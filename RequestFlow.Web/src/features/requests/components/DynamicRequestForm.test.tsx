import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DynamicRequestForm } from './DynamicRequestForm';

const requestFormSchema = {
  fields: [
    { key: 'title', label: 'عنوان', type: 'text' as const, required: true },
    { key: 'amount', label: 'مبلغ (تومان)', type: 'number' as const, required: true },
    { key: 'description', label: 'توضیحات', type: 'textarea' as const, required: false },
  ],
};

describe('DynamicRequestForm', () => {
  it('renders schema fields and validates required values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <DynamicRequestForm
        schema={requestFormSchema}
        submitLabel="ثبت درخواست"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'ثبت درخواست' }));

    expect(screen.getByText('عنوان الزامی است.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('prevents duplicate submission while a request is in flight', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => new Promise((resolve) => setTimeout(resolve, 50)));

    render(
      <DynamicRequestForm
        schema={requestFormSchema}
        submitLabel="ثبت درخواست"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/عنوان/i), 'Expense claim');
    await user.type(screen.getByLabelText(/مبلغ/i), '1500');
    await user.type(screen.getByLabelText(/توضیحات/i), 'Team lunch');

    const button = screen.getByRole('button', { name: 'ثبت درخواست' });
    await user.click(button);
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
