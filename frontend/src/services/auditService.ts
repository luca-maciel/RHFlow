import { api } from "./api";

export interface AuditEvent {
  id: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  usuarioId: string;
  usuarioNome: string;
  descricao: string;
  detalhes: Record<string, unknown> | null;
  dataHora: string;
}

const auditService = {
  async findRecent(): Promise<AuditEvent[]> {
    const { data } = await api.get<AuditEvent[]>("/auditoria");
    return data;
  },
};

export default auditService;