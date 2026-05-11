'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

function applyThemeClass() {
  document.documentElement.classList.toggle('dark', useThemeStore.getState().theme === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useLayoutEffect(() => {
    applyThemeClass();
  }, [theme]);

  useEffect(() => {
    applyThemeClass();
    return useThemeStore.persist.onFinishHydration(applyThemeClass);
  }, []);

  return <>{children}</>;
}
