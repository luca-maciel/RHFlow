import api from "./api";

import type {
  Position,
  PositionRequest,
} from "../types/position";

const positionService = {
  async findAll(): Promise<Position[]> {
    const response = await api.get<Position[]>("/cargos");
    return response.data;
  },

  async findById(id: string): Promise<Position> {
    const response = await api.get<Position>(`/cargos/${id}`);
    return response.data;
  },

  async findByDepartment(
    departmentId: string
  ): Promise<Position[]> {
    const response = await api.get<Position[]>(
      `/cargos/departamento/${departmentId}`
    );

    return response.data;
  },

  async create(data: PositionRequest): Promise<Position> {
    const response = await api.post<Position>(
      "/cargos",
      data
    );

    return response.data;
  },

  async update(
    id: string,
    data: PositionRequest
  ): Promise<Position> {
    const response = await api.put<Position>(
      `/cargos/${id}`,
      data
    );

    return response.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/cargos/${id}`);
  },
};

export default positionService;
