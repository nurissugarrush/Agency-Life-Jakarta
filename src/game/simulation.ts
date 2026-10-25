/**
 * Agency Life: Jakarta Edition - Core Simulation Engine
 * Decoupled, pure functional simulation logic.
 */

import {
  GameState,
  CharacterStats,
  Gender,
  SocioeconomicStatus,
  NPC,
  JobRecord,
  CareerDepartment,
  CampaignBrief,
  CampaignResult,
  AwardWin,
  AwardFestival,
  AwardTier,
  InteractiveEvent,
  HousingAsset,
  VehicleAsset,
} from '../types/game';
import {
  JAKARTA_AGENCIES,
  CAREER_LADDERS,
  UNIVERSITIES,
  HOUSING_CATALOG,
  CAMPAIGN_BRIEFS_POOL,
  RANDOM_WORKPLACE_EVENTS,
} from './constants';

export { CAMPAIGN_BRIEFS_POOL };

export function formatIDR(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1_000_000_000_000) {
    return `${sign}Rp${(absAmount / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (absAmount >= 1_000_000_000) {
    return `${sign}Rp${(absAmount / 1_000_000_000).toFixed(1)}B`;
  }
  if (absAmount >= 1_000_000) {
    return `${sign}Rp${(absAmount / 1_000_000).toFixed(1)}M`;
  }
  return `${sign}Rp${Math.round(absAmount).toLocaleString('id-ID')}`;
}

export function formatFullIDR(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  return `${sign}Rp${Math.round(absAmount).toLocaleString('id-ID')}`;
}

export interface CharacterCreationParams {
  name: string;
  gender: Gender;
  avatarEmoji?: string;
  socioeconomic: SocioeconomicStatus;
  startingMoneyIDR: number;
  familyWealthIDR: number;
  homeNeighborhood?: string;
  initialStats?: Partial<CharacterStats>;
}

export function createInitialCharacter(params: CharacterCreationParams): GameState {
  const defaultNeighborhood = params.homeNeighborhood || (
    params.socioeconomic === 'scbd_conglomerate' ? 'Menteng' :
    params.socioeconomic === 'upper_middle' ? 'Pondok Indah' :
    params.socioeconomic === 'middle_class' ? 'Tebet' : 'Kemayoran'
  );

  const stats: CharacterStats = {
    happiness: params.initialStats?.happiness ?? 85,
    health: params.initialStats?.health ?? 90,
    intelligence: params.initialStats?.intelligence ?? 70,
    creativity: params.initialStats?.creativity ?? 80,
    looks: params.initialStats?.looks ?? 65,
    stress: params.initialStats?.stress ?? 10,
    charisma: params.initialStats?.charisma ?? 60,
    ambition: params.initialStats?.ambition ?? 75,
    luck: params.initialStats?.luck ?? 50,
  };

  const currentYear = 2026;

  // Generate Parents
  const fatherName = params.gender === 'female' ? 'Bambang Hartono' : 'Hendra Gunawan';
  const motherName = 'Ratna Kartika';

  const npcs: NPC[] = [
    {
      id: 'npc_father',
      name: fatherName,
      age: 32,
      relation: 'father',
      relationshipScore: 85,
      personality: 'supportive',
      occupation: params.socioeconomic === 'scbd_conglomerate' ? 'Business Commissioner' : 'Civil Servant / BUMN',
      alive: true,
    },
    {
      id: 'npc_mother',
      name: motherName,
      age: 29,
      relation: 'mother',
      relationshipScore: 92,
      personality: 'generous',
      occupation: params.socioeconomic === 'scbd_conglomerate' ? 'Art Collector & Philanthropist' : 'Teacher / Banker',
      alive: true,
    },
  ];

  const initialHousing: HousingAsset = {
    id: 'family_home',
    name: `${params.name ? params.name.split(' ')[0] : 'Family'} Residence`,
    neighborhood: defaultNeighborhood,
    type: 'family_home',
    monthlyRentOrCostIDR: 0,
    isOwned: true,
    comfortScore: params.socioeconomic === 'scbd_conglomerate' ? 95 : 60,
    prestigeScore: params.socioeconomic === 'scbd_conglomerate' ? 95 : 40,
  };

  const state: GameState = {
    version: 1,
    character: {
      id: `char_${Date.now()}`,
      name: params.name || (params.gender === 'female' ? 'Nadia Pramudita' : 'Dimas Pratama'),
      gender: params.gender,
      avatarEmoji: params.avatarEmoji || (params.gender === 'female' ? '👩‍💼' : '👨‍💼'),
      birthYear: currentYear,
      currentAge: 0,
      socioeconomic: params.socioeconomic,
      homeNeighborhood: defaultNeighborhood,
    },
    stats,
    moneyIDR: params.startingMoneyIDR,
    familyWealthIDR: params.familyWealthIDR,
    debtIDR: 0,
    stage: 'baby',
    education: {
      elementaryCompleted: false,
      highSchoolCompleted: false,
    },
    career: {
      pastJobs: [],
      freelanceClients: 0,
      industryReputation: 10,
      cannesLionsCount: 0,
      citraPariwaraCount: 0,
      totalAwardsCount: 0,
    },
    campaignHistory: [],
    assets: {
      currentHousing: initialHousing,
      ownedProperties: [],
      vehicles: [],
      investments: [],
    },
    npcs,
    history: [
      {
        id: 'evt_birth',
        age: 0,
        year: currentYear,
        title: 'Welcome to the World (Jakarta, Indonesia)',
        description: `You were born at RS Bunda Jakarta. Your family lives in ${defaultNeighborhood}. The doctor remarks that your first cry had exceptional resonant acoustics.`,
        category: 'birth',
        impact: { happiness: 10 },
      },
    ],
    godModeEnabled: true,
    soundEnabled: true,
    isGameOver: false,
  };

  return state;
}

export function calculateNetWorth(state: GameState): number {
  let netWorth = state.moneyIDR;

  // Add investments
  if (state.assets.investments) {
    for (const inv of state.assets.investments) {
      netWorth += inv.currentValueIDR;
    }
  }

  // Add owned properties
  if (state.assets.ownedProperties) {
    for (const prop of state.assets.ownedProperties) {
      netWorth += prop.purchasePriceIDR || 0;
    }
  }

  // Add vehicles
  if (state.assets.vehicles) {
    for (const v of state.assets.vehicles) {
      netWorth += v.resaleValueIDR;
    }
  }

  // Add owned agency valuation
  if (state.ownedAgency) {
    const agencyVal = state.ownedAgency.cashBalanceIDR + (state.ownedAgency.reputation * 50_000_000);
    netWorth += agencyVal;
  }

  // Subtract personal debt
  netWorth -= state.debtIDR;

  return netWorth;
}

/**
 * Advances the game by 1 year.
 */
export function advanceAge(currentState: GameState): GameState {
  if (currentState.isGameOver) return currentState;

  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const newAge = state.character.currentAge + 1;
  const currentYear = state.character.birthYear + newAge;
  state.character.currentAge = newAge;

  const eventsThisYear: string[] = [];

  // 1. Determine Life Stage
  if (newAge <= 5) {
    state.stage = 'baby';
  } else if (newAge <= 12) {
    state.stage = 'child';
  } else if (newAge <= 17) {
    state.stage = 'teen';
  } else if (newAge <= 22 && !state.career.currentJob && !state.education.university?.graduated) {
    state.stage = 'university';
  } else if (newAge >= 65 && !state.career.currentJob && !state.ownedAgency) {
    state.stage = 'retired';
  } else {
    state.stage = 'working';
  }

  // 2. Education Progression
  if (newAge === 6) {
    eventsThisYear.push('Began elementary school (SD) in Jakarta. You traded Pokemon cards and doodle in your notebook margins.');
  } else if (newAge === 12) {
    state.education.elementaryCompleted = true;
    eventsThisYear.push('Graduated from elementary school (SD) with flying colors! Your parents bought you ice cream at Ragusa.');
  } else if (newAge === 13) {
    eventsThisYear.push('Started junior high school (SMP). You started browsing aesthetic graphic design accounts on Instagram.');
  } else if (newAge === 15) {
    eventsThisYear.push('Entered high school (SMA). You joined the school magazine and designed posters for the annual Pensi festival.');
  } else if (newAge === 18) {
    state.education.highSchoolCompleted = true;
    // Auto enroll in UI or BINUS if not already
    if (!state.education.university) {
      const uni = UNIVERSITIES[0]; // UI Depok
      state.education.university = {
        name: uni.name,
        major: uni.major,
        gpa: 3.4,
        graduated: false,
      };
      eventsThisYear.push(`Graduated SMA! Enrolled at ${uni.name} studying ${uni.major}. You commute via KRL Commuter Line to Kampus UI.`);
    }
  } else if (newAge === 22 && state.education.university && !state.education.university.graduated) {
    state.education.university.graduated = true;
    state.stats.intelligence = Math.min(100, state.stats.intelligence + 10);
    state.stats.creativity = Math.min(100, state.stats.creativity + 8);
    eventsThisYear.push(`Graduated from ${state.education.university.name} with a Bachelor Degree! Your graduation photo in your toga was framed by your proud parents.`);
  }

  // 3. Financial Calculations
  let netIncomeThisYear = 0;
  let expensesThisYear = 0;

  if (state.career.currentJob) {
    const job = state.career.currentJob;
    job.yearsInRole += 1;

    // 12 months salary
    const annualBase = job.monthlySalaryIDR * 12;

    // 1 Month THR (Tunjangan Hari Raya) - Mandatory Indonesian Law!
    const thrBonus = job.monthlySalaryIDR;

    // Performance bonus (0 to 3 months) based on performance
    const bonusMonths = job.performance > 80 ? 2.5 : job.performance > 60 ? 1.0 : 0.2;
    const perfBonus = Math.round(job.monthlySalaryIDR * bonusMonths);

    const grossSalary = annualBase + thrBonus + perfBonus;

    // Progressive PPh 21 income tax in Indonesia (~5% - 20%)
    const taxRate = grossSalary > 500_000_000 ? 0.20 : grossSalary > 250_000_000 ? 0.15 : grossSalary > 60_000_000 ? 0.05 : 0;
    const taxes = Math.round(grossSalary * taxRate);
    const bpjs = Math.round(grossSalary * 0.04); // BPJS Kesehatan & Ketenagakerjaan

    netIncomeThisYear = grossSalary - taxes - bpjs;

    eventsThisYear.push(
      `Earned ${formatIDR(grossSalary)} (including 1-month THR bonus & performance bonus). Taxes (PPh 21) & BPJS deducted: ${formatIDR(taxes + bpjs)}.`
    );

    // Job performance drift
    if (job.performance > 50) {
      job.reputation = Math.min(100, job.reputation + 4);
      state.career.industryReputation = Math.min(100, state.career.industryReputation + 3);
    }
  }

  // Moonlighting / Freelance income
  if (state.career.freelanceClients > 0) {
    const freelanceMoney = state.career.freelanceClients * 15_000_000;
    netIncomeThisYear += freelanceMoney;
    state.stats.stress = Math.min(100, state.stats.stress + 8);
    eventsThisYear.push(`Completed freelance design & copywriting side-hustles, earning extra ${formatIDR(freelanceMoney)}.`);
  }

  // Living expenses
  if (newAge >= 18) {
    if (state.stage === 'university' && !state.career.currentJob) {
      // Supported by family/parents while studying in university
      expensesThisYear += 3_000_000; // Minimal personal pocket money
    } else {
      const housingRent = state.assets.currentHousing
        ? (state.assets.currentHousing.isOwned ? 0 : state.assets.currentHousing.monthlyRentOrCostIDR * 12)
        : 18_000_000;

      // Daily food, kopi susu, Gojek/Grab, electricity
      const lifestyleCost = state.career.currentJob ? 36_000_000 : 12_000_000;
      expensesThisYear += housingRent + lifestyleCost;

      // Vehicle maintenance
      if (state.assets.vehicles) {
        for (const v of state.assets.vehicles) {
          expensesThisYear += v.monthlyMaintenanceIDR * 12;
        }
      }
    }
  }

  // Investments return
  if (state.assets.investments) {
    for (const inv of state.assets.investments) {
      const growthFactor = 1 + (inv.annualReturnRatePct / 100) + ((Math.random() - 0.45) * 0.08);
      const newAmount = Math.max(0, Math.round(inv.currentValueIDR * growthFactor));
      inv.currentValueIDR = newAmount;
    }
  }

  // Apply money change
  state.moneyIDR += (netIncomeThisYear - expensesThisYear);

  // 4. Owned Agency Business Loop
  if (state.ownedAgency) {
    const agency = state.ownedAgency;
    let agencyRevenue = 0;
    let agencyPayroll = 0;

    for (const client of agency.clients) {
      agencyRevenue += client.monthlyRetainerIDR * 12;
      client.contractYearsRemaining = Math.max(0, client.contractYearsRemaining - 1);
    }

    for (const emp of agency.employees) {
      agencyPayroll += emp.monthlySalaryIDR * 13; // 12 + 1 THR
    }

    const agencyAnnualRent = agency.monthlyOverheadIDR * 12;
    const agencyExpenses = agencyPayroll + agencyAnnualRent;
    const agencyNetProfit = agencyRevenue - agencyExpenses;

    agency.cashBalanceIDR += agencyNetProfit;

    if (agencyNetProfit > 0) {
      // Owner takes dividend
      const dividend = Math.round(agencyNetProfit * 0.4);
      agency.cashBalanceIDR -= dividend;
      state.moneyIDR += dividend;
      eventsThisYear.push(`Your agency ${agency.name} generated ${formatIDR(agencyRevenue)} in client retainers! You paid yourself ${formatIDR(dividend)} in executive dividends.`);
    } else {
      eventsThisYear.push(`Your agency ${agency.name} ran a deficit of ${formatIDR(Math.abs(agencyNetProfit))} this year. Watch cash reserves!`);
    }

    // Reputation impact
    agency.reputation = Math.min(100, Math.max(10, agency.reputation + (agencyNetProfit > 0 ? 3 : -4)));
  }

  // 5. Stat Evolution
  if (state.career.currentJob) {
    // Agency workload stress
    const agencyData = JAKARTA_AGENCIES.find((a) => a.id === state.career.currentJob?.agencyId);
    if (agencyData?.workload === 'brutal_overtime') {
      state.stats.stress = Math.min(100, state.stats.stress + 14);
      state.stats.health = Math.max(10, state.stats.health - 6);
    } else if (agencyData?.workload === 'high') {
      state.stats.stress = Math.min(100, state.stats.stress + 8);
      state.stats.health = Math.max(10, state.stats.health - 3);
    } else {
      state.stats.stress = Math.max(5, state.stats.stress - 3);
    }
  }

  // Health decay with advanced age
  if (newAge > 50) {
    state.stats.health = Math.max(5, state.stats.health - 2);
  }
  if (newAge > 70) {
    state.stats.health = Math.max(2, state.stats.health - 5);
  }

  // Burnout check
  if (state.stats.stress >= 95) {
    state.stats.happiness = Math.max(10, state.stats.happiness - 25);
    eventsThisYear.push('🚨 Critical Burnout: You collapsed in the agency pantry from severe exhaustion and acid reflux. A doctor ordered mandatory bed rest.');
  }

  // 6. NPC aging and relationship updates
  for (const npc of state.npcs) {
    if (npc.alive) {
      npc.age += 1;
      // Slight natural relationship decay unless interacted with
      npc.relationshipScore = Math.max(10, npc.relationshipScore - 2);

      // Parents mortality check
      if (npc.relation === 'father' || npc.relation === 'mother') {
        if (npc.age > 75 && Math.random() < 0.12) {
          npc.alive = false;
          eventsThisYear.push(`Sad news: Your ${npc.relation} (${npc.name}) peacefully passed away at age ${npc.age}. You inherit your family's prayers and blessing.`);
          state.stats.happiness = Math.max(10, state.stats.happiness - 35);
          // Family inheritance
          if (state.familyWealthIDR > 0) {
            const inheritance = Math.round(state.familyWealthIDR * 0.5);
            state.moneyIDR += inheritance;
            state.familyWealthIDR -= inheritance;
            eventsThisYear.push(`You received an inheritance of ${formatIDR(inheritance)}.`);
          }
        }
      }
    }
  }

  // 7. Check for Mortalities / Game Over
  if (state.stats.health <= 0 || newAge >= 90) {
    state.isGameOver = true;
    state.stage = 'deceased';
    state.gameOverReason = newAge >= 90 ? 'Died of natural old age surrounded by loved ones and Cannes Lions trophies.' : 'Succumbed to severe health complications from decades of Jakarta agency overwork.';
    eventsThisYear.push(`You passed away at the age of ${newAge}. ${state.gameOverReason}`);
  }

  // 8. Event selection: Chance to trigger campaign brief or interactive workplace dilemma
  if (!state.isGameOver && newAge >= 20 && state.career.currentJob) {
    // 60% chance to receive client brief this year
    if (Math.random() < 0.65) {
      const randomBrief = CAMPAIGN_BRIEFS_POOL[Math.floor(Math.random() * CAMPAIGN_BRIEFS_POOL.length)];
      state.currentPendingBrief = JSON.parse(JSON.stringify(randomBrief));
    } else {
      // Chance of random interactive dilemma
      const randomEvt = RANDOM_WORKPLACE_EVENTS[Math.floor(Math.random() * RANDOM_WORKPLACE_EVENTS.length)];
      state.currentPendingEvent = JSON.parse(JSON.stringify(randomEvt));
    }
  }

  // Log events to history
  for (const text of eventsThisYear) {
    state.history.unshift({
      id: `evt_${Date.now()}_${Math.random()}`,
      age: newAge,
      year: currentYear,
      title: `Age ${newAge}`,
      description: text,
      category: 'lifestyle',
    });
  }

  return state;
}

