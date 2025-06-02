import { Decimal, ISODate } from "@/api/types";

export interface Settlement {
  id: string;
  householdId: string;
  fromPersonId: string;
  toPersonId: string;
  amount: Decimal;
  date: ISODate;
}

export interface CreateSettlementBody {
  householdId: string;
  fromPersonId: string;
  toPersonId: string;
  amount: Decimal;
}

export interface SettlementsListQuery {
  householdId?: string;
  personId?: string;
}
