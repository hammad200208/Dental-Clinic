import { FaUsers, FaCalendarCheck, FaMoneyBillWave } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { patientService } from "../services/patientServices";
import { appointmentService } from "../services/appointmentService";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // ✅ FIX 1: getAll() has no visits — fetch each patient with visits
      const all = await patientService.getAll();
      const full = await Promise.all(all.map((p) => patientService.getById(p.id)));
      setPatients(full.filter(Boolean));

      // ✅ FIX 2: appointmentService.getAll() is async — must await
      const appts = await appointmentService.getAll();
      setAllAppointments(Array.isArray(appts) ? appts : []);
    };
    loadData();
  }, []);

  // ✅ FIX 3: refreshAppointments must be async
  const refreshAppointments = async () => {
    const data = await appointmentService.getAll();
    setAllAppointments(Array.isArray(data) ? data : []);
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  // =========================
  // 📊 BASIC STATS
  // =========================
  let totalVisits = 0;
  let todayIncome = 0;

  patients.forEach((patient) => {
    (patient.visits || []).forEach((visit) => {
      totalVisits++;
      const visitDate = new Date(visit.date).toLocaleDateString("en-CA");
      if (visitDate === todayStr) {
        todayIncome += Number(visit.paidAmount || 0);
      }
    });
  });

  // =========================
  // 💰 OUTSTANDING BALANCE
  // =========================
  const totalPending = patients.reduce((sum, patient) => {
    const visits = patient.visits || [];
    const total = visits.reduce((s, v) => s + (Number(v.amount) || 0), 0);
    const paid = visits.reduce((s, v) => s + (Number(v.paidAmount) || 0), 0);
    return sum + (total - paid);
  }, 0);

  // =========================
  // 📅 TODAY APPOINTMENTS
  // =========================
  const todayAppointments = allAppointments.filter(
    (a) => new Date(a.date).toLocaleDateString("en-CA") === todayStr
  );

  const pending = todayAppointments.filter((a) => a.status === "Pending");
  const confirmed = todayAppointments.filter((a) => a.status === "Confirmed");
  const completed = todayAppointments.filter((a) => a.status === "Completed");

  const nextAppointment = [...todayAppointments]
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  // =========================
  // 📈 MONTHLY REVENUE
  // =========================
  const monthlyRevenue = {};
  patients.forEach((patient) => {
    (patient.visits || []).forEach((visit) => {
      const month = new Date(visit.date).toLocaleString("default", { month: "short" });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(visit.paidAmount || 0);
    });
  });

  const revenueChartData = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ].map((m) => ({ month: m, revenue: monthlyRevenue[m] || 0 }));

  // =========================
  // 📊 APPOINTMENT STATUS CHART
  // =========================
  const appointmentStatus = { Pending: 0, Confirmed: 0, Completed: 0 };
  allAppointments.forEach((a) => {
    if (appointmentStatus[a.status] !== undefined) {
      appointmentStatus[a.status]++;
    }
  });
  const appointmentChartData = Object.keys(appointmentStatus).map((key) => ({
    status: key,
    count: appointmentStatus[key],
  }));

  // =========================
  // 📊 STATS CARDS
  // =========================
  const stats = [
    { title: "Total Patients", value: patients.length, icon: <FaUsers size={22} />, color: "blue" },
    { title: "Total Visits", value: totalVisits, icon: <FaCalendarCheck size={22} />, color: "green" },
    { title: "Today's Income", value: `Rs. ${todayIncome}`, icon: <FaMoneyBillWave size={22} />, color: "purple" },
    { title: "Outstanding Balance", value: `Rs. ${totalPending}`, icon: <FaMoneyBillWave size={22} />, color: "orange" },
  ];

  // =========================
  // 📅 UPCOMING VISITS
  // =========================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingVisits = patients
    .flatMap((patient) =>
      (patient.visits || [])
        .filter((visit) => visit.nextVisit)
        .map((visit) => ({
          patientName: patient.name,
          nextVisit: new Date(visit.nextVisit),
          treatment: visit.treatment,
        }))
    )
    .filter((visit) => visit.nextVisit >= today)
    .sort((a, b) => a.nextVisit - b.nextVisit)
    .slice(0, 5);

  // =========================
  // 💰 TOP DEBTORS
  // =========================
  const topDebtors = patients
    .map((p) => {
      const visits = p.visits || [];
      const total = visits.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
      const paid = visits.reduce((sum, v) => sum + (Number(v.paidAmount) || 0), 0);
      return { name: p.name, balance: total - paid };
    })
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Live clinic analytics system" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item, index) => (
          <StatCard key={index} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Appointment Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentChartData}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">🗓️ Today's Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ["Pending", pending, "Confirmed"],
              ["Confirmed", confirmed, "Completed"],
              ["Completed", completed, null],
            ].map(([label, list, nextStatus], i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl border">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs">{list.length}</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-sm text-slate-500">No {label}</p>
                ) : (
                  list.map((a) => (
                    <div key={a.id} className="mb-3 border p-3 rounded-xl">
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-xs text-slate-500">{a.time}</div>
                      {nextStatus && (
                        // ✅ FIX 4: async onClick
                        <button
                          onClick={async () => {
                            await appointmentService.updateStatus(a.id, nextStatus);
                            await refreshAppointments();
                          }}
                          className="mt-2 text-xs bg-blue-100 px-2 py-1 rounded"
                        >
                          {nextStatus === "Confirmed" ? "Confirm" : "Mark Done"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Next Appointment</h2>
            {!nextAppointment ? (
              <p className="text-sm text-slate-500">No appointments today</p>
            ) : (
              <div className="border p-3 rounded-xl">
                <p className="font-medium">{nextAppointment.name}</p>
                <p className="text-sm text-slate-500">{nextAppointment.time}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Upcoming Visits</h2>
            {upcomingVisits.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming visits</p>
            ) : (
              upcomingVisits.map((v, i) => (
                <div key={i} className="border p-3 rounded-xl mb-2">
                  <p className="font-medium">{v.patientName}</p>
                  <p className="text-sm text-slate-500">{v.treatment}</p>
                  <p className="text-sm text-blue-600">{v.nextVisit.toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Pending Payments</h2>
            {topDebtors.length === 0 ? (
              <p className="text-sm text-slate-500">No pending payments</p>
            ) : (
              topDebtors.map((p, i) => (
                <div key={i} className="flex justify-between text-sm mb-2">
                  <span>{p.name}</span>
                  <span className="text-red-600 font-medium">Rs. {p.balance}</span>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button onClick={() => navigate("/patients/new")} className="w-full bg-blue-600 text-white py-3 rounded-xl">Add Patient</button>
              <button onClick={() => navigate("/appointments/new")} className="w-full bg-green-600 text-white py-3 rounded-xl">New Appointment</button>
              <button onClick={() => navigate("/patients")} className="w-full bg-purple-600 text-white py-3 rounded-xl">Create Invoice</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}