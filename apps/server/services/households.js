const prisma = require('../prisma.js');
const { computeBalances } = require('../utils/balance.js');
const { D } = require('../utils/dec.js');

/* ────────────── GET ─────────────────────── */

exports.get = (id) =>
    prisma.household.findUnique({ where: { id } });

exports.getAll = () =>
    prisma.household.findMany({ orderBy: { createdAt: 'desc' } });

exports.summary = async (id) => {
    const household = await prisma.household.findUnique({
        where: { id },
        include: {
            people: true,
            expenses: true,
            settlements: true,
        },
    });
    if (!household) return null;


    const salarySum = household.people
        .reduce((s, p) => s.plus(p.salary), new D(0));

    const ledger = computeBalances(
        household.people,
        household.expenses,
        household.settlements
    );

    const peopleById = Object.fromEntries(
        household.people.map(p => [p.id, p])
    );

    const people = household.people.map(p => {
        const weight = salarySum.gt(0)
            ? +new D(p.salary).dividedBy(salarySum).toFixed(4)
            : 0;
        return {
            id: p.id,
            name: p.name,
            salary: p.salary,
            weight,
            paid: ledger[p.id].paid,
            owed: ledger[p.id].owed,
            net: ledger[p.id].net,
        };
    });

    const expenses = household.expenses.map(e => ({
        ...e,
        paidByName: e.paidById ? peopleById[e.paidById].name : null,
    }));

    return {
        householdId: household.id,
        people,
        expenses,
        settlements: household.settlements,
    };
};


/* ────────────── CREATE ──────────────────── */

exports.create = ({ name, description }) =>
    prisma.household.create({ data: { name, description } });

/* ────────────── UPDATE / PATCH ──────────── */

exports.update = async (id, { name, description }) => {
    try {
        return await prisma.household.update({
            where: { id },
            data: { name, description },
        });
    } catch (e) {
        if (e.code === 'P2025') return null;
        throw e;
    }
};

/* ────────────── DELETE ──────────────────── */

exports.delete = async (id) => {
    try {
        return await prisma.household.delete({ where: { id } });
    } catch (e) {
        if (e.code === 'P2025') return null;
        throw e;
    }
};

/* ────────────── PRIVATE ────────────────── */
async function _getHouseholdWithLedger(householdId) {
    const household = await prisma.household.findUnique({
        where: { id: householdId },
        include: { people: true, expenses: true, settlements: true },
    });
    if (!household) return null;

    const ledger = computeBalances(
        household.people,
        household.expenses,
        household.settlements
    );
    return { household, ledger };
}

module.exports._getHouseholdWithLedger = _getHouseholdWithLedger;
