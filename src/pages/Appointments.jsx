import { useState } from "react";
import {
  FaPlus,
  FaCalendarDay,
  FaCheckCircle,
  FaHourglassHalf,
  FaCheckDouble,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { appointmentService } from "../services/appointmentService";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function Appointments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const sortByDateTime = (a, b) => {
    return (
      new Date(`${a.date} ${a.time}`) -
      new Date(`${b.date} ${b.time}`)
    );
  };
  const [appointments, setAppointments] = useState(
    appointmentService.getAll().sort(sortByDateTime)
  );


  const isToday = (date) =>
    new Date(date).toDateString() ===
    new Date().toDateString();

  const today = new Date().toISOString().split("T")[0];

  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter(
    (a) => isToday(a.date)
  ).length;
  const confirmedAppointments = appointments.filter(
    (a) => a.status === "Confirmed"
  ).length;
  const pendingAppointments = appointments.filter(
    (a) => a.status === "Pending"
  ).length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "Completed"
  ).length;

  const todayList = appointments
    .filter(
      (a) =>
        a.date === today &&
        a.status !== "Completed"
    )
    .sort(sortByDateTime);

  const now = new Date();

  const nextAppointment =
    todayList.find(
      (a) =>
        new Date(`${a.date} ${a.time}`) > now
    ) || null;

  const refresh = () => {
    setAppointments(appointmentService.getAll().sort(sortByDateTime));
  };

  const handleCancel = (id) => {
    const confirmed = window.confirm(
      "Delete this appointment?"
    );
    if (!confirmed) return;
    appointmentService.remove(id);
    refresh();
  };

  const getStatus = (appointment) => {
    if (appointment.status === "Completed") return "Completed";
    const isOverdue =
    new Date(`${appointment.date} ${appointment.time}`) < new Date();
    return isOverdue ? "Overdue" : appointment.status;
  };


  const filteredAppointments = appointments.filter(
    (appointment) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (appointment.name || "").toLowerCase().includes(q) ||
        (appointment.phone || "").toLowerCase().includes(q) ||
        (appointment.treatment || "").toLowerCase().includes(q);


      const matchesFilter =
        filter === "All"
          ? true
          : filter === "Today"
          ? isToday(appointment.date)
          : filter === "Overdue"
          ? getStatus(appointment) === "Overdue"
          : appointment.status === filter;

      return matchesSearch && matchesFilter;
    }
  );

  const columns = [
    {
      key: "name",
      label: "Patient",
    },
    {
      key: "date",
      label: "Date",
    },
    {
      key: "time",
      label: "Time",
    },
    {
      key: "treatment",
      label: "Treatment",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={getStatus(row)} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() =>
              navigate(`/appointments/${row.id}`)
            }
            className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700"
          >
            View
          </button>

          <button
            onClick={() =>
              navigate(`/appointments/edit/${row.id}`)
            }
            className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700"
          >
            Edit
          </button>

          <select
            value={row.status}
            onChange={(e) => {
              appointmentService.updateStatus(
                row.id,
                e.target.value
              );
              refresh();
            }}
            className="px-3 py-1 rounded-lg border border-slate-200"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={() => handleCancel(row.id)}
            className="px-3 py-1 rounded-lg bg-red-100 text-red-700"
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
        title="Appointments"
        subtitle="Manage clinic appointments"
        action={
          <button
            onClick={() => navigate("/appointments/new")}
            className="
              flex
              items-center
              gap-2
              bg-blue-600
              text-white
              px-4
              py-2
              rounded-xl
              hover:bg-blue-700
            "
          >
            <FaPlus />
            New Appointment
          </button>
        }
      />

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search patient, phone or treatment..."
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          icon={<FaClipboardList size={22} />}
          color="indigo"
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppointments}
          icon={<FaCalendarDay size={22} />}
          color="blue"
        />
        <StatCard
          title="Confirmed"
          value={confirmedAppointments}
          icon={<FaCheckCircle size={22} />}
          color="green"
        />
        <StatCard
          title="Pending"
          value={pendingAppointments}
          icon={<FaHourglassHalf size={22} />}
          color="orange"
        />
        <StatCard
          title="Completed"
          value={completedAppointments}
          icon={<FaCheckDouble size={22} />}
          color="purple"
        />
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {[
          "All",
          "Today",
          "Pending",
          "Confirmed",
          "Completed",
          "Overdue",
        ].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-xl border transition ${
              filter === item
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            {item} ({
              item === "All"
                ? appointments.length
                : item === "Today"
                ? todayAppointments
                : item === "Overdue"
                ? appointments.filter(
                    (a) => getStatus(a) === "Overdue"
                  ).length
                : appointments.filter(
                    (a) => a.status === item
                  ).length
            })
          </button>
        ))}
      </div>

      {nextAppointment && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">
            Next Appointment
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Patient</p>
              <p className="font-semibold">{nextAppointment.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Time</p>
              <p className="font-semibold">{nextAppointment.time}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Treatment</p>
              <p className="font-semibold">{nextAppointment.treatment}</p>
            </div>
          </div>
        </div>
      )}

      {filteredAppointments.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredAppointments}
        />
      ) : (
        <EmptyState
          title="No Appointments Found"
          description="No appointment matches your search."
        />
      )}
    </div>
  );
}