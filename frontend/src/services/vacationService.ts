import { api } from "./api";

import type {
  MyVacationRequest,
  Vacation,
  VacationRequest,
} from "../types/vacation";

const BASE_URL = "/ferias";

const vacationService = {
  async findAll(): Promise<Vacation[]> {
    const { data } = await api.get<Vacation[]>(BASE_URL);
    return data;
  },

  async findMine(): Promise<Vacation[]> {
    const { data } = await api.get<Vacation[]>(`${BASE_URL}/minhas`);
    return data;
  },

  async findById(id: string): Promise<Vacation> {
    const { data } = await api.get<Vacation>(`${BASE_URL}/${id}`);
    return data;
  },

  async findByEmployee(employeeId: string): Promise<Vacation[]> {
    const { data } = await api.get<Vacation[]>(
      `${BASE_URL}/funcionario/${employeeId}`,
    );
    return data;
  },

  async request(request: VacationRequest): Promise<Vacation> {
    const { data } = await api.post<Vacation>(BASE_URL, request);
    return data;
  },

  async requestMine(request: MyVacationRequest): Promise<Vacation> {
    const { data } = await api.post<Vacation>(
      `${BASE_URL}/minhas`,
      request,
    );
    return data;
  },

  async approve(id: string): Promise<Vacation> {
    const { data } = await api.patch<Vacation>(
      `${BASE_URL}/${id}/aprovar`,
    );
    return data;
  },

  async reject(id: string): Promise<Vacation> {
    const { data } = await api.patch<Vacation>(
      `${BASE_URL}/${id}/rejeitar`,
    );
    return data;
  },

  async start(id: string): Promise<Vacation> {
    const { data } = await api.patch<Vacation>(
      `${BASE_URL}/${id}/iniciar`,
    );
    return data;
  },

  async complete(id: string): Promise<Vacation> {
    const { data } = await api.patch<Vacation>(
      `${BASE_URL}/${id}/concluir`,
    );
    return data;
  },

  async cancel(id: string): Promise<Vacation> {
    const { data } = await api.patch<Vacation>(
      `${BASE_URL}/${id}/cancelar`,
    );
    return data;
  },
};

export default vacationService;
