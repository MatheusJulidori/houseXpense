const prisma = require('../prisma');
const Prisma = require('@prisma/client').Prisma;
/* ────────────── GET ─────────────────────── */

exports.get = (id) =>
    prisma.expense.findUnique({ where: { id } });

/**
 * Filtros opcionais: householdId .
 *
 *   getAll()                          → tudo
 *   getAll(householdId)           → apenas onde householdId == householdId
 */
exports.getAll = (householdId = null) =>
    prisma.expense.findMany({
        where: householdId ? { householdId } : undefined,
        orderBy: { date: 'desc' },
    });

/* ────────────── CREATE ──────────────────── */
exports.create = async (data) => {
    const { householdId, description, amount, type, personId, paidById } = data;

    if (!householdId || !description || amount == null || !type) {
        throw new Error('householdId, description, amount, type are required');
    }
    if (type === 'PERSONAL' && !personId) {
        throw new Error('PERSONAL expense requires personId');
    }

    return prisma.expense.create({
        data: {
            householdId,
            description,
            amount: new Prisma.Decimal(amount),
            type,
            personId,
            paidById,
        },
    });
};

/* ────────────── UPDATE ─────────────────── */

exports.update = async (id, data) => {
    const upd = {};
    if (data.description !== undefined) upd.description = data.description;
    if (data.amount !== undefined) upd.amount = new Prisma.Decimal(data.amount);
    if (data.type !== undefined) upd.type = data.type;
    if (data.personId !== undefined) upd.personId = data.personId;
    if (data.paidById !== undefined) upd.paidById = data.paidById;
    if (data.householdId !== undefined) upd.householdId = data.householdId;

    try {
        return await prisma.expense.update({
            where: { id },
            data: upd,
        });
    } catch (e) {
        if (e.code === 'P2025') return null;
        throw e;
    }
};

/* ────────────── DELETE ─────────────────── */

exports.delete = async (id) => {
    try {
        return await prisma.expense.delete({ where: { id } });
    } catch (e) {
        if (e.code === 'P2025') return null;
        throw e;
    }
};
