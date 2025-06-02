import { Decimal, ISODate } from "@/api/types";

export interface Person {
  id: string;
  householdId: string;
  name: string;
  salary: Decimal;
  createdAt: ISODate;
}

export interface CreatePersonBody {
  householdId: string;
  name: string;
  salary: Decimal;
}

export interface UpdatePersonBody {
  householdId?: string;
  name?: string;
  salary?: Decimal;
}

export interface PeopleListQuery {
  householdId?: string; // GET /people?householdId=
}

export interface PeopleDashboardQuery {
  householdId: string; // GET /people/dashboard?householdId=
}

export interface PersonLedger {
  id: string;
  name: string;
  salary: Decimal;
  weight: number; // 0 … 1
  paid: Decimal;
  owed: Decimal;
  net: Decimal;
}

export interface ExpenseSummary {
  id: string;
  description: string;
  amount: Decimal;
  type: "HOUSE" | "PERSONAL";
  date: ISODate;
  paidById?: string;
  paidByName?: string | null;
  personId?: string | null; // for PERSONAL
}