/**
 * Apply the player's chosen response to an interactive event.
 */
export function resolveEventOption(currentState: GameState, optionIndex: number): GameState {
  if (!currentState.currentPendingEvent) return currentState;

  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const event = state.currentPendingEvent;
  if (!event) return state;
  const choice = event.options[optionIndex];

  if (!choice) return state;

  // Apply stat changes
  if (choice.statChanges) {
    for (const [key, val] of Object.entries(choice.statChanges)) {
      const statKey = key as keyof CharacterStats;
      state.stats[statKey] = Math.min(100, Math.max(0, state.stats[statKey] + (val as number)));
    }
  }

  // Apply money change
  if (choice.moneyChangeIDR) {
    state.moneyIDR += choice.moneyChangeIDR;
  }

  // Apply career impact
  if (choice.careerImpact && state.career.currentJob) {
    if (choice.careerImpact.performance) {
      state.career.currentJob.performance = Math.min(100, Math.max(0, state.career.currentJob.performance + choice.careerImpact.performance));
    }
    if (choice.careerImpact.reputation) {
      state.career.currentJob.reputation = Math.min(100, Math.max(0, state.career.currentJob.reputation + choice.careerImpact.reputation));
      state.career.industryReputation = Math.min(100, Math.max(0, state.career.industryReputation + choice.careerImpact.reputation));
    }
  }

  // Log to history
  state.history.unshift({
    id: `decision_${Date.now()}`,
    age: state.character.currentAge,
    year: state.character.birthYear + state.character.currentAge,
    title: event.title,
    description: `Decision: ${choice.label}. ${choice.description || ''}`,
    category: 'career',
  });

  // Clear pending event
  state.currentPendingEvent = undefined;

  return state;
}

