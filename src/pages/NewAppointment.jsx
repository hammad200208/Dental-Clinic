import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";
import { patientService } from "../services/patientServices";

export default function NewAppointment() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [mode, setMode] = useState("existing"); // "existing" | "new"
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    newName: "",
    newPhone: "",
    date: "",
    time: "",
    treatment: "",
    status: "Pending",
  });

  useEffect(() => {
    const load = async () => {
      const data = await patientService.getAll();
      setPatients(Array.isArray(data) ? data : []);
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (e) => {
    const id = Number(e.target.value);
    setForm({ ...form, patientId: id || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) return;

    setSaving(true);

    try {
      let patientId = form.patientId;
      let name = "";
      let phone = "";

      if (mode === "existing") {
        if (!patientId) {
          alert("Please select a patient.");
          setSaving(false);
          return;
        }
        const patient = patients.find((p) => p.id === patientId);
        name = patient?.name ?? "";
        phone = patient?.phone ?? "";
      } else {
        // ✅ New patient — create the patient record first
        if (!form.newName.trim() || !form.newPhone.trim()) {
          alert("Please enter name and phone for the new patient.");
          setSaving(false);
          return;
        }

        const newPatient = await patientService.add({
          name: form.newName.trim(),
          phone: form.newPhone.trim(),
          age: null,
          gender: "",
          problem: "",
          status: "Active",
        });

        if (!newPatient?.id) {
          alert("Failed to create patient. Please try again.");
          setSaving(false);
          return;
        }

        patientId = newPatient.id;
        name = newPatient.name;
        phone = newPatient.phone;
      }

      await appointmentService.add({
        patientId,
        name,
        phone,
        date: form.date,
        time: form.time,
        treatment: form.treatment,
        status: form.status,
      });

      navigate("/appointments");
    } catch (err) {
      console.error("Failed to save appointment:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">New Appointment</h2>

      {/* Mode toggle */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === "existing" ? "bg-white shadow-sm text-blue-700" : "text-slate-500"
          }`}
        >
          Existing Patient
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === "new" ? "bg-white shadow-sm text-blue-700" : "text-slate-500"
          }`}
        >
          New Patient
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border space-y-4"
      >
        {mode === "existing" ? (
          <select
            value={form.patientId}
            onChange={handlePatientChange}
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} ({patient.phone})
              </option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="newName"
              placeholder="Patient Name"
              value={form.newName}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
            <input
              name="newPhone"
              placeholder="Phone Number"
              value={form.newPhone}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
        )}

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        <input
          name="treatment"
          placeholder="Treatment (optional)"
          value={form.treatment}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
        </select>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Appointment"}
        </button>
      </form>
    </div>
  );
}