import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Clock3,
  Download,
  FilePlus2,
  FileText,
  FolderOpen,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { useAuth } from "../../contexts/AuthContext";
import documentService from "../../services/documentService";
import employeeService from "../../services/employeeService";
import type { Employee } from "../../types/employee";
import {
  DOCUMENT_REQUEST_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  type DocumentItem,
  type DocumentRequestItem,
  type DocumentRequestStatus,
  type DocumentType,
} from "../../types/document";

type ActiveTab = "documents" | "requests";

function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data;
  if (data && typeof data === "object") {
    if ("message" in data && typeof data.message === "string") {
      return data.message;
    }
    if ("error" in data && typeof data.error === "string") {
      return data.error;
    }
  }
  return fallback;
}

export default function Documents() {
  const { hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canManage = hasPermission("DOCUMENTOS_GERENCIAR");
  const canRequest = hasPermission("DOCUMENTOS_SOLICITAR") || canManage;
  const canViewAll = hasPermission("DOCUMENTOS_VISUALIZAR") || canManage;

  const [activeTab, setActiveTab] = useState<ActiveTab>("documents");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [requests, setRequests] = useState<DocumentRequestItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modais
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fulfillingRequest, setFulfillingRequest] =
    useState<DocumentRequestItem | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] =
    useState<DocumentRequestItem | null>(null);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [docsData, reqsData] = await Promise.all([
        canViewAll ? documentService.findAll() : documentService.findMine(),
        canViewAll
          ? documentService.findAllRequests()
          : documentService.findMyRequests(),
      ]);

      setDocuments(docsData);
      setRequests(reqsData);

      if (canManage) {
        const empData = await employeeService.findAll();
        setEmployees(empData);
      }
    } catch (err) {
      console.error(err);
      setError(
        getErrorMessage(err, "Não foi possível carregar os documentos."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [canViewAll, canManage]);

  const pendingRequestsCount = useMemo(
    () => requests.filter((r) => r.status === "PENDENTE").length,
    [requests],
  );

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) =>
      [
        doc.titulo,
        doc.funcionarioNome,
        doc.nomeArquivoOriginal,
        DOCUMENT_TYPE_LABELS[doc.tipo],
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [documents, search]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((req) =>
      [
        req.funcionarioNome,
        DOCUMENT_TYPE_LABELS[req.tipoDocumento],
        DOCUMENT_REQUEST_STATUS_LABELS[req.status],
        req.justificativa ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [requests, search]);

  async function handleDownload(doc: DocumentItem) {
    try {
      setActionLoading(doc.id);
      setError("");
      await documentService.download(doc.id, doc.nomeArquivoOriginal);
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao baixar o arquivo."));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivate(doc: DocumentItem) {
    if (!window.confirm(`Deseja remover o documento "${doc.titulo}"?`)) return;
    try {
      setActionLoading(doc.id);
      setError("");
      await documentService.deactivate(doc.id);
      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao remover o documento."));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelRequest(req: DocumentRequestItem) {
    try {
      setActionLoading(req.id);
      setError("");
      const updated = await documentService.cancelMyRequest(req.id);
      setRequests((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao cancelar a solicitação."));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="min-h-screen pt-[72px] md:ml-[250px] md:pt-[82px]">
        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-primary">
                {canViewAll ? "Gestão de pessoas" : "Área do colaborador"}
              </p>
              <h1 className="text-2xl font-bold text-foreground md:text-[28px]">
                Documentos
              </h1>
              <p className="mt-1 text-xs text-muted">
                {canManage
                  ? "Envie documentos aos colaboradores e atenda solicitações internas."
                  : "Consulte seus documentos disponibilizados pelo RH e faça solicitações."}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {canRequest && (
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-app-border bg-surface px-4 text-xs font-semibold text-foreground transition hover:bg-surface-hover"
                >
                  <FilePlus2 size={16} />
                  Solicitar documento
                </button>
              )}

              {canManage && (
                <button
                  type="button"
                  onClick={() => {
                    setFulfillingRequest(null);
                    setUploadModalOpen(true);
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-[0_6px_15px_rgba(37,99,235,0.18)] transition hover:bg-blue-700"
                >
                  <Upload size={16} />
                  Enviar documento
                </button>
              )}
            </div>
          </section>

          {error && (
            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-app-border bg-surface p-4">
              <p className="text-xs text-danger">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* CARDS RESUMO */}
          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-app-border bg-surface p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-icon-surface text-primary">
                <FolderOpen size={18} />
              </div>
              <p className="text-[10px] font-medium text-muted">
                Documentos disponíveis
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {loading ? "..." : documents.length}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-surface p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-icon-surface text-amber-600">
                <Clock3 size={18} />
              </div>
              <p className="text-[10px] font-medium text-muted">
                Solicitações pendentes
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {loading ? "..." : pendingRequestsCount}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-surface p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-icon-surface text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-[10px] font-medium text-muted">
                Total de solicitações
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {loading ? "..." : requests.length}
              </p>
            </div>
          </section>

          {/* CONTAINER PRINCIPAL */}
          <section className="overflow-hidden rounded-2xl border border-app-border bg-surface">
            <div className="flex border-b border-app-border px-4 sm:px-5">
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`relative flex items-center gap-2 px-4 py-4 text-xs font-semibold transition-colors ${
                  activeTab === "documents"
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Documentos
                <span className="rounded-full bg-icon-surface px-1.5 py-0.5 text-[9px]">
                  {documents.length}
                </span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full bg-primary transition-transform ${
                    activeTab === "documents" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`relative flex items-center gap-2 px-4 py-4 text-xs font-semibold transition-colors ${
                  activeTab === "requests"
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Solicitações
                {pendingRequestsCount > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] text-amber-600">
                    {pendingRequestsCount}
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full bg-primary transition-transform ${
                    activeTab === "requests" ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            </div>

            {/* BUSCA */}
            <div className="border-b border-app-border p-4 sm:p-5">
              <div className="relative w-full max-w-[420px]">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-light"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === "documents"
                      ? "Pesquisar por título, tipo ou colaborador..."
                      : "Pesquisar solicitações..."
                  }
                  className="h-10 w-full rounded-xl border border-app-border bg-background pl-10 pr-4 text-xs text-foreground outline-none transition-colors placeholder:text-muted-light focus:border-primary"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-muted">
                Carregando registros...
              </div>
            ) : activeTab === "documents" ? (
              filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-icon-surface text-muted">
                    <FileText size={19} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Nenhum documento encontrado
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    Os arquivos enviados aparecerão listados aqui.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="border-b border-app-border bg-background/70">
                        <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                          Documento
                        </th>
                        {canViewAll && (
                          <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                            Colaborador
                          </th>
                        )}
                        <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                          Tipo
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                          Tamanho
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                          Enviado em
                        </th>
                        <th className="px-5 py-3 text-right text-[10px] uppercase text-muted-light">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b border-app-border transition-colors last:border-0 hover:bg-background/70"
                        >
                          <td className="px-5 py-4">
                            <p className="text-xs font-semibold text-foreground">
                              {doc.titulo}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-light">
                              {doc.nomeArquivoOriginal}
                            </p>
                          </td>
                          {canViewAll && (
                            <td className="px-5 py-4 text-xs text-foreground">
                              {doc.funcionarioNome}
                            </td>
                          )}
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-icon-surface px-2.5 py-1 text-[10px] font-semibold text-primary">
                              {DOCUMENT_TYPE_LABELS[doc.tipo]}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted">
                            {formatFileSize(doc.tamanhoBytes)}
                          </td>
                          <td className="px-5 py-4 text-xs text-muted">
                            {formatDateTime(doc.createdAt)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                disabled={actionLoading === doc.id}
                                onClick={() => void handleDownload(doc)}
                                title="Baixar documento"
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-app-border px-3 text-[11px] font-semibold text-foreground transition hover:bg-surface-hover disabled:opacity-50"
                              >
                                <Download size={13} />
                                Baixar
                              </button>

                              {canManage && (
                                <button
                                  type="button"
                                  disabled={actionLoading === doc.id}
                                  onClick={() => void handleDeactivate(doc)}
                                  title="Remover documento"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-danger transition hover:bg-surface-hover disabled:opacity-50"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-icon-surface text-muted">
                  <FilePlus2 size={19} />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Nenhuma solicitação encontrada
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  Solicitações de documentos internos aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-app-border bg-background/70">
                      {canViewAll && (
                        <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                          Colaborador
                        </th>
                      )}
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Tipo solicitado
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Justificativa / Resposta
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-[10px] uppercase text-muted-light">
                        Data
                      </th>
                      <th className="px-5 py-3 text-right text-[10px] uppercase text-muted-light">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b border-app-border transition-colors last:border-0 hover:bg-background/70"
                      >
                        {canViewAll && (
                          <td className="px-5 py-4 text-xs font-semibold text-foreground">
                            {req.funcionarioNome}
                          </td>
                        )}
                        <td className="px-5 py-4 text-xs font-medium text-foreground">
                          {DOCUMENT_TYPE_LABELS[req.tipoDocumento]}
                        </td>
                        <td className="max-w-[300px] px-5 py-4 text-xs text-muted">
                          <p className="truncate">
                            {req.justificativa || "Sem observações"}
                          </p>
                          {req.motivoRejeicao && (
                            <p className="mt-1 text-[10px] text-danger">
                              Motivo: {req.motivoRejeicao}
                            </p>
                          )}
                          {req.documentoTitulo && (
                            <p className="mt-1 text-[10px] text-emerald-600">
                              Anexo: {req.documentoTitulo}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <RequestStatusBadge status={req.status} />
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {formatDateTime(req.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {req.status === "CONCLUIDA" && req.documentoId && (
                              <button
                                type="button"
                                onClick={() =>
                                  void documentService.download(
                                    req.documentoId!,
                                    req.documentoTitulo || "documento",
                                  )
                                }
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-app-border px-3 text-[11px] font-semibold text-primary transition hover:bg-surface-hover"
                              >
                                <Download size={13} />
                                Baixar anexo
                              </button>
                            )}

                            {req.status === "PENDENTE" && canManage && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFulfillingRequest(req);
                                    setUploadModalOpen(true);
                                  }}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-semibold text-white transition hover:opacity-90"
                                >
                                  <Upload size={13} />
                                  Anexar e concluir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectingRequest(req)}
                                  className="inline-flex h-8 items-center rounded-lg border border-app-border px-3 text-[11px] font-semibold text-danger transition hover:bg-surface-hover"
                                >
                                  Rejeitar
                                </button>
                              </>
                            )}

                            {req.status === "PENDENTE" && !canManage && (
                              <button
                                type="button"
                                disabled={actionLoading === req.id}
                                onClick={() => void handleCancelRequest(req)}
                                className="inline-flex h-8 items-center rounded-lg border border-app-border px-3 text-[11px] font-semibold text-danger transition hover:bg-surface-hover disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL UPLOAD / ATENDER SOLICITAÇÃO */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        employees={employees}
        fulfillingRequest={fulfillingRequest}
        onClose={() => {
          setUploadModalOpen(false);
          setFulfillingRequest(null);
        }}
        onSuccess={() => {
          setUploadModalOpen(false);
          setFulfillingRequest(null);
          void loadAll();
        }}
      />

      {/* MODAL NOVA SOLICITAÇÃO */}
      <NewDocumentRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          setRequestModalOpen(false);
          setActiveTab("requests");
          void loadAll();
        }}
      />

      {/* MODAL REJEITAR SOLICITAÇÃO */}
      <RejectRequestModal
        request={rejectingRequest}
        onClose={() => setRejectingRequest(null)}
        onSuccess={() => {
          setRejectingRequest(null);
          void loadAll();
        }}
      />
    </div>
  );
}

function RequestStatusBadge({ status }: { status: DocumentRequestStatus }) {
  const styles: Record<DocumentRequestStatus, string> = {
    PENDENTE: "text-amber-600",
    CONCLUIDA: "text-emerald-600",
    REJEITADA: "text-danger",
    CANCELADA: "text-muted-light",
  };

  return (
    <span
      className={`inline-flex rounded-full bg-surface-secondary px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {DOCUMENT_REQUEST_STATUS_LABELS[status]}
    </span>
  );
}

function UploadDocumentModal({
  isOpen,
  employees,
  fulfillingRequest,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  employees: Employee[];
  fulfillingRequest: DocumentRequestItem | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [funcionarioId, setFuncionarioId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<DocumentType>("COMPROVANTE");
  const [observacao, setObservacao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setFormError("");
    setArquivo(null);
    setObservacao("");

    if (fulfillingRequest) {
      setFuncionarioId(fulfillingRequest.funcionarioId);
      setTipo(fulfillingRequest.tipoDocumento);
      setTitulo(DOCUMENT_TYPE_LABELS[fulfillingRequest.tipoDocumento]);
    } else {
      setFuncionarioId("");
      setTipo("COMPROVANTE");
      setTitulo("");
    }
  }, [isOpen, fulfillingRequest]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!funcionarioId) {
      setFormError("Selecione o colaborador.");
      return;
    }
    if (!titulo.trim()) {
      setFormError("Informe o título do documento.");
      return;
    }
    if (!arquivo) {
      setFormError("Selecione um arquivo (PDF, PNG, JPG ou DOCX).");
      return;
    }

    try {
      setSaving(true);
      await documentService.upload({
        funcionarioId,
        titulo: titulo.trim(),
        tipo,
        observacao: observacao.trim() || undefined,
        solicitacaoId: fulfillingRequest?.id,
        arquivo,
      });
      onSuccess();
    } catch (err) {
      setFormError(getErrorMessage(err, "Erro ao enviar documento."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-app-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-app-border p-5 sm:p-6">
          <div>
            <p className="mb-1 text-xs font-medium text-primary">
              {fulfillingRequest ? "Atender solicitação" : "Gestão de documentos"}
            </p>
            <h2 className="text-lg font-bold text-foreground">
              Enviar documento
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface-hover"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-5 sm:p-6">
            {formError && (
              <div className="rounded-xl border border-app-border bg-background p-3 text-xs text-danger">
                {formError}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">
                Colaborador
              </label>
              <select
                value={funcionarioId}
                onChange={(e) => setFuncionarioId(e.target.value)}
                disabled={saving || Boolean(fulfillingRequest)}
                className="h-11 w-full rounded-xl border border-app-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-60"
              >
                <option value="">Selecione um colaborador...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-foreground">
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as DocumentType)}
                  disabled={saving || Boolean(fulfillingRequest)}
                  className="h-11 w-full rounded-xl border border-app-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-60"
                >
                  {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(
                    (key) => (
                      <option key={key} value={key}>
                        {DOCUMENT_TYPE_LABELS[key]}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-foreground">
                  Título
                </label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={saving}
                  placeholder="Ex: Holerite Novembro/2026"
                  className="h-11 w-full rounded-xl border border-app-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">
                Arquivo (PDF, PNG, JPG ou DOCX até 10MB)
              </label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                disabled={saving}
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-app-border bg-background p-2.5 text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">
                Observação (opcional)
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                disabled={saving}
                className="w-full resize-none rounded-xl border border-app-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-app-border p-5 sm:p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl border border-app-border px-5 text-xs font-semibold text-muted hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Enviando..." : "Salvar documento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewDocumentRequestModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tipoDocumento, setTipoDocumento] =
    useState<DocumentType>("DECLARACAO_VINCULO");
  const [justificativa, setJustificativa] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTipoDocumento("DECLARACAO_VINCULO");
    setJustificativa("");
    setFormError("");
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setFormError("");
      await documentService.createRequest({
        tipoDocumento,
        justificativa: justificativa.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      setFormError(getErrorMessage(err, "Erro ao enviar solicitação."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-app-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between border-b border-app-border p-5 sm:p-6">
          <div>
            <p className="mb-1 text-xs font-medium text-primary">
              Solicitação interna
            </p>
            <h2 className="text-lg font-bold text-foreground">
              Solicitar documento ao RH
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface-hover"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-5 sm:p-6">
            {formError && (
              <div className="rounded-xl border border-app-border bg-background p-3 text-xs text-danger">
                {formError}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">
                Tipo de documento
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) =>
                  setTipoDocumento(e.target.value as DocumentType)
                }
                className="h-11 w-full rounded-xl border border-app-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
              >
                {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {DOCUMENT_TYPE_LABELS[key]}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">
                Justificativa / Detalhes (opcional)
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Ex: Preciso da declaração de vínculo para comprovação bancária..."
                className="w-full resize-none rounded-xl border border-app-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-app-border p-5 sm:p-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-app-border px-5 text-xs font-semibold text-muted hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Enviando..." : "Solicitar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectRequestModal({
  request,
  onClose,
  onSuccess,
}: {
  request: DocumentRequestItem | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMotivo("");
  }, [request]);

  if (!request) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!request) return;
    try {
      setSaving(true);
      await documentService.rejectRequest(request.id, motivo.trim() || undefined);
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-app-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between border-b border-app-border p-5">
          <h2 className="text-base font-bold text-foreground">
            Rejeitar solicitação
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <label className="mb-2 block text-xs font-semibold text-foreground">
              Motivo da rejeição
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Informe o motivo ao colaborador..."
              className="w-full resize-none rounded-xl border border-app-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-app-border p-5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-app-border px-4 text-xs font-semibold text-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-danger px-4 text-xs font-semibold text-white"
            >
              {saving ? "Rejeitando..." : "Confirmar rejeição"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}