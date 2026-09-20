type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: string;
};

export default function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-app-border
        bg-surface
        p-5

        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-[0_8px_25px_rgba(15,23,42,0.05)]
      "
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
          "
        >
          {icon}
        </div>
      </div>

      <p className="text-[10px] text-muted-light">
        {description}
      </p>
    </div>
  );
}