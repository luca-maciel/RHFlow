import api from "./api";

import type {
  Department,
  DepartmentRequest,
} from "../types/department";

const departmentService = {
  async findAll(): Promise<Department[]> {
    const response = await api.get<Department[]>("/departamentos");
    return response.data;
  },

  async findById(id: string): Promise<Department> {
    const response = await api.get<Department>(`/departamentos/${id}`);
    return response.data;
  },

  async findByCompany(companyId: string): Promise<Department[]> {
    const response = await api.get<Department[]>(
      `/departamentos/empresa/${companyId}`
    );

    return response.data;
  },

  async create(data: DepartmentRequest): Promise<Department> {
    const response = await api.post<Department>("/departamentos", data);
    return response.data;
  },

  async update(
    id: string,
    data: DepartmentRequest
  ): Promise<Department> {
    const response = await api.put<Department>(
      `/departamentos/${id}`,
      data
    );

    return response.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/departamentos/${id}`);
  },
};

export default departmentService;
