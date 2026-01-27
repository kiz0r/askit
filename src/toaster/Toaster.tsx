import React from 'react';
import { Toaster as BaseToaster, type ToastClassnames, type ToasterProps } from 'sonner';
import { useAppearance } from '../appearance/useAppearance';
import styles from './Toaster.module.scss';

const toastClassNames: ToastClassnames = {
  toast: styles.Toaster__Toast,
  icon: styles.Toaster__ToastIcon,
  title: styles.Toaster__ToastTitle,
  description: styles.Toaster__ToastDescription,
  info: styles.Toaster__ToastInfo,
  success: styles.Toaster__ToastSuccess,
  error: styles.Toaster__ToastError,
  warning: styles.Toaster__ToastWarning,
};

/**
 * Default duration for toasts in milliseconds.
 */
const DEFAULT_TOAST_DURATION = 5_000;

export const Toaster = React.memo(() => {
  const appearance = useAppearance();

  return (
    <BaseToaster
      theme={appearance.style}
      duration={DEFAULT_TOAST_DURATION}
      position='bottom-right'
      className={styles.Toaster}
      toastOptions={{
        classNames: toastClassNames,
      }}
    />
  );
});
