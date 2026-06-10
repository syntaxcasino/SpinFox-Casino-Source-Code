'use client';

import { ToastContainer } from 'react-toastify';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemedToastContainer() {
  const { theme } = useTheme();

  return <ToastContainer theme={theme} />;
}

