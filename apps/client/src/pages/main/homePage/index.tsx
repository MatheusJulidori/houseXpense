import { Plus } from "lucide-react";
import { Link } from "react-router";

import {
  useHouseholdList,
  useHouseholdMutations,
} from "@/api/hooks/useHousehold";
import DefaultLoadingSpinner from "@/components/ui/default-loading-spinner";

export default function HomePage() {
  const { data: households = [], isLoading } = useHouseholdList();
  const { create } = useHouseholdMutations();

  const handleCreate = () => {
    const name = window.prompt("Household name");
    if (!name) return;
    const description = window.prompt("Description (optional)") || "";
    create.mutate({ name, description });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Ambientes</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[--primary] text-[--primary-foreground] py-2 px-4 rounded-lg hover:bg-[--primary]/90 transition"
        >
          <Plus size={18} /> Novo
        </button>
      </header>

      {isLoading ? (
        <DefaultLoadingSpinner />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(() => {
            console.log("🧐 HomePage → households:", households);
            if (!Array.isArray(households)) {
              console.error(
                "Expected `households` to be an array but got:",
                households,
              );
              return "Error: Expected `households` to be an array"; // or return a placeholder/UI message
            }
            return households.map((hh) => (
              <Link
                key={hh.id}
                to={`/households/${hh.id}`}
                className="rounded-lg border border-[--border] bg-[--card] p-4 shadow hover:shadow-lg transition"
              >
                <h2 className="font-semibold text-lg">{hh.name}</h2>
                <p className="text-sm text-[--muted-foreground] truncate">
                  {hh.description || "—"}
                </p>
              </Link>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
