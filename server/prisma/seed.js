import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SLOTS } from '../src/domain/slots.js';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@sweety.app';
const DEMO_PASSWORD = 'password123';

// Build a UTC date-only value `daysAgo` days before today.
function dayUTC(daysAgo) {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

// Deterministic pseudo-random so the seed is reproducible.
function pseudo(n) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

async function main() {
  console.log('Seeding database...');

  // Fresh start for the demo user so re-running the seed is idempotent.
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    await prisma.reading.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const user = await prisma.user.create({
    data: {
      name: 'Demo Patient',
      email: DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
    },
  });

  // Generate readings for the last 45 days so daily, month-to-date and
  // previous-month reports all have data.
  const readings = [];
  for (let daysAgo = 0; daysAgo < 45; daysAgo += 1) {
    const date = dayUTC(daysAgo);
    // 2-4 readings per day.
    const count = 2 + Math.floor(pseudo(daysAgo + 1) * 3);
    for (let s = 0; s < count && s < SLOTS.length; s += 1) {
      const base = 90 + Math.floor(pseudo(daysAgo * 10 + s + 1) * 90); // ~90-180
      readings.push({ userId: user.id, date, slot: SLOTS[s], value: base });
    }
  }

  await prisma.reading.createMany({ data: readings });

  console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Inserted ${readings.length} readings across 45 days.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
