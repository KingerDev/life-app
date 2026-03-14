'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export function OneSignalInit() {
  const { user } = useUser();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) return;

    initialized.current = true;

    import('react-onesignal').then(({ default: OneSignal }) => {
      OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
      }).then(() => {
        if (user?.id) {
          OneSignal.login(user.id);
        }
      });
    });
  }, [user?.id]);

  return null;
}
