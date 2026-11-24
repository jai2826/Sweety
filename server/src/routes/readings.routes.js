import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { serializeReading } from '../lib/serialize.js';
import { validateReadingInput, MESSAGES } from '../domain/validation.js';
import { MAX_READINGS_PER_DAY } from '../domain/slots.js';

const router = Router();

// All reading routes require a logged-in user.
router.use(requireAuth);

// Enforce the two per-day rules against the DB.
// `excludeId` lets an edit skip its own row when checking the slot.
async function assertDayRules(userId, date, slot, excludeId = null) {
  const sameDay = await prisma.reading.findMany({
    where: { userId, date },
    select: { id: true, slot: true },
  });
  const others = sameDay.filter((r) => r.id !== excludeId);

  if (others.some((r) => r.slot === slot)) {
    throw ApiError.conflict(MESSAGES.slotTaken(slot));
  }
  if (others.length >= MAX_READINGS_PER_DAY) {
    throw ApiError.badRequest(MESSAGES.MAX_PER_DAY);
  }
}

// GET /api/readings?page=1&limit=20  -> paginated list, newest first
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const rawLimit = Number.parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(100, Math.max(1, rawLimit));
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    const [total, rows] = await Promise.all([
      prisma.reading.count({ where }),
      prisma.reading.findMany({
        where,
        orderBy: [{ date: 'desc' }, { slot: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    res.json({
      data: rows.map(serializeReading),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  })
);

// GET /api/readings/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const reading = await prisma.reading.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!reading) throw ApiError.notFound('Reading not found.');
    res.json({ data: serializeReading(reading) });
  })
);

// POST /api/readings
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const result = validateReadingInput(req.body);
    if (!result.ok) throw ApiError.badRequest(result.message);
    const { value, slot, date } = result.data;

    await assertDayRules(req.user.id, date, slot);

    const reading = await prisma.reading.create({
      data: { userId: req.user.id, value, slot, date },
    });
    res.status(201).json({ data: serializeReading(reading) });
  })
);

// PUT /api/readings/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.reading.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) throw ApiError.notFound('Reading not found.');

    const result = validateReadingInput(req.body);
    if (!result.ok) throw ApiError.badRequest(result.message);
    const { value, slot, date } = result.data;

    await assertDayRules(req.user.id, date, slot, existing.id);

    const reading = await prisma.reading.update({
      where: { id: existing.id },
      data: { value, slot, date },
    });
    res.json({ data: serializeReading(reading) });
  })
);

// DELETE /api/readings/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.reading.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) throw ApiError.notFound('Reading not found.');

    await prisma.reading.delete({ where: { id: existing.id } });
    res.status(204).send();
  })
);

export default router;
