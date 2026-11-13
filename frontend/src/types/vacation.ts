export type VacationStatus =
  | "SOLICITADA"
  | "APROVADA"
  | "REJEITADA"
  | "EM_GOZO"
  | "CONCLUIDA"
  | "CANCELADA";

export interface VacationRequest {
  funcionarioId: string;
  inicioPeriodoAquisitivo: string|any;
  fimPeriodoAquisitivo: string|any;
  inicioGozo: string;
  fimGozo: string;
  observacao?: string;
}

export interface MyVacationRequest {
  inicioPeriodoAquisitivo?: string;
  fimPeriodoAquisitivo?: string;
  inicioGozo: string;
  fimGozo: string;
  observacao?: string;
}

export interface VacationDecisionRequest {
  motivo?: string;
}

export interface Vacation {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  inicioPeriodoAquisitivo: string;
  fimPeriodoAquisitivo: string;
  inicioGozo: string;
  fimGozo: string;
  quantidadeDias: number;
  status: VacationStatus;
  observacao?: string | null;
  motivoCancelamento?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AcquisitivePeriodSummary {
  funcionarioId: string;
  funcionarioNome: string;
  dataAdmissao: string;
  inicioPeriodoAquisitivo: string;
  fimPeriodoAquisitivo: string;
  inicioPeriodoConcessivo: string;
  fimPeriodoConcessivo: string;
  diasUtilizados: number;
  saldoDisponivel: number;
  direitoAdquirido: boolean;
}

export const VACATION_STATUS_LABELS: Record<VacationStatus, string> = {
  SOLICITADA: "Solicitada",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  EM_GOZO: "Em gozo",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const ACTIVE_VACATION_STATUS: VacationStatus[] = [
  "SOLICITADA",
  "APROVADA",
  "EM_GOZO",
];

export function isVacationHistory(status: VacationStatus): boolean {
  return (
    status === "CONCLUIDA" ||
    status === "REJEITADA" ||
    status === "CANCELADA"
  );
}