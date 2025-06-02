const prisma = require('../prisma');
const { D } = require('../utils/dec.js');

/* ────────────── GET ─────────────────────── */

exports.get = (id) =>
  prisma.settlement.findUnique({ where: { id } });

/**
 * Filtros opcionais: householdId || personId.
 *
 *   getAll()                          → tudo
 *   getAll({ householdId })           → apenas onde householdId == householdId
 *   getAll({ personId })              → onde fromPersonId OU toPersonId == personId
 */
exports.getAll = ({ householdId = null, personId = null } = {}) =>
  prisma.settlement.findMany({
    where: {
      ...(householdId && { householdId }),
      ...(personId && {
        OR: [{ fromPersonId: personId }, { toPersonId: personId }],
      }),
    },
    orderBy: { date: 'desc' },
  });

/* ────────────── CREATE ──────────────────── */
/**
 * data = { householdId, fromPersonId, toPersonId, amount }
 */
exports.create = async (data) => {
  const { householdId, fromPersonId, toPersonId, amount } = data;

  if (!householdId || !fromPersonId || !toPersonId || amount == null) {
    throw new Error('householdId, fromPersonId, toPersonId, amount are required');
  }
  if (fromPersonId === toPersonId) {
    throw new Error('fromPersonId and toPersonId must differ');
  }
  if (new D(amount).lte(0)) throw new Error('amount must be positive');

  return prisma.settlement.create({
    data: {
      householdId,
      fromPersonId,
      toPersonId,
      amount: new D(amount),
    },
  });
};

/* ────────────── DELETE ─────────────────── */

exports.delete = async (id) => {
  try {
    return await prisma.settlement.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') return null;
    throw e;
  }
};
