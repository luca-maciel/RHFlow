export type Company = {
  id: string;
  razaoSocial: string;
  nome: string;
  cnpj: string;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanyRequest = {
  razaoSocial: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
};