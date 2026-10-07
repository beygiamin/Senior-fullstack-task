import { createContext, useContext } from 'react';
import type { AppConfig } from '@/config/appConfig';

export const AppConfigContext = createContext<AppConfig | null>(null);

export function useAppConfig() {
  const config = useContext(AppConfigContext);

  if (!config) {
    throw new Error('useAppConfig must be used within AppConfigProvider.');
  }

  return config;
}
