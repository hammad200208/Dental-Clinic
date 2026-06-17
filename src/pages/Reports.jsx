import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaFileInvoiceDollar } from "react-icons/fa";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import { patientService } from "../services/patientServices";

export default function Reports() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await patientService.getAll();
      // getAll returns patients without visits — fetch each with visits
      const full = await Promise.all(all.map((p) => patientService.getById(p.id)));
      setPatients(full.filter(Boolean));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading reports...</div>;

  // =========================
  // FLATTEN VISITS
  // =========================
  const visits = patients.flatMap((patient) =>
    (patient.visits || []).map((visit) => ({
      ...visit,
      patientName: patient.name,
    }))
  );

  // =========================
  // FINANCIALS
  // =========================
  const totalRevenue = visits.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const totalCollected = visits.reduce((sum, v) => sum + (Number(v.paidAmount) || 0), 0);
  const totalPending = totalRevenue - totalCollected;

  // =========================
  // MONTHLY REVENUE
  // =========================
  const now = new Date();
  const thisMonthRevenue = visits
    .filter((v) => {
      const d = new Date(v.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

  // =========================
  // TOP DEBTORS
  // =========================
  const topDebtors = patients
    .map((p) => {
      const v = p.visits || [];
      const total = v.reduce((sum, x) => sum + (Number(x.amount) || 0), 0);
      const paid = v.reduce((sum, x) => sum + (Number(x.paidAmount) || 0), 0);
      return { name: p.name, balance: total - paid };
    })
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // =========================
  // RECENT PAYMENTS
  // =========================
  const recentPayments = visits
    .filter((v) => Number(v.paidAmount) > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // =========================
  // TREATMENT STATS
  // =========================
  const treatmentMap = {};
  visits.forEach((v) => {
    const t = v.treatment || "Other";
    treatmentMap[t] = (treatmentMap[t] || 0) + 1;
  });
  const topTreatments = Object.entries(treatmentMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Financial overview" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} icon={<FaMoneyBillWave size={22} />} color="green" />
        <StatCard title="Collected" value={`Rs. ${totalCollected.toLocaleString()}`} icon={<FaFileInvoiceDollar size={22} />} color="blue" />
        <StatCard title="Pending" value={`Rs. ${totalPending.toLocaleString()}`} icon={<FaMoneyBillWave size={22} />} color="orange" />
        <StatCard title="This Month" value={`Rs. ${thisMonthRevenue.toLocaleString()}`} icon={<FaMoneyBillWave size={22} />} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TOP DEBTORS */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Debtors</h3>
          <div className="space-y-2">
            {topDebtors.length === 0 ? (
              <p className="text-slate-500 text-sm">No outstanding balances</p>
            ) : (
              topDebtors.map((p, i) => (
                <div key={i} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="font-semibold text-red-600">Rs. {p.balance.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT PAYMENTS */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
          <div className="space-y-2">
            {recentPayments.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent payments</p>
            ) : (
              recentPayments.map((v, i) => (
                <div key={i} className="flex justify-between">
                  <span>{v.patientName}</span>
                  <span className="text-green-600 font-semibold">Rs. {Number(v.paidAmount).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TREATMENTS */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Treatments</h3>
          <div className="space-y-2">
            {topTreatments.length === 0 ? (
              <p className="text-slate-500 text-sm">No treatment data</p>
            ) : (
              topTreatments.map((t, i) => (
                <div key={i} className="flex justify-between">
                  <span>{t.name}</span>
                  <span className="font-semibold">{t.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}