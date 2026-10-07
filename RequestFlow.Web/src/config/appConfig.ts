import { z } from 'zod';
import { formSchemaValidator } from '../features/requests/schemas/dynamicFormSchema';

const roleLabelsValidator = z.record(z.string(), z.string());

async function fetchConfig<T>(path: string, validator: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}config/${path}`, {
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`Failed to load config/${path} (${response.status}).`);
  }

  const result = validator.safeParse(await response.json());

  if (!result.success) {
    throw new Error(`Invalid config/${path}: ${result.error.message}`);
  }

  return result.data;
}

export async function loadAppConfig() {
  const [roleLabels, requestFormSchema] = await Promise.all([
    fetchConfig('role-labels.json', roleLabelsValidator),
    fetchConfig('request-form-schema.json', formSchemaValidator),
  ]);

  return { roleLabels, requestFormSchema };
}

export type AppConfig = Awaited<ReturnType<typeof loadAppConfig>>;
