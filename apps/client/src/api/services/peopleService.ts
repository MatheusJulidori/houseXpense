import apiClient from "@/api/client";
import { API_ROUTES } from "@/api/config";
import type {
  CreatePersonBody,
  PeopleDashboardQuery,
  PeopleListQuery,
  Person,
  PersonLedger,
  UpdatePersonBody,
} from "@/api/types";

export const peopleService = {
  async list(q: PeopleListQuery = {}): Promise<Person[]> {
    const response = await apiClient.get(API_ROUTES.people.base, { params: q });
    return response.data;
  },

  async dashboard(q: PeopleDashboardQuery): Promise<PersonLedger[]> {
    const response = await apiClient.get(API_ROUTES.people.dashboard, {
      params: q,
    });
    return response.data;
  },

  async get(id: string): Promise<Person> {
    const response = await apiClient.get(API_ROUTES.people.byId(id));
    return response.data;
  },

  async create(body: CreatePersonBody): Promise<Person> {
    const response = await apiClient.post(API_ROUTES.people.base, body);
    return response.data;
  },

  async update(id: string, body: UpdatePersonBody): Promise<Person> {
    const response = await apiClient.put(API_ROUTES.people.byId(id), body);
    return response.data;
  },

  async remove(id: string, settle = false): Promise<Person> {
    const url = settle
      ? API_ROUTES.people.deleteAndSettle(id)
      : API_ROUTES.people.byId(id);
    const response = await apiClient.delete(url);
    return response.data;
  },
};
