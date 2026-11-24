// The 4 fixed reading slots. Keys match the Prisma `Slot` enum.
export const SLOTS = ['MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

export const MAX_READINGS_PER_DAY = SLOTS.length; // 4

// Human-readable labels, used in error messages and the UI.
export const SLOT_LABELS = {
  MORNING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

export const slotLabel = (slot) => SLOT_LABELS[slot] ?? slot;

export const isValidSlot = (slot) => SLOTS.includes(slot);

export const VALUE_MIN = 40;
export const VALUE_MAX = 600;
