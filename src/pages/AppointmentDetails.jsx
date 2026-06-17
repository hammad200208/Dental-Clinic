import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await appointmentService.getById(Number(id));
      setAppointment(data || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Appointment not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
      >
        ← Back
      </button>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Appointment Details</h2>
        <p className="text-slate-500 text-sm mt-1">Full appointment information</p>
      </div>

      <div className="bg-white border rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-slate-500 text-sm">Patient Name</p>
          <p className="font-semibold text-lg">{appointment.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 text-sm">Date</p>
            <p className="font-medium">{appointment.date}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Time</p>
            <p className="font-medium">{appointment.time}</p>
          </div>
        </div>

        <div>
          <p className="text-slate-500 text-sm">Treatment</p>
          <p className="font-medium">{appointment.treatment || "Not specified"}</p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">Phone</p>
          <p className="font-medium">{appointment.phone}</p>
        </div>

        <div>
          <p className="text-slate-500 text-sm">Status</p>
          <span
            className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
              appointment.status === "Confirmed"
                ? "bg-green-100 text-green-700"
                : appointment.status === "Completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {appointment.status}
          </span>
        </div>

        <div>
          <p className="text-slate-500 text-sm">Created At</p>
          {/* ✅ FIXED: SQLite returns created_at, not createdAt */}
          <p className="font-medium">
            {appointment.created_at
              ? new Date(appointment.created_at).toLocaleString()
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}