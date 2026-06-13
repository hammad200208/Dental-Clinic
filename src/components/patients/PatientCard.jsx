import {
  FaPhone,
  FaEye,
  FaEdit,
  FaTrash,
  FaUser,
} from "react-icons/fa";

export default function PatientCard({ patient }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        {/* Patient Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <FaUser className="text-blue-600 text-xl" />
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              {patient.name}
            </h3>

            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FaPhone size={12} />
              {patient.phone}
            </div>
          </div>
        </div>

        {/* Status */}
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Active
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Problem</p>
            <p className="font-medium">
              {patient.problem}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Last Visit</p>
            <p className="font-medium">
              {patient.lastVisit || "Today"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">
          <FaEye />
          View
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700">
          <FaEdit />
          Edit
        </button>

        <button className="px-4 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">
          <FaTrash />
        </button>
      </div>
    </div>
  );
}