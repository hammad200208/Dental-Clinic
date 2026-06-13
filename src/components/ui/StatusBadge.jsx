const statusStyles = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
};

export default function StatusBadge({ status }) {
  const style =
    statusStyles[status?.toLowerCase()] ||
    "bg-slate-100 text-slate-700";

  return (
    <span
      className={`
        inline-flex
        items-center
        px-3
        py-1
        rounded-full
        text-xs
        font-medium
        ${style}
      `}
    >
      {status}
    </span>
  );
}