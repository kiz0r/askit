import React from 'react';
import { Toaster as BaseToaster, type ToastClassnames } from 'sonner';
import { useAppearance } from '../appearance/useAppearance';
import styles from './NotificationCenter.module.scss';

const notificationClassnames: ToastClassnames = {
  toast: styles.NotificationCenter__Notification,
  icon: styles.NotificationCenter__NotificationIcon,
  title: styles.NotificationCenter__NotificationTitle,
  description: styles.NotificationCenter__NotificationDescription,
  info: styles.NotificationCenter__NotificationInfo,
  success: styles.NotificationCenter__NotificationSuccess,
  error: styles.NotificationCenter__NotificationError,
  warning: styles.NotificationCenter__NotificationWarning,
};

/**
 * Default duration for notifications in milliseconds.
 */
const DEFAULT_NOTIFICATION_DURATION = 5_000;

export const NotificationCenter = React.memo(() => {
  const appearance = useAppearance();

  return (
    <BaseToaster
      theme={appearance.style}
      duration={DEFAULT_NOTIFICATION_DURATION}
      position='bottom-right'
      className={styles.NotificationCenter}
      toastOptions={{
        classNames: notificationClassnames,
      }}
    />
  );
});
