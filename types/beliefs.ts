export type BeliefDomain =
  | 'career'
  | 'relationships'
  | 'health'
  | 'creativity'
  | 'learning'
  | 'money'
  | 'confidence'
  | 'impact';

export interface BeliefEntry {
  id: string;
  date: string;
  domain: BeliefDomain;
  limitingBeliefId?: string;
  liberatingBeliefId?: string;
  limitingBeliefCustom?: string;
  liberatingBeliefCustom?: string;
  isCustom: boolean;
  plannedAction: string;
  reflection?: string;
  outcomeMatchedPrediction?: boolean;
  suggestionSource?: 'wheel_of_life' | 'quest' | 'manual';
  relatedAspectId?: string;
  relatedQuestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredefinedBelief {
  id: string;
  domain: BeliefDomain;
  limitingBelief: string;
  liberatingBelief: string;
  suggestedActions: string[];
}

export interface BeliefSuggestion {
  domain: BeliefDomain;
  domainLabel: string;
  source: 'wheel_of_life' | 'quest';
  reason: string;
  aspectId?: string;
  questId?: string;
  questType?: 'work' | 'life';
  priority: number;
}

export interface WeeklyBeliefStats {
  weekStart: string;
  weekEnd: string;
  totalEntries: number;
  daysCompleted: number;
  daysInWeek: number;
  domainCounts: Record<string, number>;
  mostCommonDomain: BeliefDomain | null;
  mostCommonDomainLabel: string | null;
  reflectionsCount: number;
  predictionNotMatchedPercent: number | null;
  evidence: Array<{
    date: string;
    domain: BeliefDomain;
    domainLabel: string;
    reflection: string;
  }>;
}

export interface DomainInfo {
  id: BeliefDomain;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const BELIEF_DOMAINS: DomainInfo[] = [
  { id: 'career', label: 'Kariéra', icon: 'Briefcase', color: '#3b82f6', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'relationships', label: 'Vzťahy', icon: 'Heart', color: '#ec4899', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'health', label: 'Zdravie', icon: 'Activity', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'creativity', label: 'Kreativita', icon: 'Palette', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'learning', label: 'Učenie', icon: 'BookOpen', color: '#8b5cf6', bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  { id: 'money', label: 'Peniaze', icon: 'Wallet', color: '#22c55e', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'confidence', label: 'Sebadôvera', icon: 'Star', color: '#eab308', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'impact', label: 'Dopad', icon: 'Globe', color: '#06b6d4', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
];

export const PREDEFINED_BELIEFS: PredefinedBelief[] = [
  // CAREER (4 beliefs)
  {
    id: 'career_1',
    domain: 'career',
    limitingBelief: 'Nie som kvalifikovaný na väčšie roly',
    liberatingBelief: 'Môžem rásť do väčších rolí zbieraním dôkazov o mojich schopnostiach',
    suggestedActions: [
      'Pošli jeden email ohľadom náročnejšej pozície',
      'Prihlás sa na 30 sekúnd na dnešnom meetingu',
      'Pracuj na prioritnom projekte 10 minút pred kontrolou emailov',
    ],
  },
  {
    id: 'career_2',
    domain: 'career',
    limitingBelief: 'Nie som prirodzený líder',
    liberatingBelief: 'Vedenie je zručnosť, ktorú rozvíjam praxou, nie vrodená vlastnosť',
    suggestedActions: [
      'Ponúkni sa viesť jeden malý projekt alebo meeting',
      'Daj spätnú väzbu jednému kolegovi',
      'Prevezmem zodpovednosť za jeden rozhodnutie dnes',
    ],
  },
  {
    id: 'career_3',
    domain: 'career',
    limitingBelief: 'Keď sa ozvem na meetingu, budem vyzerať hlúpo',
    liberatingBelief: 'Ozvať sa, aj nedokonale, buduje moju dôveryhodnosť a sebadôveru',
    suggestedActions: [
      'Povedz aspoň jednu vec na dnešnom meetingu',
      'Polož jednu otázku, aj keď si nie si istý',
      'Zdieľaj jeden nápad, aj keď nie je úplne hotový',
    ],
  },
  {
    id: 'career_4',
    domain: 'career',
    limitingBelief: 'Vždy prokrastinujem na dôležitej práci',
    liberatingBelief: 'Môžem konať na dôležitej práci v malých krokoch, aj keď sa cítim nepohodlne',
    suggestedActions: [
      'Pracuj na najdôležitejšej úlohe 10 minút hneď ráno',
      'Rozbi veľkú úlohu na 3 malé kroky',
      'Nastav si timer na 25 minút a začni',
    ],
  },
  // RELATIONSHIPS (4 beliefs)
  {
    id: 'relationships_1',
    domain: 'relationships',
    limitingBelief: 'Nezvládnem ťažké rozhovory bez toho, aby sa všetko rozpadlo',
    liberatingBelief: 'Dokážem navigovať ťažké rozhovory a často nájdem riešenie, keď adresujem veci priamo',
    suggestedActions: [
      'Adresuj jeden malý problém namiesto toho, aby si ho nechal narastať',
      'Zdieľaj jeden úprimný pocit, aj keď sa ti chveje hlas',
      'Začni ťažký rozhovor slovami "Potrebujem ti niečo povedať..."',
    ],
  },
  {
    id: 'relationships_2',
    domain: 'relationships',
    limitingBelief: 'Žiadať o pomoc ma robí príťažou',
    liberatingBelief: 'Žiadať o pomoc prehlbuje spojenie a dáva ostatným možnosť prispieť do môjho života',
    suggestedActions: [
      'Požiadaj jednu osobu o konkrétnu pomoc s niečím',
      'Prijmi ponuku pomoci namiesto toho, aby si ju odmietol',
      'Povedz niekomu, že potrebuješ podporu',
    ],
  },
  {
    id: 'relationships_3',
    domain: 'relationships',
    limitingBelief: 'Ak si nastavím hranice, budú ma považovať za sebeckého',
    liberatingBelief: 'Jasné hranice vytvárajú zdravšie vzťahy postavené na vzájomnom rešpekte',
    suggestedActions: [
      'Povedz "nie" jednej požiadavke, ktorá ti nevyhovuje',
      'Jasne vyjadri jednu svoju preferenciu',
      'Ukonči rozhovor, keď potrebuješ čas pre seba',
    ],
  },
  {
    id: 'relationships_4',
    domain: 'relationships',
    limitingBelief: 'Ľudia, ktorí so mnou nesúhlasia, sa mýlia (alebo sú zlí)',
    liberatingBelief: 'Rôzne perspektívy môžu koexistovať a zvedavosť ohľadom nezhody často odhaľuje niečo, čo mi uniká',
    suggestedActions: [
      'Spýtaj sa "Prečo si to myslíš?" namiesto obhajoby',
      'Nájdi jednu vec, s ktorou môžeš súhlasiť u oponenta',
      'Počúvaj 2 minúty bez prerušenia',
    ],
  },
  // HEALTH (4 beliefs)
  {
    id: 'health_1',
    domain: 'health',
    limitingBelief: 'Moje telo je také kvôli génom, nič to nezmení',
    liberatingBelief: 'Malé, konzistentné zmeny v pohybe, stravovaní a odpočinku sa v čase sčítavajú do merateľných zlepšení',
    suggestedActions: [
      'Hýb sa 5 minút akýmkoľvek spôsobom, ktorý ti príde dobre',
      'Vyskúšaj jednu malú zmenu v jedle alebo pohybe',
      'Sleduj, ako sa cítiš po jednej zdravej voľbe',
    ],
  },
  {
    id: 'health_2',
    domain: 'health',
    limitingBelief: 'Starnutie znamená nevyhnutný úpadok',
    liberatingBelief: 'Ako starnem je významne ovplyvnené mojimi presvedčeniami o starnutí, nie len biológiou',
    suggestedActions: [
      'Nájdi jeden príklad človeka, ktorý sa zlepšil v tvojom veku',
      'Všimni si jednu vec, ktorú tvoje telo robí dobre',
      'Vyskúšaj niečo nové, o čom si myslel, že je "pre mladších"',
    ],
  },
  {
    id: 'health_3',
    domain: 'health',
    limitingBelief: 'Už som si zdravie pokazil, je neskoro niečo meniť',
    liberatingBelief: 'Moje telo reaguje na pozitívne zmeny v každom veku a začať teraz je vždy lepšie ako čakať',
    suggestedActions: [
      'Urob jednu zdravú voľbu dnes',
      'Vyhľadaj jedného človeka, ktorý zlepšil zdravie v tvojom veku',
      'Začni s niečím malým - 5 minút pohybu alebo jeden zdravý pokrm',
    ],
  },
  {
    id: 'health_4',
    domain: 'health',
    limitingBelief: 'Nemám disciplínu na pravidelné cvičenie',
    liberatingBelief: 'Môžem budovať konzistentné pohybové návyky začatím s niečím menším, ako sa zdá zmysluplné',
    suggestedActions: [
      'Urob 5 drepov hneď teraz',
      'Nastav si pripomienku na 2-minútové cvičenie',
      'Spoj pohyb s niečím, čo už robíš (napr. drepy pri varení kávy)',
    ],
  },
  // CREATIVITY (4 beliefs)
  {
    id: 'creativity_1',
    domain: 'creativity',
    limitingBelief: 'Musím byť originálny, inak nemá zmysel tvoriť',
    liberatingBelief: 'Moja jedinečná perspektíva a skúsenosti robia moju prácu hodnotnou, aj keď skúmam známe témy',
    suggestedActions: [
      'Vytvor niečo bez toho, aby si skúmal, či to už existuje',
      'Pridaj svoj pohľad k existujúcej myšlienke',
      'Pracuj na projekte 15 minút bez posudzovania výsledku',
    ],
  },
  {
    id: 'creativity_2',
    domain: 'creativity',
    limitingBelief: 'Nemôžem zdieľať prácu, kým nie je dokonalá',
    liberatingBelief: 'Zdieľanie nedokonalej práce je spôsob, ako sa učím, zlepšujem a nachádzam ľudí, s ktorými rezonuje',
    suggestedActions: [
      'Zdieľaj jednu vec pred tým, ako si myslíš, že je "hotová"',
      'Požiadaj o spätnú väzbu na rozpracovaný projekt',
      'Zverejni jeden nápad, aj keď nie je úplne dotvorený',
    ],
  },
  {
    id: 'creativity_3',
    domain: 'creativity',
    limitingBelief: 'Skutoční kreatívci takto nebojujú - asi nie som talentovaný',
    liberatingBelief: 'Boj a neistota sú súčasťou tvorivého procesu, nie dôkaz, že to robím zle',
    suggestedActions: [
      'Prečítaj si o boji známeho tvorcu',
      'Pokračuj v práci aj keď sa cítiš neisto',
      'Pripomeň si, že ťažkosti sú normálne',
    ],
  },
  {
    id: 'creativity_4',
    domain: 'creativity',
    limitingBelief: 'Všetci ostatní to robia lepšie ako ja',
    liberatingBelief: 'Porovnanie mi ukazuje, čo je možné, ale moja práca slúži ľuďom v rôznych štádiách s rôznymi potrebami',
    suggestedActions: [
      'Prestaň scrollovať a vytvor niečo vlastné',
      'Napíš 3 veci, na ktoré si hrdý vo svojej práci',
      'Zameraj sa na jedného človeka, ktorému by tvoja práca pomohla',
    ],
  },
  // LEARNING (4 beliefs)
  {
    id: 'learning_1',
    domain: 'learning',
    limitingBelief: 'Som príliš starý na to, aby som sa toto naučil',
    liberatingBelief: 'Vek prináša skúsenosti a kontext, ktoré môžu urýchliť učenie spôsobmi, ktoré mladosť nedokáže',
    suggestedActions: [
      'Stráv 15 minút učením niečoho, o čom si myslel, že je "pre mladších"',
      'Nájdi jedného človeka, ktorý sa naučil niečo nové vo vyššom veku',
      'Začni s jednou lekciou alebo tutoriálom',
    ],
  },
  {
    id: 'learning_2',
    domain: 'learning',
    limitingBelief: 'Nie som prirodzene nadaný na technické/kreatívne/analytické veci',
    liberatingBelief: 'Zručnosti sa rozvíjajú praxou a dobrým vedením, nie len vrodeným talentom',
    suggestedActions: [
      'Stráv 15 minút cvičením toho, na čo si "nenadaný"',
      'Požiadaj o pomoc s niečím, čomu sa vyhýbaš',
      'Sleduj jeden tutoriál pre začiatočníkov',
    ],
  },
  {
    id: 'learning_3',
    domain: 'learning',
    limitingBelief: 'Robiť chyby znamená, že to robím zle',
    liberatingBelief: 'Chyby sú spôsob, ako identifikujem, čo ešte nerozumiem - sú to dáta, nie zlyhanie',
    suggestedActions: [
      'Urob jednu chybu zámerne, aby si cvičil reakciu na ňu',
      'Zapíš si, čo si sa naučil z poslednej chyby',
      'Povedz "Zaujímavé" namiesto "Som hlúpy" pri ďalšej chybe',
    ],
  },
  {
    id: 'learning_4',
    domain: 'learning',
    limitingBelief: 'Je neskoro meniť kariéru/smer v tomto štádiu života',
    liberatingBelief: 'Ľudia úspešne menia smery v každom veku. Moje nazbierané skúsenosti sú aktívum, nie záťaž',
    suggestedActions: [
      'Vyhľadaj jedného človeka, ktorý zmenil kariéru v tvojom veku',
      'Urob jeden malý krok smerom k novému záujmu',
      'Porozprávaj sa s niekým v oblasti, ktorá ťa zaujíma',
    ],
  },
  // MONEY (4 beliefs)
  {
    id: 'money_1',
    domain: 'money',
    limitingBelief: 'Moja hodnota je určená tým, koľko zarábam',
    liberatingBelief: 'Peniaze sú jeden nástroj na vytváranie života, aký chcem, ale nie miera mojej vrodenej hodnoty',
    suggestedActions: [
      'Napíš 3 veci, ktoré ťa robia hodnotným mimo príjmu',
      'Identifikuj jedno nefinančné meradlo úspechu',
      'Stráv čas s niekým, kto ťa oceňuje pre to, kto si',
    ],
  },
  {
    id: 'money_2',
    domain: 'money',
    limitingBelief: 'Záležať mi na peniazoch ma robí povrchným alebo chamtivým',
    liberatingBelief: 'Peniaze sú neutrálny nástroj. Zodpovedný prístup k nim mi umožňuje podporiť seba, ostatných a to, na čom mi záleží',
    suggestedActions: [
      'Mej jeden rozhovor o financiách, ktorému si sa vyhýbal',
      'Nastav si jeden finančný cieľ bez hanby',
      'Prečítaj si jednu kapitolu o osobných financiách',
    ],
  },
  {
    id: 'money_3',
    domain: 'money',
    limitingBelief: 'Musím zarobiť X do Y veku, inak som zlyhal',
    liberatingBelief: 'Finančný úspech má rôzne časové osi. Moja cesta nemusí zodpovedať ľubovoľným externým kritériám',
    suggestedActions: [
      'Prestaň porovnávať svoj finančný stav s inými',
      'Definuj úspech vlastnými podmienkami',
      'Osláv jeden finančný úspech, ktorý si dosiahol',
    ],
  },
  {
    id: 'money_4',
    domain: 'money',
    limitingBelief: 'Nie som dobrý s peniazmi',
    liberatingBelief: 'Hospodárenie s peniazmi je naučiteľná zručnosť, ktorú môžem rozvíjať praxou, vzdelávaním a žiadaním o pomoc',
    suggestedActions: [
      'Stráv 15 minút učením sa jedného finančného konceptu',
      'Sleduj svoje výdavky jeden deň',
      'Požiadaj niekoho o radu ohľadom financií',
    ],
  },
  // CONFIDENCE (4 beliefs)
  {
    id: 'confidence_1',
    domain: 'confidence',
    limitingBelief: 'Som podvodník, ľudia to ešte nezistili',
    liberatingBelief: 'Cítiť neistotu neznamená, že som nekvalifikovaný - znamená to, že sa stále učím a rastiem',
    suggestedActions: [
      'Zdieľaj jednu neistotu alebo boj namiesto predstierania sebadôvery',
      'Napíš 3 veci, v ktorých si objektívne dobrý',
      'Pripomeň si, že aj experti majú pochybnosti',
    ],
  },
  {
    id: 'confidence_2',
    domain: 'confidence',
    limitingBelief: 'Všetci ostatní to majú vymyslené',
    liberatingBelief: 'Každý bojuje a pochybuje o sebe - sebadôvera často vyzerá ako istota zvonka, ale zriedka sa tak cíti zvnútra',
    suggestedActions: [
      'Spýtaj sa niekoho, koho obdivuješ, na jeho pochybnosti',
      'Prestaň scrollovať a porovnávať sa',
      'Pripomeň si, že sociálne siete ukazujú len to najlepšie',
    ],
  },
  {
    id: 'confidence_3',
    domain: 'confidence',
    limitingBelief: 'Som hodnotný len keď niečo dosahujem/pomáham/performujem',
    liberatingBelief: 'Moja hodnota nie je podmienená produktivitou - mám vrodenú hodnotu bez ohľadu na to, čo dosiahnem',
    suggestedActions: [
      'Urob niečo odpočinkové bez toho, aby si si to "zaslúžil" produktivitou',
      'Stráv čas s niekým bez agendy',
      'Povedz si "Som dosť" bez toho, aby si to spájal s výkonom',
    ],
  },
  {
    id: 'confidence_4',
    domain: 'confidence',
    limitingBelief: 'Keby som bol naozaj schopný, nebolo by to také ťažké',
    liberatingBelief: 'Náročnosť je súčasť zmysluplnej práce, nie dôkaz, že to robím zle alebo mi chýba schopnosť',
    suggestedActions: [
      'Všimni si jeden moment, keď bolo niečo ťažké, ale urobil si to',
      'Pripomeň si, že ťažké veci sú ťažké pre všetkých',
      'Osláv úsilie, nie len výsledok',
    ],
  },
  // IMPACT (4 beliefs)
  {
    id: 'impact_1',
    domain: 'impact',
    limitingBelief: 'Kto som ja, aby som s tým pomáhal/učil/viedol?',
    liberatingBelief: 'Nepotrebujem byť svetový expert. Stačí vedieť viac ako osoba, ktorej pomáham, alebo vidieť to, čo ona ešte nevidí',
    suggestedActions: [
      'Pomôž jednej osobe s niečím, v čom si dobrý',
      'Zdieľaj jednu vec, ktorú si sa naučil, aj keď sa zdá malá',
      'Ponúkni pomoc bez čakania na to, aby si bol "expert"',
    ],
  },
  {
    id: 'impact_2',
    domain: 'impact',
    limitingBelief: 'Môj príspevok je príliš malý na to, aby záležal',
    liberatingBelief: 'Malé, konzistentné príspevky sa v čase sčítavajú a šíria sa spôsobmi, ktoré nemôžem vždy sledovať alebo merať',
    suggestedActions: [
      'Urob jeden malý čin láskavosti dnes',
      'Zdieľaj jednu užitočnú vec, ktorú vieš',
      'Uznaj jeden príspevok, ktorý si tento týždeň urobil',
    ],
  },
  {
    id: 'impact_3',
    domain: 'impact',
    limitingBelief: 'Potrebujem viac skúseností/autority/referencií predtým, ako môžem mať skutočný dopad',
    liberatingBelief: 'Môžem prispievať zmysluplne už teraz s tým, čo viem a kým som - referencie nasledujú príspevok, nie naopak',
    suggestedActions: [
      'Urob jeden krok k väčšiemu cieľu bez toho, aby si videl celú cestu',
      'Začni s tým, čo máš, namiesto čakania na dokonalosť',
      'Ponúkni svoju pomoc niekomu dnes',
    ],
  },
  {
    id: 'impact_4',
    domain: 'impact',
    limitingBelief: 'Mať dopad vyžaduje obetovať všetko ostatné',
    liberatingBelief: 'Udržateľný dopad pochádza z konzistentnosti počas desaťročí, nie z vyhorenia v honbe za viditeľnými výsledkami',
    suggestedActions: [
      'Nastav si jednu hranicu, ktorá chráni tvoju energiu',
      'Urob jeden malý príspevok namiesto veľkého gesta',
      'Odpočiň si bez pocitu viny',
    ],
  },
];

export function getBeliefsByDomain(domain: BeliefDomain): PredefinedBelief[] {
  return PREDEFINED_BELIEFS.filter(b => b.domain === domain);
}

export function getBeliefById(id: string): PredefinedBelief | undefined {
  return PREDEFINED_BELIEFS.find(b => b.id === id);
}

export function getDomainInfo(domain: BeliefDomain): DomainInfo | undefined {
  return BELIEF_DOMAINS.find(d => d.id === domain);
}

export function getDomainLabel(domain: BeliefDomain): string {
  return getDomainInfo(domain)?.label ?? domain;
}

export function getLimitingBeliefText(entry: BeliefEntry): string {
  if (entry.isCustom && entry.limitingBeliefCustom) {
    return entry.limitingBeliefCustom;
  }
  if (entry.limitingBeliefId) {
    const belief = getBeliefById(entry.limitingBeliefId);
    return belief?.limitingBelief ?? '';
  }
  return '';
}

export function getLiberatingBeliefText(entry: BeliefEntry): string {
  if (entry.isCustom && entry.liberatingBeliefCustom) {
    return entry.liberatingBeliefCustom;
  }
  if (entry.liberatingBeliefId) {
    const belief = getBeliefById(entry.liberatingBeliefId);
    return belief?.liberatingBelief ?? '';
  }
  return '';
}
