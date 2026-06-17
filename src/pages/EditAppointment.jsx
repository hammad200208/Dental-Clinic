import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";

export default function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: async load
  useEffect(() => {
    const load = async () => {
      try {
        const data = await appointmentService.getById(Number(id));

        setForm(
          data ?? {
            name: "",
            date: "",
            time: "",
            treatment: "",
            status: "Pending",
          }
        );
      } catch (err) {
        console.error("Failed to load appointment:", err);
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ FIX: async + await
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form) return;

    await appointmentService.update(Number(id), form);

    navigate("/appointments");
  };

  // ✅ Loading state
  if (loading) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  // ✅ Not found state
  if (!form) {
    return (
      <div className="p-6 text-slate-500">
        Appointment not found
      </div>
    );
  }

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