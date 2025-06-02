const prisma = require('../prisma.js');
const hhSvc = require('./households.js');
const Prisma = require('@prisma/client').Prisma;

/* ────────────── GET ─────────────────────── */

exports.get = (id) =>
    prisma.person.findUnique({ where: { id } });

/**
 * Filtros opcionais: householdId .
 *
 *   getAll()                          → tudo
 *   getAll({ householdId })           → apenas onde householdId == householdId
 */
exports.getAll = ({ householdId = null } = {}) =>
    prisma.person.findMany({
        where: householdId ? { householdId } : undefined,
    });

exports.listForHouseholdDashboard = async (householdId) => {
    const people = await prisma.person.findMany({ where: { householdId } });
    const sum = people.reduce((s, p) => s + new Prisma.Decimal(p.salary), 0);
    return people.map(p => ({
        ...p,
        weight: sum ? +(new Prisma.Decimal(p.salary) / sum).toFixed(4) : 0,
    }));
}

/* ────────────── CREATE ──────────────────── */

exports.create = (data) =>
    prisma.person.create({
        data: {
            householdId: data.householdId,
            name: data.name,
            salary: new Prisma.Decimal(data.salary),
        },
    });

/* ────────────── UPDATE/PATCH ────────────── */

exports.update = async (id, data) => {
    const upd = {};
    if (data.name !== undefined) upd.name = data.name;
    if (data.salary !== undefined) upd.salary = new Prisma.Decimal(data.salary);
    if (data.householdId !== undefined) upd.householdId = data.householdId;

    try {
        return await prisma.person.update({
            where: { id },
            data: upd,
        });
    } catch (e) {
        if (e.code === 'P2025') return null;
        throw e;
    }
};

/* ────────────── DELETE ─────────────────── */

exports.delete = async (id, { settle = false } = {}) => {
    try {
        if (settle) {
            const person = await prisma.person.findUnique({ where: { id } });
            if (!person) return null;
            const { householdId } = person;

            const pack = await hhSvc._getHouseholdWithLedger(householdId);
            if (!pack) return null;
            const { ledger } = pack;

            const meNet = ledger[id].net;
            if (meNet !== 0) {
                const target = Object.entries(ledger)
                    .filter(([pid, l]) => pid !== id && l.net * meNet < 0)
                    .sort((a, b) => Math.abs(b[1].net) - Math.abs(a[1].net))[0];

                if (target) {
                    await prisma.settlement.create({
                        data: {
                            householdId,
                            fromPersonId: meNet < 0 ? id : target[0],
                            toPersonId: meNet < 0 ? target[0] : id,
                            amount: Math.abs(meNet)
                        }
                    });
                }
            }

            return prisma.person.delete({ where: { id } });
        } else {
            return prisma.person.delete({ where: { id } });
        }
    } catch (e) {
        if (e.code === 'P2025') return null;
        throw e;
    }
};