export interface CampaignChoicePayload {
  bigIdeaAngle: 'emotional_tearjerker' | 'absurdist_meme_comedy' | 'high_concept_visual' | 'guerrilla_prank' | 'ai_interactive';
  productionBudgetChoice: 'shoestring' | 'standard' | 'blockbuster_hollywood';
  revisionResponse: 'obedient_yes_boss' | 'diplomatic_compromise' | 'bold_artistic_stand';
}

/**
 * Evaluates the results of an advertising campaign brief.
 */
export function evaluateCampaignBrief(
  currentState: GameState,
  brief: CampaignBrief,
  choices: CampaignChoicePayload
): { newState: GameState; result: CampaignResult } {
  const state: GameState = JSON.parse(JSON.stringify(currentState));

  // Calculate base effectiveness from creativity & intelligence
  let effectiveness = Math.round((state.stats.creativity * 0.45) + (state.stats.intelligence * 0.35) + (state.stats.luck * 0.2));

  // Match angle with client temperament
  if (brief.clientTemperament === 'visionary' && choices.bigIdeaAngle === 'high_concept_visual') {
    effectiveness += 18;
  } else if (brief.clientTemperament === 'cheapskate' && choices.productionBudgetChoice === 'shoestring') {
    effectiveness += 10;
  } else if (brief.clientTemperament === 'demanding' && choices.revisionResponse === 'bold_artistic_stand') {
    effectiveness -= 12; // Client gets furious!
  } else if (choices.revisionResponse === 'diplomatic_compromise') {
    effectiveness += 8;
  }

  // Clamp 0-100
  effectiveness = Math.min(99, Math.max(15, effectiveness));

  // Client satisfaction
  let clientSatisfaction = Math.round(effectiveness * 0.7);
  if (choices.revisionResponse === 'obedient_yes_boss') clientSatisfaction += 22;
  if (choices.revisionResponse === 'bold_artistic_stand') clientSatisfaction -= 15;
  clientSatisfaction = Math.min(100, Math.max(10, clientSatisfaction));

  // Buzz / Virality
  let buzz = Math.round(effectiveness * 0.8 + (choices.bigIdeaAngle === 'absurdist_meme_comedy' || choices.bigIdeaAngle === 'guerrilla_prank' ? 15 : 5));
  buzz = Math.min(100, Math.max(20, buzz));

  // Awards check
  const awardsWon: AwardWin[] = [];
  const currentYear = state.character.birthYear + state.character.currentAge;

  // 1. Citra Pariwara (National Indonesia) - threshold >= 65
  if (effectiveness >= 65) {
    const tier: AwardTier = effectiveness >= 88 ? 'gold' : effectiveness >= 76 ? 'silver' : 'bronze';
    awardsWon.push({
      festival: 'citra_pariwara',
      festivalName: 'Citra Pariwara Indonesia',
      tier,
      category: 'Best Film & Digital Campaign',
      year: currentYear,
    });
    state.career.citraPariwaraCount += 1;
    state.career.totalAwardsCount += 1;
  }

  // 2. Spikes Asia (APAC Regional) - threshold >= 78
  if (effectiveness >= 78) {
    const tier: AwardTier = effectiveness >= 92 ? 'gold' : 'bronze';
    awardsWon.push({
      festival: 'spikes_asia',
      festivalName: 'Spikes Asia (Singapore)',
      tier,
      category: 'Entertainment & Brand Experience',
      year: currentYear,
    });
    state.career.totalAwardsCount += 1;
  }

  // 3. Cannes Lions (World Championship of Advertising) - threshold >= 88
  if (effectiveness >= 88) {
    const tier: AwardTier = effectiveness >= 96 ? 'grand_prix_or_pencil' : effectiveness >= 92 ? 'gold' : 'bronze';
    awardsWon.push({
      festival: 'cannes_lions',
      festivalName: 'Cannes Lions International Festival of Creativity',
      tier,
      category: tier === 'grand_prix_or_pencil' ? 'Titanium & Grand Prix' : 'Film Craft & Creative Strategy',
      year: currentYear,
    });
    state.career.cannesLionsCount += 1;
    state.career.totalAwardsCount += 1;
  }

  const campaignTitle = `${brief.productName}: "${choices.bigIdeaAngle.replace(/_/g, ' ').toUpperCase()}"`;

  const result: CampaignResult = {
    id: `camp_${Date.now()}`,
    year: currentYear,
    clientName: brief.clientName,
    campaignTitle,
    bigIdea: choices.bigIdeaAngle,
    effectiveness,
    clientSatisfaction,
    buzz,
    awardsWon,
  };

  state.campaignHistory.unshift(result);

  // Stats impact
  state.stats.stress = Math.min(100, state.stats.stress + 10);
  state.stats.happiness = Math.min(100, state.stats.happiness + (awardsWon.length > 0 ? 25 : 5));
  state.career.industryReputation = Math.min(100, state.career.industryReputation + (awardsWon.length * 6) + 4);

  // History log
  const awardSummary = awardsWon.length > 0
    ? `🏆 Won ${awardsWon.map((a) => `${a.tier.toUpperCase()} at ${a.festivalName}`).join(', ')}!`
    : 'No major festival trophies this time, but the client paid the invoice.';

  state.history.unshift({
    id: `evt_camp_${Date.now()}`,
    age: state.character.currentAge,
    year: currentYear,
    title: `Campaign: ${brief.clientName}`,
    description: `Launched ${campaignTitle}. Client satisfaction: ${clientSatisfaction}%. Public Buzz: ${buzz}%. ${awardSummary}`,
    category: awardsWon.length > 0 ? 'award' : 'career',
  });

  state.currentPendingBrief = undefined;

  return { newState: state, result };
}

