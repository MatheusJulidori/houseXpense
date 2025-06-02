const { Prisma } = require('@prisma/client');
const D = Prisma.Decimal;

function computeBalances(people, expenses, settlements) {
  /* ── init buckets ───────────────────────────────────────── */
  const buckets = Object.fromEntries(
    people.map(p => [p.id, {
      paid: new D(0),
      owed: new D(0),
      net:  new D(0),
    }])
  );

  /* ── 1. money PAID (who laid out cash) ─────────────────── */
  expenses.forEach(e => {
    if (e.paidById) {
      buckets[e.paidById].paid =
        buckets[e.paidById].paid.plus(e.amount);
    }
  });

  /* ── 2. fair-share OWED (salary-weighted) ──────────────── */
  const salarySum = people
    .reduce((s, p) => s.plus(p.salary), new D(0));

  expenses.forEach(e => {
    const amt = new D(e.amount);

    // PERSONAL → whole amount belongs to personId
    if (e.type === 'PERSONAL' && e.personId) {
      buckets[e.personId].owed =
        buckets[e.personId].owed.plus(amt);
      return;
    }

    // HOUSE → proportional split
    people.forEach(p => {
      if (salarySum.isZero()) return;
      const weight = new D(p.salary).dividedBy(salarySum);
      buckets[p.id].owed = buckets[p.id].owed.plus(
        amt.times(weight)
      );
    });
  });

  /* ── 3. apply settlements ──────────────────────────────── */
  settlements.forEach(s => {
    const amt = new D(s.amount);
    buckets[s.fromPersonId].paid = buckets[s.fromPersonId].paid.plus(amt);
    buckets[s.toPersonId].owed  = buckets[s.toPersonId].owed.minus(amt);
  });

  /* ── 4. compute net & convert to plain numbers ─────────── */
  const out = {};
  for (const [id, b] of Object.entries(buckets)) {
    const net = b.paid.minus(b.owed);
    out[id] = {
      paid: +b.paid.toFixed(2),
      owed: +b.owed.toFixed(2),
      net:  +net.toFixed(2), 
    };
  }
  return out;
}

module.exports = { computeBalances };
