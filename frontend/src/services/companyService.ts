import api from "./api";

import type {
  Company,
  CompanyRequest,
} from "../types/company";

const companyService = {
  async findAll(): Promise<Company[]> {
    const response = await api.get<Company[]>("/empresas");

    return response.data;
  },

  async findById(id: string): Promise<Company> {
    const response = await api.get<Company>(
      `/empresas/${id}`
    );

    return response.data;
  },

  async create(data: CompanyRequest): Promise<Company> {
    const response = await api.post<Company>(
      "/empresas",
      data
    );

    return response.data;
  },

  async update(
    id: string,
    data: CompanyRequest
  ): Promise<Company> {
    const response = await api.put<Company>(
      `/empresas/${id}`,
      data
    );

    return response.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/empresas/${id}`);
  },
};

export default companyService;