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
        border-slate-200
        bg-white
        p-5

        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-[0_8px_25px_rgba(15,23,42,0.05)]
      "
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-1.5 text-[27px] font-bold tracking-tight text-slate-900">
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
            bg-blue-50
            text-lg
          "
        >
          {icon}
        </div>
      </div>

      <p className="text-[10px] text-slate-400">
        {description}
      </p>
    </div>
  );
}