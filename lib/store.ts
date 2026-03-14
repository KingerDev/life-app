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
  notificationPrefs: NotificationPrefs;
  toggleQuests: () => void;
  toggleExperiments: () => void;
  toggleWheel: () => void;
  toggleBeliefs: () => void;
  toggleHabits: () => void;
  toggleTodos: () => void;
  toggleNotes: () => void;
  setModuleOrder: (order: ModuleId[]) => void;
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
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      toggleQuests: () => set((state) => ({ questsEnabled: !state.questsEnabled })),
      toggleExperiments: () => set((state) => ({ experimentsEnabled: !state.experimentsEnabled })),
      toggleWheel: () => set((state) => ({ wheelEnabled: !state.wheelEnabled })),
      toggleBeliefs: () => set((state) => ({ beliefsEnabled: !state.beliefsEnabled })),
      toggleHabits: () => set((state) => ({ habitsEnabled: !state.habitsEnabled })),
      toggleTodos: () => set((state) => ({ todosEnabled: !state.todosEnabled })),
      toggleNotes: () => set((state) => ({ notesEnabled: !state.notesEnabled })),
      setModuleOrder: (order) => set({ moduleOrder: order }),
      setNotificationPrefs: (prefs) =>
        set((state) => ({ notificationPrefs: { ...state.notificationPrefs, ...prefs } })),
    }),
    { name: 'life-app-modules' }
  )
);
