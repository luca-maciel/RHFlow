import { api } from "./api";
import type {
  Contract,
  ContractRequest,
  TerminateContractRequest,
} from "../types/contract";

const contractService = {
  async findByEmployee(employeeId: string): Promise<Contract[]> {
    const { data } = await api.get<Contract[]>(
      `/contratos/funcionario/${employeeId}`,
    );
    return data;
  },

  async create(payload: ContractRequest): Promise<Contract> {
    const { data } = await api.post<Contract>("/contratos", payload);
    return data;
  },

  async terminate(
    id: string,
    payload: TerminateContractRequest,
  ): Promise<Contract> {
    const { data } = await api.patch<Contract>(
      `/contratos/${id}/encerrar`,
      payload,
    );
    return data;
  },
};

export default contractService;