/**
 * Core type definitions for Agency Life: Jakarta Edition
 */

export type Gender = 'male' | 'female' | 'non-binary';

export type SocioeconomicStatus = 'underprivileged' | 'working_class' | 'middle_class' | 'upper_middle' | 'scbd_conglomerate';

export interface CharacterStats {
  happiness: number;     // 0 - 100
  health: number;        // 0 - 100
  intelligence: number;  // 0 - 100
  creativity: number;    // 0 - 100
  looks: number;         // 0 - 100
  stress: number;        // 0 - 100
  charisma: number;      // 0 - 100
  ambition: number;      // 0 - 100
  luck: number;          // 0 - 100
}

export type LifeStage = 'baby' | 'child' | 'teen' | 'university' | 'working' | 'retired' | 'deceased';

export type CareerDepartment =
  | 'creative'
  | 'strategy'
  | 'accounts'
  | 'social_digital'
  | 'media'
  | 'production';

export interface CareerLadderStep {
  level: number;
  title: string;
  department: CareerDepartment;
  minExperienceYears: number;
  requiredDegree: boolean;
  baseSalaryMonthIDR: number; // Monthly base salary in IDR
  prestigeReq: number;        // 1 to 5
}

export interface AgencyData {
  id: string;
  name: string;
  shortName: string;
  location: string; // e.g. "Sudirman", "Kuningan", "SCBD", "Cilandak", "Kemang"
  prestige: number; // 1 to 5 stars
  workload: 'low' | 'moderate' | 'high' | 'brutal_overtime'; // Overtime culture
  creativityScore: number; // 1 to 100
  clientTier: 'local_smes' | 'challenger_brands' | 'blue_chip' | 'multinationals';
  awardReputation: number; // 1 to 100
  salaryMultiplier: number; // 0.8 to 2.2
  vibe: string;
  financialStability: 'fragile' | 'stable' | 'powerhouse';
}

export interface JobRecord {
  agencyId: string;
  agencyName: string;
  title: string;
  department: CareerDepartment;
  level: number;
  monthlySalaryIDR: number;
  yearsInRole: number;
  performance: number; // 0 - 100
  reputation: number; // 0 - 100
  isFounder?: boolean;
}

export type NPCRelationshipType =
  | 'mother'
  | 'father'
  | 'brother'
  | 'sister'
  | 'friend'
  | 'colleague'
  | 'boss'
  | 'partner'
  | 'spouse'
  | 'child'
  | 'client';

export interface NPC {
  id: string;
  name: string;
  age: number;
  relation: NPCRelationshipType;
  relationshipScore: number; // 0 - 100
  personality: 'generous' | 'demanding' | 'toxic' | 'supportive' | 'chill' | 'micromanager';
  workplace?: string;
  occupation?: string;
  alive: boolean;
  notes?: string;
}

export interface UniversityInfo {
  id: string;
  name: string;
  shortName: string;
  major: string;
  yearlyTuitionIDR: number;
  reputation: number; // 1 to 100
}

export interface CampaignBrief {
  id: string;
  clientName: string;
  industry: string;
  productName: string;
  budgetIDR: number;
  objective: string;
  clientTemperament: 'visionary' | 'demanding' | 'cheapskate' | 'micromanager' | 'data_obsessed';
  preferredTone: 'emotional' | 'viral_comedy' | 'high_concept' | 'hard_sell' | 'tech_forward';
}

export interface CampaignResult {
  id: string;
  year: number;
  clientName: string;
  campaignTitle: string;
  bigIdea: string;
  effectiveness: number; // 0 - 100
  clientSatisfaction: number; // 0 - 100
  buzz: number; // 0 - 100
  awardsWon: AwardWin[];
}

export type AwardTier = 'shortlist' | 'bronze' | 'silver' | 'gold' | 'grand_prix_or_pencil';

export type AwardFestival =
  | 'citra_pariwara'
  | 'spikes_asia'
  | 'adfest'
  | 'one_show'
  | 'd_and_ad'
  | 'cannes_lions';

export interface AwardWin {
  festival: AwardFestival;
  festivalName: string;
  tier: AwardTier;
  category: string;
  year: number;
}

