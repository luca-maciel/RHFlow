export type Employee = {
  id: string; cargoId: string; cargoNome: string;
  departamentoId: string; departamentoNome: string;
  empresaId: string; empresaNome: string;
  nome: string; cpf: string; rg: string | null;
  dataNascimento: string | null; email: string | null; telefone: string | null;
  dataAdmissao: string; dataDemissao: string | null;
  status: string; ativo: boolean; createdAt: string; updatedAt: string;
};
export type EmployeeRequest = {
  cargoId: string; nome: string; cpf: string; rg: string;
  dataNascimento: string | null; email: string; telefone: string;
  dataAdmissao: string; status: string | null;
};
export type EmployeeTerminationRequest = { dataDemissao: string };
