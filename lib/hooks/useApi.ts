'use client';

import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { createApiClient } from '@/lib/api/client';
import { createAssessmentsApi } from '@/lib/api/assessments';
import { createBeliefsApi } from '@/lib/api/beliefs';
import { createExperimentsApi } from '@/lib/api/experiments';
import { createQuestsApi } from '@/lib/api/quests';

export function useApi() {
  const { getToken } = useAuth();

  const api = useMemo(() => {
    const client = createApiClient(() => getToken());
    return {
      assessments: createAssessmentsApi(client),
      beliefs: createBeliefsApi(client),
      experiments: createExperimentsApi(client),
      quests: createQuestsApi(client),
    };
  }, [getToken]);

  return api;
}
