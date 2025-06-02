import { Plus, Users } from "lucide-react";
import { Link, Outlet, useParams } from "react-router";

import { useExpenseMutations, useHouseholdSummary } from "@/api/hooks";
import { useSettlementMutations } from "@/api/hooks/useSettlement";

export default function HouseholdPage() {
  const { id = "" } = useParams();
  const { data, isLoading } = useHouseholdSummary(id);
  const { create: createExpense } = useExpenseMutations();
  const { create: createSettlement } = useSettlementMutations();

  if (isLoading || !data) return <p className="p-4">Loading…</p>;

  const handleNewExpense = () => {
    const description = window.prompt("Expense description");
    const amount = window.prompt("Amount") || "";
    if (!description || !amount) return;
    createExpense.mutate({
      householdId: id,
      description,
      amount,
      type: "HOUSE",
    });
  };

  const handleNewSettlement = () => {
    const from = window.prompt("From personId");
    const to = window.prompt("To personId");
    const amount = window.prompt("Amount") || "";
    if (!from || !to || !amount) return;
    createSettlement.mutate({
      householdId: id,
      fromPersonId: from,
      toPersonId: to,
      amount,
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {data.people.length > 0
            ? data.people[0].weight !== undefined && data.people[0].weight
            : ""}{" "}
          {` `}
          {data.householdId}
        </h1>
        <Link
          to="people"
          className="flex items-center gap-1 text-sm text-[--primary] hover:underline"
        >
          <Users size={16} />
          Membros
        </Link>
      </header>

      {/* Expenses list */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Despesas</h2>
          <button
            onClick={handleNewExpense}
            className="flex items-center gap-1 text-sm text-[--primary] hover:underline"
          >
            <Plus size={14} /> Adicionar despesa
          </button>
        </div>
        <ul className="space-y-1">
          {data.expenses.map((e) => (
            <li
              key={e.id}
              className="rounded border border-[--border] p-2 flex justify-between text-sm"
            >
              <span>{e.description}</span>
              <span className="font-mono">R$ {e.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Settlements list */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Quitações</h2>
          <button
            onClick={handleNewSettlement}
            className="flex items-center gap-1 text-sm text-[--primary] hover:underline"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
        <ul className="space-y-1">
          {data.settlements.map((s) => (
            <li
              key={s.id}
              className="rounded border border-[--border] p-2 flex justify-between text-sm"
            >
              <span>
                {s.fromPersonId} → {s.toPersonId}
              </span>
              <span className="font-mono">R$ {s.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Nested outlet for PeoplePage */}
      <Outlet />
    </div>
  );
}
