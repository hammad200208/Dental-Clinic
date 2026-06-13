import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";
import { patientService } from "../services/patientServices";

export default function NewAppointment() {
  const navigate = useNavigate();

  const [patients] = useState(() => patientService.getAll());

  const [form, setForm] = useState({
    patientId: "",
    date: "",
    time: "",
    treatment: "",
    status: "Pending",
  });

  // Patients are initialized from the service; no effect needed

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePatientChange = (e) => {
    const id = Number(e.target.value);

    if (!id) {
      setForm({
        ...form,
        patientId: "",
      });
      return;
    }

    const patient = patients.find((p) => p.id === id);

    if (!patient) return;

    setForm({
      ...form,
      patientId: patient.id,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.patientId || !form.date || !form.time) return;

    appointmentService.add({
      patientId: form.patientId,
      date: form.date,
      time: form.time,
      treatment: form.treatment,
      status: form.status,
    });

    // Reset form
    setForm({
      patientId: "",
      date: "",
      time: "",
      treatment: "",
      status: "Pending",
    });

    navigate("/appointments");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">
        New Appointment
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border space-y-4"
      >
        {/* Patient Dropdown */}
        <select
          value={form.patientId}
          onChange={handlePatientChange}
          className="w-full border p-2 rounded-lg"
        >
          <option value="">
            Select Patient
          </option>

          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} ({patient.phone})
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        {/* Time */}
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        {/* Treatment */}
        <input
          name="treatment"
          placeholder="Treatment (optional)"
          value={form.treatment}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />

        {/* Status */}
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Save Appointment
        </button>
      </form>
    </div>
  );
}