import type { AxiosInstance } from 'axios';
import type {
  TinyExperiment, ExperimentCheckIn, ExperimentSuggestion,
  ExperimentProgress, CreateExperimentPayload, UpdateExperimentPayload,
  CreateCheckInPayload, FieldNotes, PatternInsights, ResearchQuestion, ExperimentPact,
} from '@/types/experiments';
import type { BeliefDomain } from '@/types/beliefs';
import type { LifeAspectId } from '@/types/wheel-of-life';

export interface PaginatedExperimentsResponse {
  data: TinyExperiment[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFieldNotes(notes: any): FieldNotes {
  return {
    whatFeltGood: notes.what_felt_good || notes.whatFeltGood || '',
    whatDidntFeelGood: notes.what_didnt_feel_good || notes.whatDidntFeelGood || '',
    curiosities: notes.curiosities || '',
    inspiringPeople: notes.inspiring_people || notes.inspiringPeople || '',
    flowWork: notes.flow_work || notes.flowWork || '',
    procrastinationWork: notes.procrastination_work || notes.procrastinationWork || '',
    lessActivities: notes.less_activities || notes.lessActivities || '',
    moreActivities: notes.more_activities || notes.moreActivities || '',
    skillsToExplore: notes.skills_to_explore || notes.skillsToExplore || '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePatterns(patterns: any): PatternInsights {
  return {
    patternA: patterns.pattern_a || patterns.patternA || '',
    patternB: patterns.pattern_b || patterns.patternB || '',
    patternC: patterns.pattern_c || patterns.patternC || '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResearchQuestion(question: any): ResearchQuestion {
  return { question: question.question || '' };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePact(pact: any): ExperimentPact {
  return { action: pact.action || '', duration: pact.duration || '' };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeExperiment(exp: any): TinyExperiment {
  return {
    id: exp.id,
    userId: exp.user_id || exp.userId,
    domainId: (exp.domain_id || exp.domainId) as BeliefDomain,
    fieldNotes: normalizeFieldNotes(exp.field_notes || exp.fieldNotes || {}),
    patterns: normalizePatterns(exp.patterns || {}),
    researchQuestion: normalizeResearchQuestion(exp.research_question || exp.researchQuestion || {}),
    pact: normalizePact(exp.pact || {}),
    durationValue: exp.duration_value ?? exp.durationValue ?? 0,
    durationType: exp.duration_type || exp.durationType,
    startDate: exp.start_date || exp.startDate,
    endDate: exp.end_date || exp.endDate,
    status: exp.status,
    suggestionSource: exp.suggestion_source || exp.suggestionSource,
    relatedAspectId: (exp.related_aspect_id || exp.relatedAspectId) as LifeAspectId | undefined,
    createdAt: exp.created_at || exp.createdAt,
    updatedAt: exp.updated_at || exp.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCheckIn(checkIn: any): ExperimentCheckIn {
  return {
    id: checkIn.id,
    experimentId: checkIn.experiment_id || checkIn.experimentId,
    date: checkIn.date,
    completed: checkIn.completed ?? false,
    notes: checkIn.notes,
    createdAt: checkIn.created_at || checkIn.createdAt,
    updatedAt: checkIn.updated_at || checkIn.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSuggestion(suggestion: any): ExperimentSuggestion {
  return {
    domainId: (suggestion.domain_id || suggestion.domainId) as BeliefDomain,
    domainLabel: suggestion.domain_label || suggestion.domainLabel,
    source: 'wheel_of_life',
    reason: suggestion.reason || '',
    aspectScore: suggestion.aspect_score ?? suggestion.aspectScore,
    priority: suggestion.priority ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProgress(progress: any): ExperimentProgress {
  return {
    experimentId: progress.experiment_id || progress.experimentId,
    totalDays: progress.total_days ?? progress.totalDays ?? 0,
    daysElapsed: progress.days_elapsed ?? progress.daysElapsed ?? 0,
    daysRemaining: progress.days_remaining ?? progress.daysRemaining ?? 0,
    checkInsCount: progress.check_ins_count ?? progress.checkInsCount ?? 0,
    completedCount: progress.completed_count ?? progress.completedCount ?? 0,
    completionRate: progress.completion_rate ?? progress.completionRate ?? 0,
    currentStreak: progress.current_streak ?? progress.currentStreak ?? 0,
    longestStreak: progress.longest_streak ?? progress.longestStreak ?? 0,
    needsCheckInToday: progress.needs_check_in_today ?? progress.needsCheckInToday ?? false,
    completedToday: progress.completed_today ?? progress.completedToday ?? false,
  };
}

function serializeCreatePayload(payload: CreateExperimentPayload) {
  return {
    domain_id: payload.domainId,
    field_notes: {
      what_felt_good: payload.fieldNotes.whatFeltGood,
      what_didnt_feel_good: payload.fieldNotes.whatDidntFeelGood,
      curiosities: payload.fieldNotes.curiosities,
      inspiring_people: payload.fieldNotes.inspiringPeople,
      flow_work: payload.fieldNotes.flowWork,
      procrastination_work: payload.fieldNotes.procrastinationWork,
      less_activities: payload.fieldNotes.lessActivities,
      more_activities: payload.fieldNotes.moreActivities,
      skills_to_explore: payload.fieldNotes.skillsToExplore,
    },
    patterns: {
      pattern_a: payload.patterns.patternA,
      pattern_b: payload.patterns.patternB,
      pattern_c: payload.patterns.patternC,
    },
    research_question: { question: payload.researchQuestion.question },
    pact: { action: payload.pact.action, duration: payload.pact.duration },
    duration_value: payload.durationValue,
    duration_type: payload.durationType,
    start_date: payload.startDate,
    suggestion_source: payload.suggestionSource,
    related_aspect_id: payload.relatedAspectId,
  };
}

function serializeUpdatePayload(payload: UpdateExperimentPayload) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  if (payload.fieldNotes) {
    result.field_notes = {
      what_felt_good: payload.fieldNotes.whatFeltGood,
      what_didnt_feel_good: payload.fieldNotes.whatDidntFeelGood,
      curiosities: payload.fieldNotes.curiosities,
      inspiring_people: payload.fieldNotes.inspiringPeople,
      flow_work: payload.fieldNotes.flowWork,
      procrastination_work: payload.fieldNotes.procrastinationWork,
      less_activities: payload.fieldNotes.lessActivities,
      more_activities: payload.fieldNotes.moreActivities,
      skills_to_explore: payload.fieldNotes.skillsToExplore,
    };
  }
  if (payload.patterns) {
    result.patterns = {
      pattern_a: payload.patterns.patternA,
      pattern_b: payload.patterns.patternB,
      pattern_c: payload.patterns.patternC,
    };
  }
  if (payload.researchQuestion) result.research_question = { question: payload.researchQuestion.question };
  if (payload.pact) result.pact = { action: payload.pact.action, duration: payload.pact.duration };
  if (payload.durationValue !== undefined) result.duration_value = payload.durationValue;
  if (payload.durationType) result.duration_type = payload.durationType;
  if (payload.startDate) result.start_date = payload.startDate;
  return result;
}

export function createExperimentsApi(client: AxiosInstance) {
  return {
    async getActive(): Promise<TinyExperiment[]> {
      const response = await client.get('/api/experiments');
      return response.data.data.map(normalizeExperiment);
    },

    async getSuggestions(): Promise<ExperimentSuggestion[]> {
      const response = await client.get('/api/experiments/suggestions');
      return response.data.data.map(normalizeSuggestion);
    },

    async getHistory(page: number = 1): Promise<PaginatedExperimentsResponse> {
      const response = await client.get('/api/experiments/history', { params: { page } });
      return { data: response.data.data.map(normalizeExperiment), meta: response.data.meta };
    },

    async get(id: string): Promise<TinyExperiment> {
      const response = await client.get(`/api/experiments/${id}`);
      return normalizeExperiment(response.data.data);
    },

    async create(payload: CreateExperimentPayload): Promise<TinyExperiment> {
      const response = await client.post('/api/experiments', serializeCreatePayload(payload));
      return normalizeExperiment(response.data.data);
    },

    async update(id: string, payload: UpdateExperimentPayload): Promise<TinyExperiment> {
      const response = await client.patch(`/api/experiments/${id}`, serializeUpdatePayload(payload));
      return normalizeExperiment(response.data.data);
    },

    async delete(id: string): Promise<void> {
      await client.delete(`/api/experiments/${id}`);
    },

    async abandon(id: string): Promise<TinyExperiment> {
      const response = await client.post(`/api/experiments/${id}/abandon`);
      return normalizeExperiment(response.data.data);
    },

    async complete(id: string): Promise<TinyExperiment> {
      const response = await client.post(`/api/experiments/${id}/complete`);
      return normalizeExperiment(response.data.data);
    },

    async getProgress(id: string): Promise<ExperimentProgress> {
      const response = await client.get(`/api/experiments/${id}/progress`);
      return normalizeProgress(response.data.data);
    },

    async addCheckIn(experimentId: string, payload: CreateCheckInPayload): Promise<ExperimentCheckIn> {
      const response = await client.post(`/api/experiments/${experimentId}/check-ins`, payload);
      return normalizeCheckIn(response.data.data);
    },

    async getCheckIns(experimentId: string): Promise<ExperimentCheckIn[]> {
      const response = await client.get(`/api/experiments/${experimentId}/check-ins`);
      return response.data.data.map(normalizeCheckIn);
    },

    async getTodayCheckIns(): Promise<ExperimentCheckIn[]> {
      const response = await client.get('/api/experiments/check-ins/today');
      return response.data.data.map(normalizeCheckIn);
    },
  };
}
