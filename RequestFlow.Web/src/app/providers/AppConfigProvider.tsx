import type { PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { loadAppConfig } from '@/config/appConfig';
import { AppConfigContext } from './appConfigContext';

export function AppConfigProvider({ children }: PropsWithChildren) {
  const configQuery = useQuery({
    queryKey: ['appConfig'],
    queryFn: loadAppConfig,
  });

  if (configQuery.isPending) {
    return (
      <div className="page-shell" role="status">
        <Spinner data-icon="inline-start" />
        در حال بارگذاری تنظیمات...
      </div>
    );
  }

  if (configQuery.isError) {
    return (
      <div className="page-shell">
        <Alert variant="destructive">
          <AlertTitle>بارگذاری تنظیمات ناموفق بود</AlertTitle>
          <AlertDescription>{configQuery.error.message}</AlertDescription>
        </Alert>
        <Button type="button" variant="outline" onClick={() => void configQuery.refetch()}>
          تلاش دوباره
        </Button>
      </div>
    );
  }

  return <AppConfigContext.Provider value={configQuery.data}>{children}</AppConfigContext.Provider>;
}
