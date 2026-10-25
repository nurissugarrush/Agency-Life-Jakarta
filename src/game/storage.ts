/**
 * LocalStorage persistence for Agency Life: Jakarta Edition
 */

import { GameState } from '../types/game';

const SAVE_KEY_PREFIX = 'agency_life_save_';
const ACTIVE_SLOT_KEY = 'agency_life_active_slot';

export function saveGameState(state: GameState, slot: number = 1): boolean {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, serialized);
    localStorage.setItem(ACTIVE_SLOT_KEY, slot.toString());
    return true;
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
    return false;
  }
}

export function loadGameState(slot: number = 1): GameState | null {
  try {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    return parsed;
  } catch (err) {
    console.error('Failed to load game state from localStorage:', err);
    return null;
  }
}

export function getActiveSlot(): number {
  try {
    const slot = localStorage.getItem(ACTIVE_SLOT_KEY);
    return slot ? parseInt(slot, 10) : 1;
  } catch {
    return 1;
  }
}

export function clearGameSlot(slot: number = 1): void {
  try {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`);
  } catch (err) {
    console.error('Failed to clear game slot:', err);
  }
}
