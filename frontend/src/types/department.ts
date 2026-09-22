export type Department = {
  id: string;
  empresaId: string;
  empresaNome: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentRequest = {
  empresaId: string;
  nome: string;
  descricao: string;
};
