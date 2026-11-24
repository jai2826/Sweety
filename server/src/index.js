import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Sweety API listening on http://localhost:${config.port}`);
});

// Close DB + HTTP cleanly on shutdown.
async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
