import { FaTimes } from "react-icons/fa";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >
      <div
        className={`
          bg-white
          rounded-2xl
          shadow-xl
          w-full
          ${sizes[size]}
          animate-in
        `}
      >
        {/* Header */}
        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-4
            border-b
          "
        >
          <h2 className="text-xl font-semibold text-slate-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              text-slate-500
              hover:text-slate-700
              transition
            "
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}