export type VacationStatus =
  | "SOLICITADA"
  | "APROVADA"
  | "REJEITADA"
  | "EM_GOZO"
  | "CONCLUIDA"
  | "CANCELADA";

export type VacationRequest = {
  funcionarioId: string;
  inicioPeriodoAquisitivo: string;
  fimPeriodoAquisitivo: string;
  inicioGozo: string;
  fimGozo: string;
  observacao?: string;
};

export type MyVacationRequest = {
  inicioPeriodoAquisitivo: string;
  fimPeriodoAquisitivo: string;
  inicioGozo: string;
  fimGozo: string;
  observacao?: string;
};

export type Vacation = {
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

  createdAt: string;
  updatedAt: string;
};

export const VACATION_STATUS_LABELS: Record<
  VacationStatus,
  string
> = {
  SOLICITADA: "Solicitada",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
  EM_GOZO: "Em gozo",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export function isVacationHistory(
  status: VacationStatus,
) {
  return (
    status === "CONCLUIDA" ||
    status === "REJEITADA" ||
    status === "CANCELADA"
  );
}

export const ACTIVE_VACATION_STATUS: VacationStatus[] = [
  "SOLICITADA",
  "APROVADA",
  "EM_GOZO",
];