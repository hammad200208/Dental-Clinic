import { FaUsers } from "react-icons/fa";

export default function EmptyState({
  title,
  description,
  action,
  icon,
}) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-slate-200
        p-10
        text-center
      "
    >
      <div className="flex justify-center">
        {icon || (
          <FaUsers
            size={48}
            className="text-slate-300"
          />
        )}
      </div>

      <h2
        className="
          text-xl
          font-semibold
          text-slate-800
          mt-4
        "
      >
        {title}
      </h2>

      <p
        className="
          text-slate-500
          mt-2
          max-w-md
          mx-auto
        "
      >
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}