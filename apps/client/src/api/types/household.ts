import { ExpenseSummary, ISODate, PersonLedger, Settlement } from "@/api/types";

export interface Household {
  id: string;
  name: string;
  description?: string;
  createdAt: ISODate;
}

export interface CreateHouseholdBody {
  name: string;
  description?: string;
}

export interface UpdateHouseholdBody {
  name?: string;
  description?: string;
}

export interface HouseholdSummaryResponse {
  householdId: string;
  people: PersonLedger[];
  expenses: ExpenseSummary[];
  settlements: Settlement[];
}