/**
 * Apply job promotion or new job.
 */
export function applyForJob(
  currentState: GameState,
  agencyId: string,
  department: CareerDepartment,
  targetLevel: number
): { newState: GameState; success: boolean; message: string } {
  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const agency = JAKARTA_AGENCIES.find((a) => a.id === agencyId);
  const ladder = CAREER_LADDERS[department] || CAREER_LADDERS.creative;
  const step = ladder.find((s) => s.level === targetLevel) || ladder[0];

  if (!agency) {
    return { newState: state, success: false, message: 'Agency not found.' };
  }

  // Calculate applicant qualification score
  let score = 50;
  if (state.education.university?.graduated) score += 20;
  score += Math.round(state.career.industryReputation * 0.4);
  score += Math.round(state.stats.creativity * 0.2);
  score += Math.round(state.stats.charisma * 0.2);

  // Agency prestige barrier
  const threshold = (agency.prestige * 14) + (step.prestigeReq * 10);

  if (score >= threshold) {
    // Offered job!
    const monthlySalary = Math.round(step.baseSalaryMonthIDR * agency.salaryMultiplier);

    const newJob: JobRecord = {
      agencyId: agency.id,
      agencyName: agency.name,
      title: step.title,
      department,
      level: step.level,
      monthlySalaryIDR: monthlySalary,
      yearsInRole: 0,
      performance: 75,
      reputation: 60,
    };

    if (state.career.currentJob) {
      state.career.pastJobs.push(state.career.currentJob);
    }
    state.career.currentJob = newJob;
    state.stage = 'working';
    state.stats.happiness = Math.min(100, state.stats.happiness + 15);

    state.history.unshift({
      id: `job_hired_${Date.now()}`,
      age: state.character.currentAge,
      year: state.character.birthYear + state.character.currentAge,
      title: `Hired at ${agency.name}!`,
      description: `Secured the role of ${step.title} with a starting package of ${formatIDR(monthlySalary)}/month.`,
      category: 'career',
    });

    return {
      newState: state,
      success: true,
      message: `Congratulations! ${agency.name} hired you as ${step.title} at ${formatIDR(monthlySalary)}/month!`,
    };
  }

  return {
    newState: state,
    success: false,
    message: `${agency.name} reviewed your portfolio but chose another candidate with more Cannes Lions track record.`,
  };
}

