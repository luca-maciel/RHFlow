import axios from "axios";
import { api } from "./api";
import type { Address, AddressRequest } from "../types/address";

const addressService = {
  async findByEmployee(employeeId: string): Promise<Address | null> {
    try {
      const { data } = await api.get<Address>(
        `/enderecos/funcionario/${employeeId}`,
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async create(payload: AddressRequest): Promise<Address> {
    const { data } = await api.post<Address>("/enderecos", payload);
    return data;
  },

  async update(id: string, payload: AddressRequest): Promise<Address> {
    const { data } = await api.put<Address>(`/enderecos/${id}`, payload);
    return data;
  },
};

export default addressService;