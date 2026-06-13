import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    const data = appointmentService.getById(id);
    return (
      data ?? {
        name: "",
        date: "",
        time: "",
        treatment: "",
        status: "Pending",
      }
    );
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    appointmentService.update(id, form);

    navigate("/appointments");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      <h2 className="text-2xl font-bold">
        Edit Appointment
      </h2>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded-2xl border space-y-4"
      >

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          placeholder="Patient Name"
        />

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
          value={form.treatment}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          placeholder="Treatment"
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
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Update Appointment
        </button>

      </form>
    </div>
  );
}