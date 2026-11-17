export interface Address {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressRequest {
  funcionarioId: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}