/**
 * Ask for raise / promotion
 */
export function requestPromotion(currentState: GameState): { newState: GameState; success: boolean; message: string } {
  const state: GameState = JSON.parse(JSON.stringify(currentState));
  const currentJob = state.career.currentJob;

  if (!currentJob) {
    return { newState: state, success: false, message: 'You are currently unemployed.' };
  }

  const ladder = CAREER_LADDERS[currentJob.department] || CAREER_LADDERS.creative;
  const nextStep = ladder.find((s) => s.level === currentJob.level + 1);

  if (!nextStep) {
    return { newState: state, success: false, message: 'You have reached the highest peak of this ladder!' };
  }

  // Requirements: performance >= 80, years >= 1
  if (currentJob.performance >= 75 && currentJob.yearsInRole >= 1) {
    const agency = JAKARTA_AGENCIES.find((a) => a.id === currentJob.agencyId);
    const multiplier = agency?.salaryMultiplier || 1.0;
    const newSalary = Math.round(nextStep.baseSalaryMonthIDR * multiplier);

    currentJob.level = nextStep.level;
    currentJob.title = nextStep.title;
    currentJob.monthlySalaryIDR = newSalary;
    currentJob.performance = 65; // Reset performance for new title expectations
    state.stats.happiness = Math.min(100, state.stats.happiness + 20);
    state.career.industryReputation = Math.min(100, state.career.industryReputation + 8);

    state.history.unshift({
      id: `promo_${Date.now()}`,
      age: state.character.currentAge,
      year: state.character.birthYear + state.character.currentAge,
      title: `Promoted to ${nextStep.title}!`,
      description: `Your hard work paid off. New salary: ${formatIDR(newSalary)}/month. Time to treat the team to coffee!`,
      category: 'career',
    });

    return {
      newState: state,
      success: true,
      message: `Promoted to ${nextStep.title}! New salary: ${formatIDR(newSalary)}/month.`,
    };
  }

  state.stats.happiness = Math.max(0, state.stats.happiness - 8);
  state.stats.stress = Math.min(100, state.stats.stress + 5);

  return {
    newState: state,
    success: false,
    message: 'Your boss smiled awkwardly and said: "Budget is frozen right now, let\'s revisit next quarter."',
  };
}

