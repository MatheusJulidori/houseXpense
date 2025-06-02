import { Plus } from "lucide-react";
import { useParams } from "react-router";

import { usePeopleDashboard, usePeopleMutations } from "@/api/hooks/usePeople";
import DefaultLoadingSpinner from "@/components/ui/default-loading-spinner";

export default function PeoplePage() {
  const { id: householdId = "" } = useParams();
  const { data = [], isLoading } = usePeopleDashboard({ householdId });
  const { create } = usePeopleMutations();

  const handleAdd = () => {
    const name = window.prompt("Name");
    const salary = window.prompt("Salary (e.g., 4500.00)") || "";
    if (!name || !salary) return;
    create.mutate({ householdId, name, salary });
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Membros</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 text-sm text-[--primary] hover:underline"
        >
          <Plus size={14} /> Adicionar membro
        </button>
      </div>

      {isLoading ? (
        <DefaultLoadingSpinner />
      ) : (
        <ul className="space-y-1">
          {data.map((p) => (
            <li
              key={p.id}
              className="rounded border border-[--border] p-2 flex justify-between text-sm"
            >
              <span>{p.name}</span>
              <span className="font-mono">{Math.round(p.weight * 100)}%</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
