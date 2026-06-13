import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { patientService } from "../services/patientServices";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();

  // always fresh data from storage
  const patients = patientService.getAll();

  const handleDeletePatient = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmDelete) return;

    patientService.remove(id);

    window.location.reload();
  };

  const filteredPatients = patients
    .filter((patient) => {
      const matchSearch =
        patient.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        patient.phone.includes(search);

      const matchStatus =
        statusFilter === "All"
          ? true
          : patient.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

  const columns = [
    {
      key: "name",
      label: "Patient Name",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "age",
      label: "Age",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate(`/patients/${row.id}`)
            }
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
          >
            View
          </button>

          <button
            onClick={() =>
              handleDeletePatient(row.id)
            }
            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        subtitle="Manage all registered patients"
        action={
          <button
            onClick={() =>
              navigate("/patients/new")
            }
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            <FaPlus />
            Add Patient
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3">
        <SearchBar
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name or phone..."
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="border px-3 rounded-lg"
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      {filteredPatients.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredPatients}
        />
      ) : (
        <EmptyState
          title="No Patients Found"
          description="Try changing filters or add a new patient."
        />
      )}
    </div>
  );
}