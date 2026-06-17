import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../services/patientServices";

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load patient async
  useEffect(() => {
    const load = async () => {
      try {
        const data = await patientService.getById(Number(id));

        setForm(
          data ?? {
            name: "",
            phone: "",
            age: "",
            problem: "",
            status: "Active",
          }
        );
      } catch (err) {
        console.error("Failed to load patient:", err);
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

  // ✅ async update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      alert("Name and phone are required");
      return;
    }

    try {
      await patientService.updatePatient(Number(id), {
        ...form,
        age: form.age ? Number(form.age) : null,
      });

      navigate(`/patients/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update patient");
    }
  };

  // ✅ loading state
  if (loading) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  // ✅ not found state
  if (!form) {
    return <h2 className="p-6">Patient not found</h2>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Patient</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border space-y-4"
      >
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          placeholder="Name"
        />

        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          placeholder="Phone"
        />

        <input
          type="number"
          name="age"
          value={form.age}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          placeholder="Age"
        />

        <textarea
          name="problem"
          value={form.problem}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          placeholder="Problem"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        >
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}