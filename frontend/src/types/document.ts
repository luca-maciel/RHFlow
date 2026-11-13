export type DocumentType =
  | "CONTRATO"
  | "HOLERITE"
  | "INFORME_RENDIMENTOS"
  | "DECLARACAO_VINCULO"
  | "ATESTADO"
  | "COMPROVANTE"
  | "OUTRO";

export type DocumentRequestStatus =
  | "PENDENTE"
  | "CONCLUIDA"
  | "REJEITADA"
  | "CANCELADA";

export interface DocumentItem {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  solicitacaoId: string | null;
  titulo: string;
  tipo: DocumentType;
  nomeArquivoOriginal: string;
  contentType: string;
  tamanhoBytes: number;
  observacao: string | null;
  createdAt: string;
}

export interface DocumentRequestItem {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  tipoDocumento: DocumentType;
  justificativa: string | null;
  status: DocumentRequestStatus;
  motivoRejeicao: string | null;
  documentoId: string | null;
  documentoTitulo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequestPayload {
  tipoDocumento: DocumentType;
  justificativa?: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CONTRATO: "Contrato de trabalho",
  HOLERITE: "Holerite",
  INFORME_RENDIMENTOS: "Informe de rendimentos",
  DECLARACAO_VINCULO: "Declaração de vínculo",
  ATESTADO: "Atestado",
  COMPROVANTE: "Comprovante",
  OUTRO: "Outro",
};

export const DOCUMENT_REQUEST_STATUS_LABELS: Record<
  DocumentRequestStatus,
  string
> = {
  PENDENTE: "Pendente",
  CONCLUIDA: "Concluída",
  REJEITADA: "Rejeitada",
  CANCELADA: "Cancelada",
};