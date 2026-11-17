export type ContractType = "CLT" | "PJ" | "ESTAGIO" | "TEMPORARIO";
export type ContractStatus = "ATIVO" | "ENCERRADO";

export interface Contract {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  tipo: ContractType;
  dataInicio: string;
  dataFim: string | null;
  status: ContractStatus;
  descricao: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractRequest {
  funcionarioId: string;
  tipo: ContractType;
  dataInicio: string;
  descricao?: string | null;
}

export interface TerminateContractRequest {
  dataFim: string;
}