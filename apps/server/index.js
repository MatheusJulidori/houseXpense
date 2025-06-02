require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prisma.js');
const routes = require('./routes/index.js');

const app = express();

/* ── global middleware ───────────────────── */

const allowed = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map(s => s.trim());
app.use(cors(
  {
    origin: allowed.length === 1 && allowed[0] === "*" ? "*" : allowed,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }
));
app.use(express.json());

// make prisma available to every controller
app.use((req, res, next) => { req.prisma = prisma; next(); });

/* ── routers ─────────────────────────────── */
app.use('/api/v1', routes);

/* ── health check ────────────────────────── */
app.get('/api/v1/healthz', (_, res) => res.json({ ok: true }));

/* ── error handler ───────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}
);

/* ── start server ────────────────────────── */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`houseXpense API listening on port ${PORT}`);
});

/* ── graceful shutdown ────────────────────── */
const shutdown = async () => {
  console.log('\nShutting down …');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);