/**
 * Found own agency
 */
export function foundOwnAgency(
  currentState: GameState,
  agencyName: string,
  specialization: 'full_service' | 'creative_boutique' | 'digital_social' | 'performance_media' | 'ai_creative_tech',
  officeLocation: string,
  initialCapitalIDR: number
): { newState: GameState; success: boolean; message: string } {
  const state: GameState = JSON.parse(JSON.stringify(currentState));

  if (state.moneyIDR < initialCapitalIDR) {
    return { newState: state, success: false, message: 'Insufficient personal funds to fund this starting capital.' };
  }

  state.moneyIDR -= initialCapitalIDR;

  // Resign from current job if any
  if (state.career.currentJob) {
    state.career.pastJobs.push(state.career.currentJob);
    state.career.currentJob = undefined;
  }

  const currentYear = state.character.birthYear + state.character.currentAge;

  state.ownedAgency = {
    name: agencyName,
    foundedYear: currentYear,
    officeLocation,
    specialization,
    cashBalanceIDR: initialCapitalIDR,
    reputation: Math.max(25, state.career.industryReputation),
    monthlyOverheadIDR: officeLocation === 'SCBD' ? 35_000_000 : officeLocation === 'Kemang' ? 18_000_000 : 10_000_000,
    employees: [
      {
        id: 'emp_1',
        name: 'Fikri Ramadhan',
        role: 'Senior Art Director',
        department: 'creative',
        monthlySalaryIDR: 16_000_000,
        skill: 82,
        morale: 90,
      },
      {
        id: 'emp_2',
        name: 'Siti Rahma',
        role: 'Account Manager',
        department: 'accounts',
        monthlySalaryIDR: 14_000_000,
        skill: 78,
        morale: 88,
      },
    ],
    clients: [
      {
        id: 'cl_1',
        name: 'Nusantara Specialty Coffee',
        monthlyRetainerIDR: 45_000_000,
        satisfaction: 85,
        contractYearsRemaining: 2,
      },
    ],
    agencyOfTheYearTitles: 0,
  };

  state.career.currentJob = {
    agencyId: 'own_agency',
    agencyName: agencyName,
    title: 'Founder & CEO / Chief Creative Officer',
    department: 'creative',
    level: 10,
    monthlySalaryIDR: 30_000_000,
    yearsInRole: 0,
    performance: 90,
    reputation: 80,
    isFounder: true,
  };

  state.history.unshift({
    id: `agency_founded_${Date.now()}`,
    age: state.character.currentAge,
    year: currentYear,
    title: `Founded ${agencyName}!`,
    description: `Officially launched ${agencyName} with headquarters in ${officeLocation}. Capitalized with ${formatIDR(initialCapitalIDR)}. Time to disrupt the industry!`,
    category: 'career',
  });

  return {
    newState: state,
    success: true,
    message: `You are now the Founder & CEO of ${agencyName}! Best of luck building your empire.`,
  };
}

