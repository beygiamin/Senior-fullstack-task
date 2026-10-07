import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { FormSchema } from '../schemas/dynamicFormSchema';
import { createEmptyFormValues, createFormValidationSchema } from '../schemas/dynamicFormSchema';

interface DynamicRequestFormProps {
  schema: FormSchema;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: Record<string, string>) => void | Promise<unknown>;
}

export function DynamicRequestForm({
  schema,
  submitLabel = 'ثبت',
  isSubmitting = false,
  onSubmit,
}: DynamicRequestFormProps) {
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(createFormValidationSchema(schema) as never),
    defaultValues: createEmptyFormValues(schema),
  });

  const disabled = isSubmitting || isSubmittingForm;

  const handleFormSubmit = async (values: Record<string, string>) => {
    if (disabled) {
      return;
    }

    setIsSubmittingForm(true);

    try {
      await onSubmit(values);
    } finally {
      if (!isSubmitting) {
        setIsSubmittingForm(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="dynamic-form" noValidate>
      <FieldGroup className="form-grid">
        {schema.fields.map((field) => {
          const errorMessage =
            typeof errors[field.key]?.message === 'string' ? errors[field.key]?.message : undefined;

          return (
            <Field key={field.key} data-invalid={Boolean(errorMessage)}>
              <FieldLabel htmlFor={field.key}>
                {field.label}
                {field.required ? <span aria-label="الزامی"> *</span> : null}
              </FieldLabel>

              {field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  rows={5}
                  aria-invalid={Boolean(errorMessage)}
                  {...register(field.key)}
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type === 'number' ? 'number' : 'text'}
                  aria-invalid={Boolean(errorMessage)}
                  step={field.type === 'number' ? 'any' : undefined}
                  {...register(field.key)}
                />
              )}

              <FieldError>{errorMessage}</FieldError>
            </Field>
          );
        })}
      </FieldGroup>

      <div className="form-actions">
        <Button type="submit" disabled={disabled}>
          {disabled ? <Spinner data-icon="inline-start" /> : null}
          {disabled ? 'در حال ثبت...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
