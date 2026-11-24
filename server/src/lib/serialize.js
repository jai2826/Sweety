import { toDateOnlyString } from '../domain/dates.js';
import { slotLabel } from '../domain/slots.js';

// Shape a Prisma Reading row for the API response.
export function serializeReading(r) {
  return {
    id: r.id,
    date: toDateOnlyString(r.date),
    slot: r.slot,
    slotLabel: slotLabel(r.slot),
    value: r.value,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
