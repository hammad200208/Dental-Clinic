import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../services/patientServices";
import { appointmentService } from "../services/appointmentService";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    treatment: "",
    notes: "",
    amount: "",
    paidAmount: "",
    nextVisit: "",
  });

  // ✅ FIXED: async load on mount
  useEffect(() => {
    const load = async () => {
      const [patientData, apptData] = await Promise.all([
        patientService.getById(id),
        appointmentService.getByPatientId(id),
      ]);
      setPatient(patientData || null);
      setAppointments(Array.isArray(apptData) ? apptData : []);
      setLoading(false);
    };
    load();
  }, [id]);

  // ✅ FIXED: async refresh
  const refreshPatient = async () => {
    const updated = await patientService.getById(id);
    setPatient(updated);
  };

  const handleAddVisit = async () => {
    if (!form.treatment || !form.amount) return;

    await patientService.addVisit(id, {
      treatment: form.treatment,
      notes: form.notes,
      amount: Number(form.amount) || 0,
      paidAmount: Number(form.paidAmount) || 0,
      nextVisit: form.nextVisit,
    });

    await refreshPatient();

    setForm({ treatment: "", notes: "", amount: "", paidAmount: "", nextVisit: "" });
  };

  const handleDeleteVisit = async (visitId) => {
    await patientService.deleteVisit(id, visitId);
    await refreshPatient();
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Loading...</div>;
  }

  if (!patient) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Patient not found</h2>
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
    <div className="space-y-6 p-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
      >
        ← Back
      </button>

      {/* Patient Info */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-2xl font-bold">{patient.name}</h2>
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <button
              onClick={() => navigate(`/patients/${id}/edit`)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Edit Patient
            </button>
            <button
              onClick={() => navigate(`/patients/${id}/invoice`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Invoice
            </button>
          </div>
        </div>

        <div className="mt-4 text-slate-700 space-y-1">
          <p><b>Phone:</b> {patient.phone}</p>
          <p><b>Age:</b> {patient.age}</p>
          <p><b>Problem:</b> {patient.problem}</p>
          <p><b>Status:</b> {patient.status}</p>
          <p><b>Created At:</b> {new Date(patient.createdAt || patient.created_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Add Visit Form */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Add Visit</h3>

        <input
          type="text"
          placeholder="Treatment"
          value={form.treatment}
          onChange={(e) => setForm({ ...form, treatment: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="number"
          placeholder="Treatment Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="number"
          placeholder="Paid Amount"
          value={form.paidAmount}
          onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <input
          type="date"
          value={form.nextVisit}
          onChange={(e) => setForm({ ...form, nextVisit: e.target.value })}
          className="w-full border p-2 rounded-lg"
        />
        <button
          onClick={handleAddVisit}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Visit
        </button>
      </div>

      {/* Visit History */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Visit History</h3>

        {(patient.visits || []).length === 0 ? (
          <p className="text-slate-500">No visits yet</p>
        ) : (
          <div className="space-y-4">
            {(patient.visits || []).map((v) => {
              const paid = Number(v.paidAmount) || 0;
              const balance = (v.amount || 0) - paid;

              return (
                <div
                  key={v.id}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{v.treatment}</p>
                    <p className="text-sm text-slate-500">{new Date(v.date).toLocaleString()}</p>
                    {v.notes && <p className="text-sm text-slate-600 mt-2">{v.notes}</p>}
                    {v.nextVisit && (
                      <p className="text-sm text-blue-600 mt-2">Next Visit: {v.nextVisit}</p>
                    )}
                  </div>

                  <div className="text-right min-w-45">
                    <p className="font-bold text-lg">Rs. {v.amount || 0}</p>
                    <span
                      className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                        balance <= 0
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {balance <= 0 ? "Paid" : "Partial / Pending"}
                    </span>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-green-600">Paid: Rs. {paid}</p>
                      <p className="text-red-600">Balance: Rs. {balance}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteVisit(v.id)}
                      className="mt-3 text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment History */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Appointment History</h3>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-xl p-4 flex flex-col gap-2">
                <p className="font-semibold text-slate-800">{appointment.treatment}</p>
                <p className="text-sm text-slate-500">{appointment.date} • {appointment.time}</p>
                <p className="text-sm text-slate-600">Status: {appointment.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No appointments found.</p>
        )}
      </div>
    </div>
  );
}