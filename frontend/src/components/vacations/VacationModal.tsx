import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  CalendarDays,
  X,
} from "lucide-react";

import type { Employee } from "../../types/employee";
import type { VacationRequest } from "../../types/vacation";

type VacationModalProps = {
  isOpen: boolean;
  employees: Employee[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    data: VacationRequest,
  ) => Promise<void> | void;
};

type VacationForm = {
  funcionarioId: string;
  inicioPeriodoAquisitivo: string;
  fimPeriodoAquisitivo: string;
  inicioGozo: string;
  fimGozo: string;
  observacao: string;
};

const INITIAL_FORM: VacationForm = {
  funcionarioId: "",
  inicioPeriodoAquisitivo: "",
  fimPeriodoAquisitivo: "",
  inicioGozo: "",
  fimGozo: "",
  observacao: "",
};

function calculateDays(
  start: string,
  end: string,
) {
  if (!start || !end) {
    return 0;
  }

  const startDate = new Date(
    `${start}T00:00:00`,
  );

  const endDate = new Date(
    `${end}T00:00:00`,
  );

  const difference =
    endDate.getTime() -
    startDate.getTime();

  if (difference < 0) {
    return 0;
  }

  return (
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24),
    ) + 1
  );
}

export default function VacationModal({
  isOpen,
  employees,
  loading,
  onClose,
  onSubmit,
}: VacationModalProps) {
  const [form, setForm] =
    useState<VacationForm>(
      INITIAL_FORM,
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setError("");
    }
  }, [isOpen]);

  const availableEmployees =
    useMemo(
      () =>
        employees
          .filter(
            (employee) =>
              employee.ativo &&
              employee.status !==
                "DESLIGADO",
          )
          .sort((a, b) =>
            a.nome.localeCompare(
              b.nome,
              "pt-BR",
            ),
          ),
      [employees],
    );

  const vacationDays =
    useMemo(
      () =>
        calculateDays(
          form.inicioGozo,
          form.fimGozo,
        ),
      [
        form.inicioGozo,
        form.fimGozo,
      ],
    );

  const selectedEmployee =
    useMemo(
      () =>
        employees.find(
          (employee) =>
            employee.id ===
            form.funcionarioId,
        ),
      [
        employees,
        form.funcionarioId,
      ],
    );

  function change(
    field: keyof VacationForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.funcionarioId) {
      setError(
        "Selecione um funcionário.",
      );
      return;
    }

    if (
      !form.inicioPeriodoAquisitivo ||
      !form.fimPeriodoAquisitivo
    ) {
      setError(
        "Informe o período aquisitivo.",
      );
      return;
    }

    if (
      form.fimPeriodoAquisitivo <
      form.inicioPeriodoAquisitivo
    ) {
      setError(
        "O fim do período aquisitivo não pode ser anterior ao início.",
      );
      return;
    }

    if (
      !form.inicioGozo ||
      !form.fimGozo
    ) {
      setError(
        "Informe o período de férias.",
      );
      return;
    }

    if (
      form.fimGozo <
      form.inicioGozo
    ) {
      setError(
        "O fim das férias não pode ser anterior ao início.",
      );
      return;
    }

    if (
      vacationDays < 1 ||
      vacationDays > 30
    ) {
      setError(
        "O período de férias deve possuir entre 1 e 30 dias.",
      );
      return;
    }

    await onSubmit({
      funcionarioId:
        form.funcionarioId,

      inicioPeriodoAquisitivo:
        form.inicioPeriodoAquisitivo,

      fimPeriodoAquisitivo:
        form.fimPeriodoAquisitivo,

      inicioGozo:
        form.inicioGozo,

      fimGozo:
        form.fimGozo,

      observacao:
        form.observacao.trim() ||
        undefined,
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/50 p-4
        backdrop-blur-[2px]
      "
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="
          flex max-h-[calc(100vh-32px)]
          w-full max-w-[680px]
          flex-col overflow-hidden
          rounded-2xl
          border border-app-border
          bg-surface shadow-2xl
        "
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-app-border p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-icon-surface text-primary">
              <CalendarDays
                size={19}
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-foreground">
                Nova solicitação
                de férias
              </h2>

              <p className="mt-1 text-[11px] text-muted">
                Informe o funcionário
                e os períodos da
                solicitação.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Fechar"
            className="
              flex h-9 w-9
              shrink-0 items-center
              justify-center
              rounded-lg text-muted
              transition-colors
              hover:bg-surface-hover
              hover:text-foreground
              disabled:opacity-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-5 sm:p-6">
          {error && (
            <div className="mb-5 rounded-xl border border-app-border bg-background p-3 text-[11px] text-danger">
              {error}
            </div>
          )}

          {/* FUNCIONÁRIO */}

          <FormSection
            title="Funcionário"
            description="Colaborador que utilizará o período de férias."
          >
            <Field
              label="Funcionário"
              required
            >
              <select
                value={
                  form.funcionarioId
                }
                disabled={loading}
                onChange={(event) =>
                  change(
                    "funcionarioId",
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Selecione um
                  funcionário
                </option>

                {availableEmployees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={
                        employee.id
                      }
                    >
                      {employee.nome}
                    </option>
                  ),
                )}
              </select>
            </Field>

            {selectedEmployee && (
              <div className="mt-3 rounded-xl border border-app-border bg-background/70 p-3">
                <p className="text-xs font-semibold text-foreground">
                  {
                    selectedEmployee.nome
                  }
                </p>

                <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] text-muted">
                  {selectedEmployee.cargoNome && (
                    <span>
                      {
                        selectedEmployee.cargoNome
                      }
                    </span>
                  )}

                  {selectedEmployee.departamentoNome && (
                    <>
                      <span>•</span>

                      <span>
                        {
                          selectedEmployee.departamentoNome
                        }
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </FormSection>

          {/* PERÍODO AQUISITIVO */}

          <FormSection
            title="Período aquisitivo"
            description="Período utilizado como referência para o direito às férias."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Início"
                required
              >
                <input
                  type="date"
                  value={
                    form.inicioPeriodoAquisitivo
                  }
                  disabled={loading}
                  onChange={(event) =>
                    change(
                      "inicioPeriodoAquisitivo",
                      event.target.value,
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field
                label="Fim"
                required
              >
                <input
                  type="date"
                  value={
                    form.fimPeriodoAquisitivo
                  }
                  min={
                    form.inicioPeriodoAquisitivo ||
                    undefined
                  }
                  disabled={loading}
                  onChange={(event) =>
                    change(
                      "fimPeriodoAquisitivo",
                      event.target.value,
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>
          </FormSection>

          {/* GOZO */}

          <FormSection
            title="Período de férias"
            description="Defina quando o funcionário iniciará e encerrará o período de gozo."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Início"
                required
              >
                <input
                  type="date"
                  value={
                    form.inicioGozo
                  }
                  disabled={loading}
                  onChange={(event) =>
                    change(
                      "inicioGozo",
                      event.target.value,
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field
                label="Fim"
                required
              >
                <input
                  type="date"
                  value={
                    form.fimGozo
                  }
                  min={
                    form.inicioGozo ||
                    undefined
                  }
                  disabled={loading}
                  onChange={(event) =>
                    change(
                      "fimGozo",
                      event.target.value,
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-icon-surface px-4 py-3">
              <div>
                <p className="text-[10px] font-medium text-muted">
                  Duração calculada
                </p>

                <p className="mt-0.5 text-[10px] text-muted-light">
                  Incluindo a data
                  inicial e final
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold text-primary">
                  {vacationDays}
                </span>

                <span className="ml-1 text-[10px] font-semibold text-primary">
                  {vacationDays === 1
                    ? "dia"
                    : "dias"}
                </span>
              </div>
            </div>

            {vacationDays > 30 && (
              <p className="mt-2 text-[10px] font-medium text-danger">
                O período informado
                ultrapassa o limite de
                30 dias.
              </p>
            )}
          </FormSection>

          {/* OBSERVAÇÃO */}

          <FormSection
            title="Observação"
            description="Informações adicionais sobre a solicitação."
            last
          >
            <Field label="Observação">
              <textarea
                value={
                  form.observacao
                }
                maxLength={500}
                rows={4}
                disabled={loading}
                onChange={(event) =>
                  change(
                    "observacao",
                    event.target.value,
                  )
                }
                placeholder="Adicione uma observação, se necessário..."
                className={`
                  ${inputClass}
                  h-auto min-h-[100px]
                  resize-none py-3
                `}
              />
            </Field>

            <p className="mt-1.5 text-right text-[9px] text-muted-light">
              {
                form.observacao
                  .length
              }
              /500
            </p>
          </FormSection>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-app-border bg-surface p-4 sm:flex-row sm:justify-end sm:p-5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="
              h-10 rounded-xl
              border border-app-border
              px-5 text-xs
              font-semibold text-muted
              transition-colors
              hover:bg-surface-hover
              hover:text-foreground
              disabled:opacity-50
            "
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="
              h-10 rounded-xl
              bg-primary px-5
              text-xs font-semibold
              text-white
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Enviando..."
              : "Solicitar férias"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass = `
  h-10
  w-full
  rounded-xl
  border
  border-app-border
  bg-background
  px-3
  text-xs
  text-foreground
  outline-none
  transition-colors
  placeholder:text-muted-light
  focus:border-primary
  disabled:cursor-not-allowed
  disabled:opacity-60
`;

function FormSection({
  title,
  description,
  children,
  last = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section
      className={
        last
          ? ""
          : "mb-6 border-b border-app-border pb-6"
      }
    >
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-foreground">
          {title}
        </h3>

        <p className="mt-1 text-[10px] text-muted">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium text-muted">
        {label}

        {required && (
          <span className="ml-1 text-danger">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}