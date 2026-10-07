import { z } from 'zod';

export type FieldType = 'text' | 'number' | 'textarea';

export interface FormFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
}

export interface FormSchema {
  fields: FormFieldDefinition[];
}

export type DynamicFormValues = Record<string, string>;

export const formSchemaValidator = z.object({
  fields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(['text', 'number', 'textarea']),
      required: z.boolean(),
    }),
  ),
});

export const createEmptyFormValues = (schema: FormSchema): DynamicFormValues =>
  Object.fromEntries(
    schema.fields.map((field) => [field.key, '']),
  ) as DynamicFormValues;

export const createFormValidationSchema = (schema: FormSchema): z.ZodType<DynamicFormValues> =>
  z.object(
    Object.fromEntries(
      schema.fields.map((field) => {
        if (field.type === 'number') {
          const requiredSchema = z
            .string()
            .trim()
            .min(1, `${field.label} الزامی است.`)
            .refine((value) => Number(value) > 0, {
              message: `${field.label} باید بزرگ‌تر از صفر باشد.`,
            });

          const optionalSchema = z
            .string()
            .trim()
            .optional()
            .or(z.literal(''))
            .refine((value) => value === '' || Number(value) > 0, {
              message: `${field.label} باید بزرگ‌تر از صفر باشد.`,
            });

          return [field.key, field.required ? requiredSchema : optionalSchema];
        }

        const base = z.string().trim();

        return [
          field.key,
          field.required ? base.min(1, `${field.label} الزامی است.`) : base.or(z.literal('')),
        ];
      }),
    ) as Record<string, z.ZodTypeAny>,
  ) as z.ZodType<DynamicFormValues>;

export const normalizeRequestPayload = (
  schema: FormSchema,
  values: DynamicFormValues,
): Record<string, string | number> => {
  return Object.fromEntries(
    schema.fields.map((field) => {
      const rawValue = values[field.key] ?? '';

      if (field.type === 'number') {
        const parsed = Number(rawValue);
        return [field.key, Number.isNaN(parsed) ? '' : parsed];
      }

      return [field.key, rawValue.trim()];
    }),
  );
};
