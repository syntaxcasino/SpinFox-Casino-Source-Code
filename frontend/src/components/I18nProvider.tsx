'use client';

import { TranslationProvider } from '../contexts/TranslationContext';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <TranslationProvider>{children}</TranslationProvider>;
}