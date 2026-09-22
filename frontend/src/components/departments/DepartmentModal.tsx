import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  Department,
  DepartmentRequest,
} from "../../types/department";

import type { Company } from "../../types/company";

type DepartmentModalProps = {
  isOpen: boolean;
  department?: Department | null;
  companies: Company[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: DepartmentRequest
  ) => Promise<void> | void;
};

const initialForm: DepartmentRequest = {
  empresaId: "",
  nome: "",
  descricao: "",
};

export default function DepartmentModal({
  isOpen,
  department,
  companies,
  loading = false,
  onClose,
  onSubmit,
}: DepartmentModalProps) {
  const [form, setForm] =
    useState<DepartmentRequest>(initialForm);

  const [error, setError] = useState("");

  const editing = Boolean(department);

  const activeCompanies = companies.filter(
    (company) =>
      company.ativo ||
      company.id === department?.empresaId
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (department) {
      setForm({
        empresaId: department.empresaId,
        nome: department.nome,
        descricao: department.descricao ?? "",
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [department, isOpen]);

  function updateField(
    field: keyof DepartmentRequest,
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

    if (!form.empresaId) {
      setError("Selecione uma empresa.");
      return;
    }

    if (!form.nome.trim()) {
      setError("Informe o nome do departamento.");
      return;
    }

    if (form.descricao.length > 500) {
      setError(
        "A descrição deve ter no máximo 500 caracteres."
      );
      return;
    }

    setError("");

    await onSubmit({
      empresaId: form.empresaId,
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
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
          sm:max-w-[650px] sm:rounded-2xl
        "
      >
        <div
          className="
            flex items-start justify-between gap-4
            border-b border-app-border
            px-5 py-5 sm:px-6
          "
        >
          <div>
            <p className="mb-1 text-[11px] font-semibold text-primary">
              Gestão organizacional
            </p>

            <h2 className="text-lg font-bold text-foreground">
              {editing
                ? "Editar departamento"
                : "Novo departamento"}
            </h2>

            <p className="mt-1 text-xs text-muted">
              {editing
                ? "Atualize os dados do departamento."
                : "Cadastre um departamento e vincule-o a uma empresa."}
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
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label
                  htmlFor="empresaId"
                  className={labelClass}
                >
                  Empresa
                  <span className="ml-1 text-danger">*</span>
                </label>

                <select
                  id="empresaId"
                  value={form.empresaId}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "empresaId",
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Selecione uma empresa
                  </option>

                  {activeCompanies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.nome}
                    </option>
                  ))}
                </select>

                {activeCompanies.length === 0 && (
                  <p className="mt-2 text-[10px] text-muted-light">
                    Nenhuma empresa ativa disponível.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="nome"
                  className={labelClass}
                >
                  Nome
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
                  placeholder="Ex.: Tecnologia da Informação"
                  className={inputClass}
                />
              </div>

              <div>
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
                  placeholder="Descreva a finalidade do departamento..."
                  className={`${inputClass} min-h-[120px] resize-none py-3`}
                />
              </div>
            </div>

            {error && (
              <div
                className="
                  mt-5 rounded-xl border border-red-500/20
                  bg-red-500/10 px-4 py-3
                  text-xs text-danger
                "
              >
                {error}
              </div>
            )}
          </div>

          <div
            className="
              flex flex-col-reverse gap-2
              border-t border-app-border bg-surface p-4
              sm:flex-row sm:justify-end sm:px-6
            "
          >
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
                activeCompanies.length === 0
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
                  : "Cadastrar departamento"}
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
  w-full rounded-xl border border-app-border
  bg-surface-secondary px-3.5
  text-xs text-foreground outline-none transition
  placeholder:text-muted-light
  focus:border-primary focus:bg-surface
  focus:ring-[3px] focus:ring-primary/10
  disabled:cursor-not-allowed disabled:opacity-60
`;
