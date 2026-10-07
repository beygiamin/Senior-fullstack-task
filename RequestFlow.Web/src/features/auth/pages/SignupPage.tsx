import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { useAppConfig } from '@/app/providers/appConfigContext';
import { getErrorMessage } from '@/lib/http/client';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { registerSchema } from '../schemas/authSchema';

type SignupValues = {
  userName: string;
  password: string;
  role: 'Employee' | 'Manager' | 'Finance';
};

export function SignupPage() {
  const { roleLabels } = useAppConfig();
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: '',
      password: '',
      role: 'Employee',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      login(response);
      navigate('/requests');
    },
  });

  const onSubmit = (values: SignupValues) => {
    registerMutation.mutate(values);
  };

  const errorMessage = registerMutation.isError ? getErrorMessage(registerMutation.error) : '';

  return (
    <Card className="auth-panel">
      <CardHeader>
        <p className="eyebrow">RequestFlow</p>
        <CardTitle role="heading" aria-level={1} className="text-2xl">
          ثبت نام
        </CardTitle>
        <CardDescription>برای ایجاد حساب، اطلاعات زیر را وارد کنید.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.userName)}>
              <FieldLabel htmlFor="userName">نام کاربری</FieldLabel>
              <Input
                id="userName"
                type="text"
                autoComplete="username"
                aria-invalid={Boolean(errors.userName)}
                {...register('userName')}
              />
              <FieldError>{errors.userName?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.role)}>
              <FieldLabel htmlFor="role">نقش</FieldLabel>
              <NativeSelect id="role" aria-invalid={Boolean(errors.role)} {...register('role')}>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <NativeSelectOption key={role} value={role}>
                    {label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{errors.role?.message}</FieldError>
            </Field>
          </FieldGroup>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>ثبت نام ناموفق بود</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            {registerMutation.isPending ? 'در حال ساخت حساب...' : 'ساخت حساب'}
          </Button>

          <p className="text-sm text-muted-foreground">
            قبلا حساب دارید؟{' '}
            <Button variant="link" render={<Link to="/login" />} nativeButton={false}>
              ورود
            </Button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