export interface HousingAsset {
  id: string;
  name: string;
  neighborhood: string;
  type: 'family_home' | 'kost' | 'kost_exclusive' | 'apartment' | 'house' | 'luxury_penthouse';
  monthlyRentOrCostIDR: number;
  purchasePriceIDR?: number;
  isOwned: boolean;
  comfortScore: number; // 0 - 100
  prestigeScore: number; // 0 - 100
}

export interface VehicleAsset {
  id: string;
  name: string;
  type: 'motorcycle' | 'vespa' | 'city_car' | 'ev_car' | 'luxury_car';
  purchasePriceIDR: number;
  monthlyMaintenanceIDR: number;
  resaleValueIDR: number;
  coolScore: number;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  type: 'deposito' | 'reksadana' | 'saham_ihsg' | 'crypto' | 'property';
  amountInvestedIDR: number;
  currentValueIDR: number;
  annualReturnRatePct: number; // Expected return %
}

export interface AgencyEmployee {
  id: string;
  name: string;
  role: string;
  department: CareerDepartment;
  monthlySalaryIDR: number;
  skill: number; // 0 - 100
  morale: number; // 0 - 100
}

export interface AgencyClient {
  id: string;
  name: string;
  monthlyRetainerIDR: number;
  satisfaction: number; // 0 - 100
  contractYearsRemaining: number;
}

export interface OwnedAgency {
  name: string;
  foundedYear: number;
  officeLocation: string; // e.g. "Kemang", "SCBD", "Kuningan"
  specialization: 'full_service' | 'creative_boutique' | 'digital_social' | 'performance_media' | 'ai_creative_tech';
  cashBalanceIDR: number;
  reputation: number; // 0 - 100
  monthlyOverheadIDR: number;
  employees: AgencyEmployee[];
  clients: AgencyClient[];
  agencyOfTheYearTitles: number;
}

export interface LifeEventLog {
  id: string;
  age: number;
  year: number;
  title: string;
  description: string;
  category: 'birth' | 'family' | 'school' | 'career' | 'award' | 'relationship' | 'health' | 'finance' | 'lifestyle' | 'death';
  impact?: {
    happiness?: number;
    health?: number;
    moneyIDR?: number;
    stress?: number;
    reputation?: number;
  };
}

export interface DecisionOption {
  label: string;
  description?: string;
  action: string;
  statChanges?: Partial<CharacterStats>;
  moneyChangeIDR?: number;
  relationshipChange?: { npcId?: string; change: number };
  careerImpact?: { performance?: number; reputation?: number };
}

export interface InteractiveEvent {
  id: string;
  title: string;
  description: string;
  imagePromptContext?: string;
  options: DecisionOption[];
  category: 'work' | 'creative' | 'relationship' | 'scandal' | 'family' | 'opportunity';
}

export interface EducationHistory {
  elementaryCompleted: boolean;
  highSchoolCompleted: boolean;
  university?: {
    name: string;
    major: string;
    gpa: number;
    graduated: boolean;
  };
}

export interface GameState {
  version: number;
  character: {
    id: string;
    name: string;
    gender: Gender;
    avatarEmoji: string;
    birthYear: number;
    currentAge: number;
    socioeconomic: SocioeconomicStatus;
    homeNeighborhood: string;
  };
  stats: CharacterStats;
  moneyIDR: number;
  familyWealthIDR: number;
  debtIDR: number;
  stage: LifeStage;
  education: EducationHistory;
  career: {
    currentJob?: JobRecord;
    pastJobs: JobRecord[];
    freelanceClients: number;
    industryReputation: number; // 0 - 100
    cannesLionsCount: number;
    citraPariwaraCount: number;
    totalAwardsCount: number;
  };
  ownedAgency?: OwnedAgency;
  campaignHistory: CampaignResult[];
  assets: {
    currentHousing?: HousingAsset;
    ownedProperties: HousingAsset[];
    vehicles: VehicleAsset[];
    investments: InvestmentAsset[];
  };
  npcs: NPC[];
  history: LifeEventLog[];
  currentPendingEvent?: InteractiveEvent;
  currentPendingBrief?: CampaignBrief;
  godModeEnabled: boolean;
  soundEnabled: boolean;
  isGameOver: boolean;
  gameOverReason?: string;
}
