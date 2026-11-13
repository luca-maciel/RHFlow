import { api } from "./api";
import type {
  CreateDocumentRequestPayload,
  DocumentItem,
  DocumentRequestItem,
  DocumentType,
} from "../types/document";

const BASE_URL = "/documentos";

export interface UploadDocumentPayload {
  funcionarioId: string;
  titulo: string;
  tipo: DocumentType;
  observacao?: string;
  solicitacaoId?: string;
  arquivo: File;
}

const documentService = {
  async findAll(): Promise<DocumentItem[]> {
    const { data } = await api.get<DocumentItem[]>(BASE_URL);
    return data;
  },

  async findMine(): Promise<DocumentItem[]> {
    const { data } = await api.get<DocumentItem[]>(`${BASE_URL}/meus`);
    return data;
  },

  async upload(payload: UploadDocumentPayload): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("funcionarioId", payload.funcionarioId);
    formData.append("titulo", payload.titulo);
    formData.append("tipo", payload.tipo);
    if (payload.observacao) {
      formData.append("observacao", payload.observacao);
    }
    if (payload.solicitacaoId) {
      formData.append("solicitacaoId", payload.solicitacaoId);
    }
    formData.append("arquivo", payload.arquivo);

    const { data } = await api.post<DocumentItem>(BASE_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async download(id: string, filename: string): Promise<void> {
    const response = await api.get<Blob>(`${BASE_URL}/${id}/download`, {
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // --- SOLICITAÇÕES ---

  async findAllRequests(): Promise<DocumentRequestItem[]> {
    const { data } = await api.get<DocumentRequestItem[]>(
      `${BASE_URL}/solicitacoes`,
    );
    return data;
  },

  async findMyRequests(): Promise<DocumentRequestItem[]> {
    const { data } = await api.get<DocumentRequestItem[]>(
      `${BASE_URL}/solicitacoes/minhas`,
    );
    return data;
  },

  async createRequest(
    payload: CreateDocumentRequestPayload,
  ): Promise<DocumentRequestItem> {
    const { data } = await api.post<DocumentRequestItem>(
      `${BASE_URL}/solicitacoes/minhas`,
      payload,
    );
    return data;
  },

  async rejectRequest(
    id: string,
    motivo?: string,
  ): Promise<DocumentRequestItem> {
    const { data } = await api.patch<DocumentRequestItem>(
      `${BASE_URL}/solicitacoes/${id}/rejeitar`,
      motivo ? { motivo } : {},
    );
    return data;
  },

  async cancelMyRequest(id: string): Promise<DocumentRequestItem> {
    const { data } = await api.patch<DocumentRequestItem>(
      `${BASE_URL}/solicitacoes/${id}/cancelar`,
    );
    return data;
  },
};

export default documentService;