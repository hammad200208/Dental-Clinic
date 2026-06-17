import { useState, useEffect } from "react";
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
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Load patients on mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await patientService.getAll();

        // Normalize only safe UI defaults
        const normalized = data.map((p) => ({
          ...p,
          status: p.status || "Active",
        }));

        setPatients(normalized);
      } catch (err) {
        console.error("Failed to load patients", err);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleDeletePatient = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmDelete) return;

    try {
      await patientService.remove(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete patient. Please try again.");
    }
  };

  const filteredPatients = patients
    .filter((patient) => {
      const matchSearch =
        (patient.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (patient.phone || "").includes(search);

      const matchStatus =
        statusFilter === "All"
          ? true
          : patient.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const aDate = new Date(a.created_at || a.createdAt || 0);
      const bDate = new Date(b.created_at || b.createdAt || 0);
      return bDate - aDate;
    });

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

  if (loading) {
    return <div className="p-8 text-center">Loading patients...</div>;
  }

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