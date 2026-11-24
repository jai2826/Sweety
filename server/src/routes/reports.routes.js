import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { serializeReading } from '../lib/serialize.js';
import { summarize } from '../domain/reports.js';
import {
  parseDateOnly,
  toDateOnlyString,
  todayUTC,
  startOfMonth,
  startOfPreviousMonth,
  endOfPreviousMonth,
} from '../domain/dates.js';

const router = Router();
router.use(requireAuth);

// Fetch a user's readings within an inclusive [from, to] day range, oldest first.
async function readingsInRange(userId, from, to) {
  return prisma.reading.findMany({
    where: { userId, date: { gte: from, lte: to } },
    orderBy: [{ date: 'asc' }, { slot: 'asc' }],
  });
}

const range = (from, to) => ({ from: toDateOnlyString(from), to: toDateOnlyString(to) });

// GET /api/reports?date=YYYY-MM-DD  (defaults to today)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const selected = req.query.date ? parseDateOnly(req.query.date) : todayUTC();
    if (!selected) throw ApiError.badRequest('Please provide a valid date (YYYY-MM-DD).');

    const userId = req.user.id;

    // Daily: the selected date only.
    const dailyRows = await readingsInRange(userId, selected, selected);

    // Month-to-date: 1st of the selected month -> selected date.
    const mtdStart = startOfMonth(selected);
    const mtdRows = await readingsInRange(userId, mtdStart, selected);

    // Monthly: the whole previous month.
    const prevStart = startOfPreviousMonth(selected);
    const prevEnd = endOfPreviousMonth(selected);
    const prevRows = await readingsInRange(userId, prevStart, prevEnd);

    res.json({
      selectedDate: toDateOnlyString(selected),
      daily: {
        range: range(selected, selected),
        summary: summarize(dailyRows),
        readings: dailyRows.map(serializeReading),
      },
      monthToDate: {
        range: range(mtdStart, selected),
        summary: summarize(mtdRows),
        // Included so the frontend can draw a month-to-date line chart.
        readings: mtdRows.map(serializeReading),
      },
      monthly: {
        range: range(prevStart, prevEnd),
        summary: summarize(prevRows),
      },
    });
  })
);

export default router;
