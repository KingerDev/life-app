export type QuestType = 'work' | 'life';
export type Quarter = 1 | 2 | 3 | 4;

export interface DiscoveryAnswers {
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
  question5?: string;
}

export interface QuarterlyQuest {
  id: string;
  quarter: Quarter;
  year: number;
  type: QuestType;
  discoveryAnswers?: DiscoveryAnswers;
  mainGoal: string;
  whyImportant: string;
  successCriteria: string;
  excitement: string;
  commitment: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryQuestion {
  key: keyof DiscoveryAnswers;
  question: string;
  placeholder: string;
}

export const WORK_INTRO_QUESTION = 'V PRÁCI, aký je ten jediný najdôležitejší cieľ alebo projekt, ktorý chceš dosiahnuť v nasledujúcich 3 mesiacoch? To bude tvoja Hlavná Úloha v Práci.';
export const LIFE_INTRO_QUESTION = 'V ŽIVOTE, aký je ten jediný najdôležitejší cieľ alebo projekt, ktorý chceš dosiahnuť v nasledujúcich 3 mesiacoch? To bude tvoja Hlavná Úloha v Živote.';

export const WORK_DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  { key: 'question1', question: 'Aká je tá 1 vec, ktorá, ak by sa dosiahla, by posunula ručičku najviac zo všetkého?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question2', question: 'Ak by si sa rýchlo posunul o 3 mesiace dopredu, aký je ten jeden úspech, na ktorý by si bol najviac hrdý?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question3', question: 'Aká je tá jedna vec, ktorá by urobila všetko ostatné jednoduchším alebo zbytočným?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question4', question: 'Aká je tá jedna vec, ktorú si odkladal, ale vieš, že by bola transformačná, ak by si sa jej chopil?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question5', question: '„Ak by som strávil prvé 2 hodiny svojho pracovného dňa čisto zameraný na X, malo by to obrovský vplyv na moju prácu."', placeholder: 'Čo je to X pre teba?' },
];

export const LIFE_DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  { key: 'question1', question: 'Aká je tá jedna vec, ktorá, ak by sa dosiahla, by priniesla najviac radosti, naplnenia alebo pokoja do tvojho osobného života?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question2', question: 'Ak by si sa rýchlo posunul o tri mesiace dopredu, aký je ten jeden úspech, na ktorý by si sa cítil najviac hrdý?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question3', question: 'Aká je tá jedna zmena, ktorá by pozitívne ovplyvnila každú inú oblasť tvojho života?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question4', question: 'Aká je tá jedna vec, ktorej si sa vyhýbal, ale vieš, že by mala transformačný efekt na tvoje vzťahy/šťastie?', placeholder: 'Napíš svoju odpoveď...' },
  { key: 'question5', question: '„Ak by som venoval hodinu každého dňa čisto zameraný na X, malo by to hlboký vplyv na môj život."', placeholder: 'Čo je to X pre teba?' },
];

export interface QuestFormField {
  key: 'mainGoal' | 'whyImportant' | 'successCriteria' | 'excitement' | 'commitment';
  label: string;
  placeholder: string;
}

export const WORK_FORM_FIELDS: QuestFormField[] = [
  { key: 'mainGoal', label: 'Moja Hlavná Úloha v Práci je...', placeholder: 'Napíš svoj hlavný cieľ' },
  { key: 'whyImportant', label: 'Toto je tá jediná najdôležitejšia vec, ktorú musím dosiahnuť tento štvrťrok, pretože...', placeholder: 'Prečo je to dôležité?' },
  { key: 'successCriteria', label: 'Na dokončenie Úlohy sa zaväzujem, že urobím... (objektívne overiteľné kritériá)', placeholder: 'Ako budeš vedieť, že si to dosiahol?' },
  { key: 'excitement', label: 'Toto sa mi zdá naozaj vzrušujúce a presvedčivé, pretože...', placeholder: 'Čo ťa na tom vzrušuje?' },
  { key: 'commitment', label: 'Aby som sa uistil, že dokončím Úlohu, idem...', placeholder: 'Aký je tvoj záväzok?' },
];

export const LIFE_FORM_FIELDS: QuestFormField[] = [
  { key: 'mainGoal', label: 'Moja Hlavná Úloha v Živote je...', placeholder: 'Napíš svoj hlavný cieľ' },
  { key: 'whyImportant', label: 'Toto je tá jediná najdôležitejšia vec, ktorú musím dosiahnuť tento štvrťrok, pretože...', placeholder: 'Prečo je to dôležité?' },
  { key: 'successCriteria', label: 'Na dokončenie Úlohy sa zaväzujem, že urobím... (objektívne overiteľné kritériá)', placeholder: 'Ako budeš vedieť, že si to dosiahol?' },
  { key: 'excitement', label: 'Toto sa mi zdá naozaj vzrušujúce a presvedčivé, pretože...', placeholder: 'Čo ťa na tom vzrušuje?' },
  { key: 'commitment', label: 'Aby som sa uistil, že dokončím Úlohu, idem...', placeholder: 'Aký je tvoj záväzok?' },
];

export const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  work: 'Práca',
  life: 'Život',
};

export const QUARTER_LABELS: Record<Quarter, string> = {
  1: 'Q1 (Január - Marec)',
  2: 'Q2 (Apríl - Jún)',
  3: 'Q3 (Júl - September)',
  4: 'Q4 (Október - December)',
};

export function getCurrentQuarter(): Quarter {
  const month = new Date().getMonth() + 1;
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export function formatQuarterLabel(quarter: Quarter, year: number): string {
  const names: Record<Quarter, string> = { 1: 'Q1', 2: 'Q2', 3: 'Q3', 4: 'Q4' };
  return `${names[quarter]} ${year}`;
}

export function getQuarterDescription(quarter: Quarter): string {
  const desc: Record<Quarter, string> = {
    1: 'Január - Marec', 2: 'Apríl - Jún',
    3: 'Júl - September', 4: 'Október - December',
  };
  return desc[quarter];
}

export function isCurrentQuarter(quarter: Quarter, year: number): boolean {
  const q = getCurrentQuarter();
  const y = new Date().getFullYear();
  return quarter === q && year === y;
}

export function getDaysRemainingInQuarter(): number {
  const quarter = getCurrentQuarter();
  const year = new Date().getFullYear();
  const endMonths = [2, 5, 8, 11];
  const endMonth = endMonths[quarter - 1];
  const end = new Date(year, endMonth + 1, 0);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function getCurrentQuarterAndYear(): { quarter: Quarter; year: number } {
  return { quarter: getCurrentQuarter(), year: new Date().getFullYear() };
}

export function getQuarterProgress(): { daysElapsed: number; totalDays: number; percentage: number; daysRemaining: number } {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = getCurrentQuarter();
  const quarterStarts = [
    new Date(year, 0, 1),
    new Date(year, 3, 1),
    new Date(year, 6, 1),
    new Date(year, 9, 1),
  ];
  const quarterEnds = [
    new Date(year, 3, 0),
    new Date(year, 6, 0),
    new Date(year, 9, 0),
    new Date(year + 1, 0, 0),
  ];
  const start = quarterStarts[quarter - 1];
  const end = quarterEnds[quarter - 1];
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const percentage = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
  return { daysElapsed, totalDays, percentage, daysRemaining };
}
