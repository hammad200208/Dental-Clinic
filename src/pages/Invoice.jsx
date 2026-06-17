import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPhone, FiMapPin, FiPrinter } from "react-icons/fi";
import { patientService } from "../services/patientServices";
import { settingsService } from "../services/settingsService";

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await patientService.getPatientInvoice(id);
      setData(result);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="p-6 text-slate-400">Loading invoice...</div>;
  if (!data || !data.patient) return <p className="p-6">Invoice not found</p>;

  const { patient, total, paid, pending, invoiceNumber } = data;
  const clinicSettings = settingsService.getSettings();
  const visits = Array.isArray(patient.visits) ? patient.visits : [];

  const invoiceDate = patient.created_at
    ? new Date(patient.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  const safeTotal = Number(total || 0);
  const safePaid = Number(paid || 0);
  const safePending = Number(pending || 0);
  const invoiceStatus = safePending <= 0 ? "Paid" : safePaid > 0 ? "Partial" : "Pending";

  const statusClass = {
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-yellow-100 text-yellow-700",
    Pending: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 space-y-4 bg-slate-50 print:p-0 print:bg-white">

      {/* Screen-only buttons */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPrinter size={20} /> Print / Save PDF
        </button>
      </div>

      {/* Invoice print container */}
      <div className="invoice-print-container">
        {/* Invoice card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:rounded-none print:w-full">

          {/* Header */}
          <div className="p-8 border-b-2 border-blue-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">

            {/* Clinic info */}
            <div>
              {clinicSettings.logo ? (
                <img src={clinicSettings.logo} alt="Logo" className="h-14 w-auto mb-3 rounded-xl object-contain" />
              ) : (
                <div className="h-14 w-14 mb-3 rounded-xl bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-500">
                  LOGO
                </div>
              )}
              <h1 className="text-2xl font-bold text-slate-800">{clinicSettings.clinicName}</h1>
              {clinicSettings.dentistName && <p className="text-slate-500 mt-1">{clinicSettings.dentistName}</p>}
              {clinicSettings.phone && <p className="text-slate-500 mt-1 flex items-center gap-2"><FiPhone size={16} /> {clinicSettings.phone}</p>}
              {clinicSettings.address && <p className="text-slate-500 mt-1 flex items-center gap-2"><FiMapPin size={16} /> {clinicSettings.address}</p>}
            </div>

            {/* Invoice badge */}
            <div className="text-right">
              <h2 className="text-3xl font-extrabold tracking-widest text-blue-700">INVOICE</h2>
              <p className="text-slate-500 mt-1 text-sm">#{invoiceNumber}</p>
              <p className="text-slate-500 text-sm">{invoiceDate}</p>
              <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-bold ${statusClass[invoiceStatus]}`}>
                {invoiceStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* Patient info */}
          <div className="bg-slate-50 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Patient Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p><span className="text-slate-500">Name: </span><span className="font-semibold">{patient.name}</span></p>
              <p><span className="text-slate-500">Phone: </span><span className="font-semibold">{patient.phone || "N/A"}</span></p>
              <p><span className="text-slate-500">Age: </span><span className="font-semibold">{patient.age || "N/A"}</span></p>
              <p><span className="text-slate-500">Problem: </span><span className="font-semibold">{patient.problem || "N/A"}</span></p>
            </div>
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-400 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-slate-800">{clinicSettings.currency} {safeTotal.toLocaleString()}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-400 mb-1">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">{clinicSettings.currency} {safePaid.toLocaleString()}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-400 mb-1">Pending Amount</p>
              <p className="text-2xl font-bold text-red-600">{clinicSettings.currency} {safePending.toLocaleString()}</p>
            </div>
          </div>

          {/* Treatment table */}
          <div>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Treatment Details</p>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Treatment</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 text-right font-semibold">Paid</th>
                    <th className="px-4 py-3 text-right font-semibold">Balance</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">No treatment records</td>
                    </tr>
                  ) : visits.map((visit, i) => {
                    const amt = Number(visit.amount || 0);
                    const pd = Number(visit.paidAmount || 0);
                    const bal = amt - pd;
                    const st = bal <= 0 ? "Paid" : pd > 0 ? "Partial" : "Pending";

                    return (
                      <tr key={visit.id || i} className={`border-t border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                        <td className="px-4 py-3 font-semibold">{visit.treatment}</td>
                        <td className="px-4 py-3 text-slate-500">{visit.date ? new Date(visit.date).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-3 text-right">{clinicSettings.currency} {amt.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-semibold">{clinicSettings.currency} {pd.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${bal > 0 ? "text-red-600" : "text-green-600"}`}>
                          {clinicSettings.currency} {bal.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass[st]}`}>{st}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-blue-50 font-semibold border-t-2 border-blue-200">
                  <tr>
                    <td colSpan={2} className="px-4 py-3">Total Treatments: {visits.length}</td>
                    <td className="px-4 py-3 text-right">{clinicSettings.currency} {safeTotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-600">{clinicSettings.currency} {safePaid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-600">{clinicSettings.currency} {safePending.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Signature */}
          <div className="flex justify-end pt-4">
            <div className="text-center min-w-48">
              <div className="mt-12 border-t-2 border-slate-800 pt-2">
                <p className="text-xs text-slate-400">Authorized Signature</p>
                {clinicSettings.dentistName && (
                  <p className="font-semibold mt-1">{clinicSettings.dentistName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-400 text-xs border-t border-slate-100 pt-4">
            Thank you for choosing {clinicSettings.clinicName}. Please keep this invoice for your records.
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}