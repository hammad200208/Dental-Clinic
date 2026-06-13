import { FaSave } from "react-icons/fa";
import PageHeader from "../components/ui/PageHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientService } from "./../services/patientServices";

export default function AddPatient() {
  const navigate = useNavigate();

const [formData, setFormData] = useState({
  name: "",
  phone: "",
  age: "",
  gender: "",
  problem: "",
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = (e) => {
  e.preventDefault();

  patientService.add(formData);

  navigate("/patients");
};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Patient"
        subtitle="Register a new patient in the clinic"
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <form
          onSubmit={handleSubmit}
         className="space-y-6">
          {/* Personal Information */}

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="03xx-xxxxxxx"
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-xl
                    px-4
                    py-3
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                >
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Medical Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Problem / Complaint
                </label>

                <textarea
                  rows="4"
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  placeholder="Describe the patient's problem..."
                  className="
                    w-full
                    border
                    border-slate-300
                    rounded-xl
                    px-4
                    py-3
                    resize-none
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>
            </div>
          </div>

          {/* Actions */}

          <div className="flex justify-end">
            <button
              type="submit"
              className="
                flex
                items-center
                gap-2
                bg-blue-600
                text-white
                px-6
                py-3
                rounded-xl
                hover:bg-blue-700
                transition
              "
            >
              <FaSave />

              Save Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}