/**
 * God Mode Stat Editor
 */
export function godModeSetStat(state: GameState, stat: keyof CharacterStats, value: number): GameState {
  const updated = JSON.parse(JSON.stringify(state));
  updated.stats[stat] = Math.min(100, Math.max(0, value));
  return updated;
}

export function godModeSetMoney(state: GameState, amount: number): GameState {
  const updated = JSON.parse(JSON.stringify(state));
  updated.moneyIDR = amount;
  return updated;
}

export function formatAwardTier(tier: AwardTier): string {
  switch (tier) {
    case 'grand_prix_or_pencil':
      return 'Grand Prix';
    case 'gold':
      return 'Gold';
    case 'silver':
      return 'Silver';
    case 'bronze':
      return 'Bronze';
    case 'shortlist':
      return 'Shortlist';
    default:
      return tier;
  }
}

export function godModeWinAward(state: GameState, festival: AwardFestival, tier: AwardTier): GameState {
  const updated = JSON.parse(JSON.stringify(state));
  const currentYear = updated.character.birthYear + updated.character.currentAge;

  const names: Record<AwardFestival, string> = {
    citra_pariwara: 'Citra Pariwara Indonesia',
    spikes_asia: 'Spikes Asia',
    adfest: 'ADFEST APAC',
    one_show: 'The One Show',
    d_and_ad: 'D&AD Awards',
    cannes_lions: 'Cannes Lions Festival of Creativity',
  };

  if (festival === 'cannes_lions') updated.career.cannesLionsCount += 1;
  if (festival === 'citra_pariwara') updated.career.citraPariwaraCount += 1;
  updated.career.totalAwardsCount += 1;
  updated.career.industryReputation = Math.min(100, updated.career.industryReputation + 15);
  updated.stats.happiness = 100;

  const formattedTier = formatAwardTier(tier);

  updated.history.unshift({
    id: `god_award_${Date.now()}`,
    age: updated.character.currentAge,
    year: currentYear,
    title: `🏆 Won ${formattedTier} at ${names[festival]}!`,
    description: `God Mode miracle! Honored at ${names[festival]} with the prestigious ${formattedTier} trophy.`,
    category: 'award',
  });

  return updated;
}
