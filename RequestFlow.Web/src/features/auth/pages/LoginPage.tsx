import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../schemas/authSchema';
import { getErrorMessage } from '@/lib/http/client';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      login(response);
      navigate('/requests');
    },
  });

  const onSubmit = (values: { userName: string; password: string }) => {
    loginMutation.mutate(values);
  };

  const errorMessage = loginMutation.isError ? getErrorMessage(loginMutation.error) : '';

  return (
    <Card className="auth-panel">
      <CardHeader>
        <p className="eyebrow">RequestFlow</p>
        <CardTitle role="heading" aria-level={1} className="text-2xl">
          ورود
        </CardTitle>
        <CardDescription>برای ادامه وارد حساب کاربری خود شوید.</CardDescription>
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
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>
          </FieldGroup>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>ورود ناموفق بود</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            {loginMutation.isPending ? 'در حال ورود...' : 'ورود'}
          </Button>

          <p className="text-sm text-muted-foreground">
            حساب ندارید؟{' '}
            <Button variant="link" render={<Link to="/signup" />} nativeButton={false}>
              ثبت نام
            </Button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
