import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  Position,
  PositionRequest,
} from "../../types/position";

import type { Department } from "../../types/department";

type PositionModalProps = {
  isOpen: boolean;
  position?: Position | null;
  departments: Department[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: PositionRequest
  ) => Promise<void> | void;
};

type PositionForm = {
  departamentoId: string;
  nome: string;
  descricao: string;
  nivel: string;
  salarioBase: string;
};

const initialForm: PositionForm = {
  departamentoId: "",
  nome: "",
  descricao: "",
  nivel: "",
  salarioBase: "",
};

const suggestedLevels = [
  "JÚNIOR",
  "PLENO",
  "SÊNIOR",
  "GESTÃO",
];

export default function PositionModal({
  isOpen,
  position,
  departments,
  loading = false,
  onClose,
  onSubmit,
}: PositionModalProps) {
  const [form, setForm] =
    useState<PositionForm>(initialForm);

  const [error, setError] = useState("");

  const editing = Boolean(position);

  const availableDepartments = departments.filter(
    (department) =>
      department.ativo ||
      department.id === position?.departamentoId
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (position) {
      setForm({
        departamentoId: position.departamentoId,
        nome: position.nome,
        descricao: position.descricao ?? "",
        nivel: position.nivel ?? "",
        salarioBase:
          position.salarioBase === null
            ? ""
            : String(position.salarioBase),
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [isOpen, position]);

  function updateField(
    field: keyof PositionForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.departamentoId) {
      setError("Selecione um departamento.");
      return;
    }

    if (!form.nome.trim()) {
      setError("Informe o nome do cargo.");
      return;
    }

    if (form.nome.trim().length > 100) {
      setError(
        "O nome deve ter no máximo 100 caracteres."
      );
      return;
    }

    if (form.descricao.length > 500) {
      setError(
        "A descrição deve ter no máximo 500 caracteres."
      );
      return;
    }

    if (form.nivel.length > 50) {
      setError(
        "O nível deve ter no máximo 50 caracteres."
      );
      return;
    }

    const normalizedSalary =
      form.salarioBase.trim().replace(",", ".");

    const salary =
      normalizedSalary === ""
        ? null
        : Number(normalizedSalary);

    if (
      salary !== null &&
      (!Number.isFinite(salary) || salary < 0)
    ) {
      setError(
        "Informe um salário base válido e não negativo."
      );
      return;
    }

    setError("");

    await onSubmit({
      departamentoId: form.departamentoId,
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      nivel: form.nivel.trim(),
      salarioBase: salary,
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-end justify-center
        bg-black/50 backdrop-blur-[2px]
        sm:items-center sm:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex max-h-[92dvh] w-full flex-col
          rounded-t-3xl border border-app-border
          bg-surface shadow-2xl
          sm:max-w-[700px] sm:rounded-2xl
        "
      >
        <div className="flex items-start justify-between gap-4 border-b border-app-border px-5 py-5 sm:px-6">
          <div>
            <p className="mb-1 text-[11px] font-semibold text-primary">
              Gestão organizacional
            </p>

            <h2 className="text-lg font-bold text-foreground">
              {editing ? "Editar cargo" : "Novo cargo"}
            </h2>

            <p className="mt-1 text-xs text-muted">
              {editing
                ? "Atualize as informações do cargo."
                : "Cadastre um cargo e vincule-o a um departamento."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl text-lg text-muted transition
              hover:bg-surface-hover hover:text-foreground
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="departamentoId"
                  className={labelClass}
                >
                  Departamento
                  <span className="ml-1 text-danger">*</span>
                </label>

                <select
                  id="departamentoId"
                  value={form.departamentoId}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "departamentoId",
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Selecione um departamento
                  </option>

                  {availableDepartments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.nome} —{" "}
                        {department.empresaNome}
                      </option>
                    )
                  )}
                </select>

                {availableDepartments.length === 0 && (
                  <p className="mt-2 text-[10px] text-muted-light">
                    Nenhum departamento ativo disponível.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="nome"
                  className={labelClass}
                >
                  Nome do cargo
                  <span className="ml-1 text-danger">*</span>
                </label>

                <input
                  id="nome"
                  type="text"
                  maxLength={100}
                  value={form.nome}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "nome",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Desenvolvedor Backend"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="nivel"
                  className={labelClass}
                >
                  Nível
                </label>

                <input
                  id="nivel"
                  type="text"
                  list="position-levels"
                  maxLength={50}
                  value={form.nivel}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "nivel",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: PLENO"
                  className={inputClass}
                />

                <datalist id="position-levels">
                  {suggestedLevels.map((level) => (
                    <option
                      key={level}
                      value={level}
                    />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="salarioBase"
                  className={labelClass}
                >
                  Salário base
                </label>

                <input
                  id="salarioBase"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.salarioBase}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "salarioBase",
                      event.target.value
                    )
                  }
                  placeholder="0,00"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="descricao"
                    className="text-xs font-semibold text-foreground"
                  >
                    Descrição
                  </label>

                  <span className="text-[10px] text-muted-light">
                    {form.descricao.length}/500
                  </span>
                </div>

                <textarea
                  id="descricao"
                  maxLength={500}
                  rows={5}
                  value={form.descricao}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "descricao",
                      event.target.value
                    )
                  }
                  placeholder="Descreva as atribuições do cargo..."
                  className={`${inputClass} min-h-[120px] resize-none py-3`}
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-danger">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-app-border bg-surface p-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                h-11 rounded-xl border border-app-border px-5
                text-xs font-semibold text-muted transition
                hover:bg-surface-hover hover:text-foreground
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                availableDepartments.length === 0
              }
              className="
                flex h-11 items-center justify-center gap-2
                rounded-xl bg-primary px-5
                text-xs font-semibold text-white
                shadow-lg shadow-blue-600/15 transition
                hover:bg-primary-hover
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              {loading
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Cadastrar cargo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelClass = `
  mb-2 block text-xs font-semibold text-foreground
`;

const inputClass = `
  h-11 w-full rounded-xl
  border border-app-border bg-surface-secondary
  px-3.5 text-xs text-foreground
  outline-none transition
  placeholder:text-muted-light
  focus:border-primary focus:bg-surface
  focus:ring-[3px] focus:ring-primary/10
  disabled:cursor-not-allowed disabled:opacity-60
`;
