import { api } from "./api";
import type { Employee, EmployeeRequest, EmployeeTerminationRequest } from "../types/employee";

const employeeService = {
  async countByStatus(
    status: "ATIVO" | "AFASTADO" | "FERIAS" | "DESLIGADO"
  ): Promise<number> {
    const response = await api.get<number>(
      `/funcionarios/status/${status}/count`
    );

    return response.data;
  },
  async findAll(): Promise<Employee[]> { return (await api.get<Employee[]>("/funcionarios")).data; },
  async findById(id: string): Promise<Employee> { return (await api.get<Employee>(`/funcionarios/${id}`)).data; },
  async findByPosition(id: string): Promise<Employee[]> { return (await api.get<Employee[]>(`/funcionarios/cargo/${id}`)).data; },
  async findByDepartment(id: string): Promise<Employee[]> { return (await api.get<Employee[]>(`/funcionarios/departamento/${id}`)).data; },
  async findByCompany(id: string): Promise<Employee[]> { return (await api.get<Employee[]>(`/funcionarios/empresa/${id}`)).data; },
  async create(data: EmployeeRequest): Promise<Employee> { return (await api.post<Employee>("/funcionarios", data)).data; },
  async update(id: string, data: EmployeeRequest): Promise<Employee> { return (await api.put<Employee>(`/funcionarios/${id}`, data)).data; },
  async reactivate(id: string): Promise<Employee> {
    return (await api.patch<Employee>(`/funcionarios/${id}/reativar`, { status: "ATIVO" })).data;
  },
  async terminate(id: string, data: EmployeeTerminationRequest): Promise<Employee> {
    return (await api.patch<Employee>(`/funcionarios/${id}/desligar`, data)).data;
  },

  async uploadPhoto(id: string, file: File): Promise<Employee> {
    const formData = new FormData();
    formData.append("arquivo", file);
    return (
      await api.post<Employee>(`/funcionarios/${id}/foto`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },

  async fetchPhotoUrl(id: string): Promise<string> {
    const response = await api.get<Blob>(`/funcionarios/${id}/foto`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  },

  async removePhoto(id: string): Promise<Employee> {
    return (await api.delete<Employee>(`/funcionarios/${id}/foto`)).data;
  },
};


export default employeeService;
