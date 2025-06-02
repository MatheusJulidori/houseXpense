import { Decimal, ISODate } from "@/api/types";

export interface Expense {
  id: string;
  householdId: string;
  description: string;
  amount: Decimal;
  type: "HOUSE" | "PERSONAL";
  date: ISODate;
  personId?: string | null;
  paidById?: string | null;
}

export interface CreateExpenseBody {
  householdId: string;
  description: string;
  amount: Decimal;
  type: "HOUSE" | "PERSONAL";
  personId?: string; // required if PERSONAL
  paidById?: string; // who laid out the money
}

export interface UpdateExpenseBody extends Partial<CreateExpenseBody> {}

export interface ExpensesListQuery {
  householdId?: string; // GET /expenses?householdId=
}
