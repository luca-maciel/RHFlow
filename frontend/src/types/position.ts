export type Position = {
  id: string;
  departamentoId: string;
  departamentoNome: string;
  nome: string;
  descricao: string | null;
  nivel: string | null;
  salarioBase: number | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PositionRequest = {
  departamentoId: string;
  nome: string;
  descricao: string;
  nivel: string;
  salarioBase: number | null;
};
