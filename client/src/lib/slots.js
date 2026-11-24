// Mirror of the server's slots, for labels and the form dropdown.
export const SLOT_OPTIONS = [
  { value: 'MORNING', label: 'Morning (fasting)' },
  { value: 'AFTER_BREAKFAST', label: 'After breakfast' },
  { value: 'AFTER_LUNCH', label: 'After lunch' },
  { value: 'AFTER_DINNER', label: 'After dinner' },
];

export const slotLabel = (slot) =>
  SLOT_OPTIONS.find((s) => s.value === slot)?.label ?? slot;

export const VALUE_MIN = 40;
export const VALUE_MAX = 600;
