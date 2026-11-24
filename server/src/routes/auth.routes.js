import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword, signToken } from '../lib/auth.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100),
  email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(200),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

// Strip the password hash before sending a user back to the client.
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0].message);
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password) },
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest(parsed.error.issues[0].message);
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    // Same message whether the email is unknown or the password is wrong.
    if (!user || !(await comparePassword(password, user.password))) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw ApiError.unauthorized('Account no longer exists.');
    res.json({ user: publicUser(user) });
  })
);

export default router;
