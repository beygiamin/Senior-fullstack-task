import { useNavigate } from 'react-router-dom';
import { useAppConfig } from '@/app/providers/appConfigContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getErrorMessage } from '@/lib/http/client';
import { DynamicRequestForm } from '../components/DynamicRequestForm';
import { useCreateRequest } from '../hooks/useRequests';
import { normalizeRequestPayload } from '../schemas/dynamicFormSchema';

export function CreateRequestPage() {
  const { requestFormSchema } = useAppConfig();
  const navigate = useNavigate();
  const createRequestMutation = useCreateRequest();

  const handleSubmit = (values: Record<string, string>) => {
    const payload = normalizeRequestPayload(requestFormSchema, values);
    const amount = Number(payload.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    createRequestMutation.mutate(
      {
        title: String(payload.title ?? '').trim(),
        amount,
        description: String(payload.description ?? '').trim(),
      },
      {
        onSuccess: () => {
          navigate('/requests');
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <p className="eyebrow">ایجاد</p>
        <CardTitle role="heading" aria-level={1} className="text-2xl">
          درخواست جدید
        </CardTitle>
        <CardDescription>اطلاعات درخواست را تکمیل و برای بررسی ارسال کنید.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {createRequestMutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>ثبت درخواست ناموفق بود</AlertTitle>
            <AlertDescription>{getErrorMessage(createRequestMutation.error)}</AlertDescription>
          </Alert>
        ) : null}

        <DynamicRequestForm
          schema={requestFormSchema}
          submitLabel="ثبت درخواست"
          isSubmitting={createRequestMutation.isPending}
          onSubmit={handleSubmit}
        />

        <Button variant="outline" onClick={() => navigate('/requests')}>
          انصراف
        </Button>
      </CardContent>
    </Card>
  );
}
