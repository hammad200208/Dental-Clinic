const colors = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },

  green: {
    bg: "bg-green-100",
    text: "text-green-600",
  },

  red: {
    bg: "bg-red-100",
    text: "text-red-600",
  },

  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
  },

  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
}) {
  const selected =
    colors[color] || colors.blue;

  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-slate-200
        p-5
        shadow-sm
        hover:shadow-md
        transition
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
            {value}
          </h2>
        </div>

        <div
          className={`
            w-12
            h-12
            md:w-14
            md:h-14
            rounded-xl
            flex
            items-center
            justify-center
            ${selected.bg}
            ${selected.text}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}