'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModulesStore, NotificationPrefs } from '@/lib/store';

const DAYS = ['Ne', 'Po', 'Ut', 'St', 'Šv', 'Pi', 'So'];
const TIMES = ['07:00', '08:00', '09:00', '10:00', '12:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const DEADLINE_OPTIONS = [
  { value: 0, label: 'V deň termínu' },
  { value: 1, label: '1 deň vopred' },
  { value: 2, label: '2 dni vopred' },
  { value: 3, label: '3 dni vopred' },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0',
        enabled ? 'bg-primary' : 'bg-muted'
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          'inline-block size-4 transform rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-muted border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {TIMES.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}

export function NotificationsSection() {
  const { notificationPrefs, setNotificationPrefs } = useModulesStore();
  const [permissionState, setPermissionState] = useState<'default' | 'granted' | 'denied'>('default');
  const [requesting, setRequesting] = useState(false);

  const set = (patch: Partial<NotificationPrefs>) => setNotificationPrefs(patch);

  async function requestPermission() {
    setRequesting(true);
    try {
      const { default: OneSignal } = await import('react-onesignal');
      await OneSignal.Notifications.requestPermission();
      const granted = OneSignal.Notifications.permission;
      setPermissionState(granted ? 'granted' : 'denied');
    } catch {
      // OneSignal not initialized (no App ID set)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        setPermissionState(result as 'granted' | 'denied');
      }
    } finally {
      setRequesting(false);
    }
  }

  function toggleCustomDay(day: number) {
    const days = notificationPrefs.customDays.includes(day)
      ? notificationPrefs.customDays.filter((d) => d !== day)
      : [...notificationPrefs.customDays, day];
    set({ customDays: days });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="size-4" />
          Notifikácie
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Nastav si pripomienky a upozornenia
        </p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Permission banner */}
        {permissionState !== 'granted' && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              {permissionState === 'denied' ? (
                <BellOff className="size-5 text-destructive shrink-0" />
              ) : (
                <Bell className="size-5 text-primary shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {permissionState === 'denied' ? 'Notifikácie sú zablokované' : 'Notifikácie nie sú povolené'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {permissionState === 'denied'
                    ? 'Povoľ ich v nastaveniach prehliadača'
                    : 'Klikni pre povolenie push notifikácií'}
                </p>
              </div>
            </div>
            {permissionState !== 'denied' && (
              <Button size="sm" onClick={requestPermission} disabled={requesting}>
                {requesting ? 'Čakaj...' : 'Zapnúť'}
              </Button>
            )}
          </div>
        )}

        {/* Weekly Wheel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Týždenné hodnotenie</p>
              <p className="text-xs text-muted-foreground">Pripomienka každú nedeľu na Wheel of Life</p>
            </div>
            <Toggle
              enabled={notificationPrefs.weeklyWheelEnabled}
              onToggle={() => set({ weeklyWheelEnabled: !notificationPrefs.weeklyWheelEnabled })}
            />
          </div>
          {notificationPrefs.weeklyWheelEnabled && (
            <div className="flex items-center gap-2 pl-0 pt-1">
              <span className="text-xs text-muted-foreground">Čas:</span>
              <TimeSelect
                value={notificationPrefs.weeklyWheelTime}
                onChange={(v) => set({ weeklyWheelTime: v })}
              />
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Deadline reminders */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Deadliny úloh a cieľov</p>
              <p className="text-xs text-muted-foreground">Upozornenie pred termínom splnenia</p>
            </div>
            <Toggle
              enabled={notificationPrefs.deadlineEnabled}
              onToggle={() => set({ deadlineEnabled: !notificationPrefs.deadlineEnabled })}
            />
          </div>
          {notificationPrefs.deadlineEnabled && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Kedy:</span>
              <select
                value={notificationPrefs.deadlineDaysBefore}
                onChange={(e) => set({ deadlineDaysBefore: Number(e.target.value) })}
                className="text-sm bg-muted border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {DEADLINE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Custom reminder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Vlastná pripomienka</p>
              <p className="text-xs text-muted-foreground">Opakujúca sa správa vo vybrané dni</p>
            </div>
            <Toggle
              enabled={notificationPrefs.customEnabled}
              onToggle={() => set({ customEnabled: !notificationPrefs.customEnabled })}
            />
          </div>
          {notificationPrefs.customEnabled && (
            <div className="space-y-3 pt-1">
              <input
                type="text"
                value={notificationPrefs.customText}
                onChange={(e) => set({ customText: e.target.value })}
                placeholder="Text pripomienky..."
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Čas:</span>
                  <TimeSelect
                    value={notificationPrefs.customTime}
                    onChange={(v) => set({ customTime: v })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  {DAYS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleCustomDay(i)}
                      className={cn(
                        'size-8 rounded-full text-xs font-medium transition-colors',
                        notificationPrefs.customDays.includes(i)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          ℹ️ Na iOS musí byť app pridaná na plochu (Add to Home Screen) pre fungovanie push notifikácií. Vyžaduje iOS 16.4+.
        </p>
      </CardContent>
    </Card>
  );
}
