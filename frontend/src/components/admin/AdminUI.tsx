import type { ReactNode } from "react";
export const field =
  "w-full h-11 rounded-xl border border-app-border bg-surface-secondary px-3 text-sm text-foreground outline-none transition-all duration-200 hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50";
export const primary =
  "inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.98] disabled:opacity-50";
export const secondary =
  "inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border px-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/30 hover:bg-surface-hover active:scale-[0.98] disabled:opacity-50";
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[94dvh] w-full max-w-[800px] flex-col rounded-t-3xl border border-app-border bg-surface shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-app-border p-5">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className={secondary}
          >
            Fechar
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
export function CheckPermissions({
  selected,
  onChange,
  permissions,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  permissions: import("../../types/access").Permission[];
}) {
  const groups = [...new Set(permissions.map((p) => p.module))];
  return (
    <div className="space-y-4">
      {groups.map((module) => (
        <section
          key={module}
          className="rounded-xl border border-app-border p-3"
        >
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            {module}
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {permissions
              .filter((p) => p.module === module)
              .map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={selected.includes(p.id)}
                    onChange={(e) =>
                      onChange(
                        e.target.checked
                          ? [...selected, p.id]
                          : selected.filter((x) => x !== p.id),
                      )
                    }
                  />
                  {p.name}
                </label>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
