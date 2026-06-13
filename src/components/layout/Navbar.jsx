import {
  FaBell,
  FaSearch,
} from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}

        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-4 top-3.5 text-slate-400" />

          <input
            type="text"
            placeholder="Search patient..."
            className="
              w-full
              pl-10
              pr-4
              py-2.5
              border
              rounded-xl
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        {/* Right */}

        <div className="flex items-center gap-5">
          <button className="relative">
            <FaBell
              size={20}
              className="text-slate-600"
            />

            <span
              className="
                absolute
                -top-2
                -right-2
                w-5
                h-5
                rounded-full
                bg-red-500
                text-white
                text-xs
                flex
                items-center
                justify-center
              "
            >
              3
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div
              className="
                w-10
                h-10
                rounded-full
                bg-blue-600
                text-white
                flex
                items-center
                justify-center
                font-semibold
              "
            >
              R
            </div>

            <div>
              <p className="font-medium">
                Receptionist
              </p>

              <p className="text-xs text-slate-500">
                Staff Account
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}