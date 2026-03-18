'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleId = 'wheel' | 'beliefs' | 'habits' | 'todos' | 'experiments' | 'notes' | 'quests';

export const DEFAULT_MODULE_ORDER: ModuleId[] = [
  'wheel', 'beliefs', 'habits', 'todos', 'experiments', 'notes', 'quests',
];

export interface NotificationPrefs {
  weeklyWheelEnabled: boolean;
  weeklyWheelTime: string;
  deadlineEnabled: boolean;
  deadlineDaysBefore: number;
  customEnabled: boolean;
  customText: string;
  customTime: string;
  customDays: number[]; // 0=nedeľa, 1=pondelok ... 6=sobota
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  weeklyWheelEnabled: true,
  weeklyWheelTime: '20:00',
  deadlineEnabled: true,
  deadlineDaysBefore: 1,
  customEnabled: false,
  customText: '',
  customTime: '09:00',
  customDays: [1, 3, 5],
};

interface ModulesState {
  questsEnabled: boolean;
  experimentsEnabled: boolean;
  wheelEnabled: boolean;
  beliefsEnabled: boolean;
  habitsEnabled: boolean;
  todosEnabled: boolean;
  notesEnabled: boolean;
  moduleOrder: ModuleId[];
  tabBarPins: string[]; // ordered hrefs pinned to mobile tab bar (excl. '/'), max 4
  notificationPrefs: NotificationPrefs;
  toggleQuests: () => void;
  toggleExperiments: () => void;
  toggleWheel: () => void;
  toggleBeliefs: () => void;
  toggleHabits: () => void;
  toggleTodos: () => void;
  toggleNotes: () => void;
  setModuleOrder: (order: ModuleId[]) => void;
  setTabBarPins: (pins: string[]) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
}

export const useModulesStore = create<ModulesState>()(
  persist(
    (set) => ({
      questsEnabled: true,
      experimentsEnabled: true,
      wheelEnabled: true,
      beliefsEnabled: true,
      habitsEnabled: true,
      todosEnabled: true,
      notesEnabled: true,
      moduleOrder: DEFAULT_MODULE_ORDER,
      tabBarPins: ['/wheel', '/beliefs', '/habits', '/todos'],
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      toggleQuests: () => set((state) => ({ questsEnabled: !state.questsEnabled })),
      toggleExperiments: () => set((state) => ({ experimentsEnabled: !state.experimentsEnabled })),
      toggleWheel: () => set((state) => ({ wheelEnabled: !state.wheelEnabled })),
      toggleBeliefs: () => set((state) => ({ beliefsEnabled: !state.beliefsEnabled })),
      toggleHabits: () => set((state) => ({ habitsEnabled: !state.habitsEnabled })),
      toggleTodos: () => set((state) => ({ todosEnabled: !state.todosEnabled })),
      toggleNotes: () => set((state) => ({ notesEnabled: !state.notesEnabled })),
      setModuleOrder: (order) => set({ moduleOrder: order }),
      setTabBarPins: (pins) => set({ tabBarPins: pins }),
      setNotificationPrefs: (prefs) =>
        set((state) => ({ notificationPrefs: { ...state.notificationPrefs, ...prefs } })),
    }),
    {
      name: 'life-app-modules',
      version: 3,
      migrate: (persisted: any, version: number) => {
        if (version < 2) return {};
        if (version < 3) return { ...persisted, tabBarPins: ['/wheel', '/beliefs', '/habits', '/todos'] };
        return persisted;
      },
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        // Deep merge nested objects so new fields always get defaults
        notificationPrefs: {
          ...current.notificationPrefs,
          ...(persisted?.notificationPrefs ?? {}),
        },
        moduleOrder: persisted?.moduleOrder ?? current.moduleOrder,
        tabBarPins: persisted?.tabBarPins ?? current.tabBarPins,
      }),
    }
  )
);
