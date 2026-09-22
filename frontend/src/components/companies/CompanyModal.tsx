import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  Company,
  CompanyRequest,
} from "../../types/company";

type CompanyModalProps = {
  isOpen: boolean;
  company?: Company | null;
  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: CompanyRequest
  ) => Promise<void> | void;
};

const initialForm: CompanyRequest = {
  razaoSocial: "",
  nome: "",
  cnpj: "",
  email: "",
  telefone: "",
};

export default function CompanyModal({
  isOpen,
  company,
  loading = false,
  onClose,
  onSubmit,
}: CompanyModalProps) {
  const [form, setForm] =
    useState<CompanyRequest>(initialForm);

  const [error, setError] = useState("");

  const editing = Boolean(company);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (company) {
      setForm({
        razaoSocial: company.razaoSocial,
        nome: company.nome,
        cnpj: company.cnpj,
        email: company.email ?? "",
        telefone: company.telefone ?? "",
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [company, isOpen]);

  function updateField(
    field: keyof CompanyRequest,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCnpj(value: string) {
    const onlyNumbers = value
      .replace(/\D/g, "")
      .slice(0, 14);

    updateField("cnpj", onlyNumbers);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.razaoSocial.trim()) {
      setError("Informe a razão social.");
      return;
    }

    if (!form.nome.trim()) {
      setError("Informe o nome da empresa.");
      return;
    }

    if (form.cnpj.length !== 14) {
      setError(
        "O CNPJ deve possuir exatamente 14 dígitos."
      );
      return;
    }

    setError("");

    await onSubmit(form);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-end
        justify-center

        bg-black/50
        backdrop-blur-[2px]

        sm:items-center
        sm:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[92dvh]
          w-full
          flex-col

          rounded-t-3xl
          border
          border-app-border
          bg-surface

          shadow-2xl

          sm:max-w-[650px]
          sm:rounded-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4

            border-b
            border-app-border

            px-5
            py-5

            sm:px-6
          "
        >
          <div>
            <p
              className="
                mb-1
                text-[11px]
                font-semibold
                text-primary
              "
            >
              Gestão de empresas
            </p>

            <h2
              className="
                text-lg
                font-bold
                text-foreground
              "
            >
              {editing
                ? "Editar empresa"
                : "Nova empresa"}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-muted
              "
            >
              {editing
                ? "Atualize os dados cadastrais da empresa."
                : "Preencha os dados para cadastrar uma empresa."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-xl

              text-lg
              text-muted

              transition

              hover:bg-surface-hover
              hover:text-foreground

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div
            className="
              overflow-y-auto

              p-5
              sm:p-6
            "
          >
            <div
              className="
                grid
                grid-cols-1
                gap-5

                sm:grid-cols-2
              "
            >
              {/* RAZÃO SOCIAL */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="razaoSocial"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-foreground
                  "
                >
                  Razão social
                  <span className="ml-1 text-danger">
                    *
                  </span>
                </label>

                <input
                  id="razaoSocial"
                  type="text"
                  maxLength={150}
                  value={form.razaoSocial}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "razaoSocial",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: RHFlow Tecnologia LTDA"
                  className={inputClass}
                />
              </div>

              {/* NOME */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="nome"
                  className={labelClass}
                >
                  Nome
                  <span className="ml-1 text-danger">
                    *
                  </span>
                </label>

                <input
                  id="nome"
                  type="text"
                  maxLength={150}
                  value={form.nome}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "nome",
                      event.target.value
                    )
                  }
                  placeholder="Ex.: RHFlow"
                  className={inputClass}
                />
              </div>

              {/* CNPJ */}

              <div>
                <label
                  htmlFor="cnpj"
                  className={labelClass}
                >
                  CNPJ
                  <span className="ml-1 text-danger">
                    *
                  </span>
                </label>

                <input
                  id="cnpj"
                  type="text"
                  inputMode="numeric"
                  value={form.cnpj}
                  disabled={loading}
                  onChange={(event) =>
                    handleCnpj(event.target.value)
                  }
                  placeholder="Somente números"
                  className={inputClass}
                />

                <p
                  className="
                    mt-1.5
                    text-[10px]
                    text-muted-light
                  "
                >
                  {form.cnpj.length}/14 dígitos
                </p>
              </div>

              {/* TELEFONE */}

              <div>
                <label
                  htmlFor="telefone"
                  className={labelClass}
                >
                  Telefone
                </label>

                <input
                  id="telefone"
                  type="tel"
                  maxLength={20}
                  value={form.telefone}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "telefone",
                      event.target.value
                    )
                  }
                  placeholder="(81) 99999-9999"
                  className={inputClass}
                />
              </div>

              {/* EMAIL */}

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className={labelClass}
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  maxLength={150}
                  value={form.email}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="contato@empresa.com"
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  px-4
                  py-3

                  text-xs
                  text-danger
                "
              >
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div
            className="
              flex
              flex-col-reverse
              gap-2

              border-t
              border-app-border

              bg-surface

              p-4

              sm:flex-row
              sm:justify-end
              sm:px-6
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                h-11

                rounded-xl
                border
                border-app-border

                px-5

                text-xs
                font-semibold
                text-muted

                transition

                hover:bg-surface-hover
                hover:text-foreground

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2

                rounded-xl
                bg-primary

                px-5

                text-xs
                font-semibold
                text-white

                shadow-lg
                shadow-blue-600/15

                transition

                hover:bg-primary-hover

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Cadastrar empresa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelClass = `
  mb-2
  block
  text-xs
  font-semibold
  text-foreground
`;

const inputClass = `
  h-11
  w-full

  rounded-xl
  border
  border-app-border

  bg-surface-secondary

  px-3.5

  text-xs
  text-foreground

  outline-none

  transition

  placeholder:text-muted-light

  focus:border-primary
  focus:bg-surface
  focus:ring-[3px]
  focus:ring-primary/10

  disabled:cursor-not-allowed
  disabled:opacity-60
`;