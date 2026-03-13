'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModulesState {
  questsEnabled: boolean;
  experimentsEnabled: boolean;
  wheelEnabled: boolean;
  beliefsEnabled: boolean;
  habitsEnabled: boolean;
  todosEnabled: boolean;
  toggleQuests: () => void;
  toggleExperiments: () => void;
  toggleWheel: () => void;
  toggleBeliefs: () => void;
  toggleHabits: () => void;
  toggleTodos: () => void;
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
      toggleQuests: () => set((state) => ({ questsEnabled: !state.questsEnabled })),
      toggleExperiments: () => set((state) => ({ experimentsEnabled: !state.experimentsEnabled })),
      toggleWheel: () => set((state) => ({ wheelEnabled: !state.wheelEnabled })),
      toggleBeliefs: () => set((state) => ({ beliefsEnabled: !state.beliefsEnabled })),
      toggleHabits: () => set((state) => ({ habitsEnabled: !state.habitsEnabled })),
      toggleTodos: () => set((state) => ({ todosEnabled: !state.todosEnabled })),
    }),
    { name: 'life-app-modules' }
  )
);
