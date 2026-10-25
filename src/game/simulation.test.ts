import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialCharacter,
  advanceAge,
  formatIDR,
  calculateNetWorth,
  applyForJob,
  requestPromotion,
  foundOwnAgency,
  evaluateCampaignBrief,
  godModeSetStat,
  godModeSetMoney,
} from './simulation';
import { CAMPAIGN_BRIEFS_POOL } from './constants';

test('createInitialCharacter initializes valid newborn state', () => {
  const state = createInitialCharacter({
    name: 'Reza Rahadian',
    gender: 'male',
    socioeconomic: 'middle_class',
    startingMoneyIDR: 10_000_000,
    familyWealthIDR: 100_000_000,
  });

  assert.equal(state.character.name, 'Reza Rahadian');
  assert.equal(state.character.currentAge, 0);
  assert.equal(state.stage, 'baby');
  assert.equal(state.moneyIDR, 10_000_000);
  assert.equal(state.familyWealthIDR, 100_000_000);
  assert.equal(state.npcs.length >= 2, true);
  assert.equal(state.history.length, 1);
});

test('advanceAge progresses character years and life stages', () => {
  let state = createInitialCharacter({
    name: 'Bunga Citra',
    gender: 'female',
    socioeconomic: 'upper_middle',
    startingMoneyIDR: 5_000_000,
    familyWealthIDR: 200_000_000,
  });

  // Advance 6 years to elementary school
  for (let i = 0; i < 6; i++) {
    state = advanceAge(state);
  }
  assert.equal(state.character.currentAge, 6);
  assert.equal(state.stage, 'child');

  // Advance to teen
  for (let i = 0; i < 7; i++) {
    state = advanceAge(state);
  }
  assert.equal(state.character.currentAge, 13);
  assert.equal(state.stage, 'teen');
});

test('formatIDR formats currency into readable Indonesian Rupiah notation', () => {
  assert.equal(formatIDR(500000), 'Rp500.000');
  assert.equal(formatIDR(15000000), 'Rp15.0M');
  assert.equal(formatIDR(2500000000), 'Rp2.5B');
  assert.equal(formatIDR(1200000000000), 'Rp1.2T');
});

test('applyForJob successfully hires qualified character and disburses salary + THR on advanceAge', () => {
  let state = createInitialCharacter({
    name: 'Aditya Copywriter',
    gender: 'male',
    socioeconomic: 'middle_class',
    startingMoneyIDR: 0,
    familyWealthIDR: 0,
  });

  // Give education and adult age
  state.character.currentAge = 22;
  state.education.university = {
    name: 'Universitas Indonesia',
    major: 'Advertising',
    gpa: 3.8,
    graduated: true,
  };
  state.career.industryReputation = 50;

  // Apply for creative intern at Ogilvy
  const res = applyForJob(state, 'ogilvy', 'creative', 1);
  assert.equal(res.success, true);
  assert.equal(res.newState.career.currentJob?.title, 'Creative Intern');
  assert.equal(res.newState.career.currentJob?.agencyName, 'Ogilvy Indonesia');

  // Advance age by 1 year and ensure salary & THR was credited
  const afterYear = advanceAge(res.newState);
  assert.equal(afterYear.moneyIDR > 0, true);
  assert.equal(afterYear.career.currentJob?.yearsInRole, 1);
});

test('evaluateCampaignBrief generates scores, buzz, and award wins', () => {
  const state = createInitialCharacter({
    name: 'Creative Genius',
    gender: 'female',
    socioeconomic: 'middle_class',
    startingMoneyIDR: 0,
    familyWealthIDR: 0,
    initialStats: {
      creativity: 98,
      intelligence: 95,
      luck: 85,
    },
  });

  const brief = CAMPAIGN_BRIEFS_POOL[0];
  const { newState, result } = evaluateCampaignBrief(state, brief, {
    bigIdeaAngle: 'high_concept_visual',
    productionBudgetChoice: 'blockbuster_hollywood',
    revisionResponse: 'diplomatic_compromise',
  });

  assert.equal(result.effectiveness >= 70, true);
  assert.equal(result.clientSatisfaction >= 50, true);
  assert.equal(result.buzz >= 50, true);
  assert.equal(newState.campaignHistory.length, 1);
  assert.equal(newState.career.totalAwardsCount >= 1, true);
});

test('foundOwnAgency creates an owned business and manages client retainers', () => {
  let state = createInitialCharacter({
    name: 'Agency Boss',
    gender: 'male',
    socioeconomic: 'scbd_conglomerate',
    startingMoneyIDR: 500_000_000,
    familyWealthIDR: 5_000_000_000,
  });

  const res = foundOwnAgency(state, 'Jakarta Mad Men Co.', 'creative_boutique', 'SCBD', 200_000_000);
  assert.equal(res.success, true);
  assert.equal(res.newState.ownedAgency?.name, 'Jakarta Mad Men Co.');
  assert.equal(res.newState.ownedAgency?.officeLocation, 'SCBD');
  assert.equal(res.newState.career.currentJob?.isFounder, true);

  // Advance year
  const aged = advanceAge(res.newState);
  assert.equal(aged.ownedAgency?.cashBalanceIDR !== undefined, true);
});

test('godMode tools instantly manipulate stats and money without bounds violation', () => {
  let state = createInitialCharacter({
    name: 'Cheater',
    gender: 'non-binary',
    socioeconomic: 'middle_class',
    startingMoneyIDR: 0,
    familyWealthIDR: 0,
  });

  state = godModeSetStat(state, 'creativity', 100);
  assert.equal(state.stats.creativity, 100);

  state = godModeSetMoney(state, 10_000_000_000);
  assert.equal(state.moneyIDR, 10_000_000_000);

  const netWorth = calculateNetWorth(state);
  assert.equal(netWorth >= 10_000_000_000, true);
});
