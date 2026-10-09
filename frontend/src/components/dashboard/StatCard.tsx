type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: string;
  onClick?: () => void;
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  onClick,
}: StatCardProps) {
  const clickable = Boolean(onClick);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          clickable &&
          (event.key === "Enter" ||
            event.key === " ")
        ) {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`
        rounded-2xl
        border
        border-app-border
        bg-surface
        p-5

        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-[0_8px_25px_rgba(15,23,42,0.05)]

        ${
          clickable
            ? `
              cursor-pointer
              hover:border-blue-500/30
              hover:bg-surface-hover
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-blue-500
            `
            : ""
        }
      `}
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-muted-light">
            {title}
          </p>

          <p className="mt-1.5 text-[27px] font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-icon-surface
            text-lg
            transition-transform
            duration-200
          "
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-muted-light">
          {description}
        </p>

        {clickable && (
          <span className="shrink-0 text-[10px] font-medium text-blue-600">
            Ver detalhes →
          </span>
        )}
      </div>
    </div>
  );
}