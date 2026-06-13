import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../services/patientServices";

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = patientService.getById(id);

  const [form, setForm] = useState({
    name: patient?.name || "",
    phone: patient?.phone || "",
    age: patient?.age || "",
    problem: patient?.problem || "",
    status: patient?.status || "Active",
  });

  if (!patient) {
    return <h2 className="p-6">Patient not found</h2>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    patientService.updatePatient(id, form);

    navigate(`/patients/${id}`);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        Edit Patient
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border space-y-4"
      >
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="w-full border p-2 rounded-lg"
        />

        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
          className="w-full border p-2 rounded-lg"
        />

        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) =>
            setForm({
              ...form,
              age: e.target.value,
            })
          }
          className="w-full border p-2 rounded-lg"
        />

        <textarea
          placeholder="Problem"
          value={form.problem}
          onChange={(e) =>
            setForm({
              ...form,
              problem: e.target.value,
            })
          }
          className="w-full border p-2 rounded-lg"
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value,
            })
          }
          className="w-full border p-2 rounded-lg"
        >
          <option>Active</option>
          <option>Pending</option>
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