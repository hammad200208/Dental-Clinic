import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../services/patientServices";
import { settingsService } from "../services/settingsService";

const DEFAULT_INVOICE_DATE = new Date().toLocaleDateString();

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const data = patientService.getPatientInvoice(id);

  if (!data || !data.patient) {
    return <p className="p-6">Invoice not found</p>;
  }

  const { patient, total, paid, pending, invoiceNumber } = data;
  const clinicSettings = settingsService.getSettings();

  const visits = Array.isArray(patient.visits) ? patient.visits : [];
  const invoiceDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString()
    : DEFAULT_INVOICE_DATE;
  const safeTotal = Number(total || 0);
  const safePaid = Number(paid || 0);
  const safePending = Number(pending || 0);

  const invoiceStatus =
    safePending <= 0
      ? "Paid"
      : safePaid > 0
      ? "Partial"
      : "Pending";

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen print:p-0 print:bg-white print:text-black">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition print:hidden"
      >
        ← Back
      </button>

      {/* Invoice Container */}
      <div className="bg-white border rounded-2xl shadow-sm print:border-none print:shadow-none">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              {clinicSettings.logo ? (
                <img
                  src={clinicSettings.logo}
                  alt={`${clinicSettings.clinicName} Logo`}
                  className="h-16 w-auto mb-4 rounded-xl object-contain"
                />
              ) : (
                <div className="h-16 w-16 mb-4 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
                  Logo
                </div>
              )}

              <h1 className="text-3xl font-bold text-slate-800">
                {clinicSettings.clinicName}
              </h1>

              {clinicSettings.dentistName && (
                <p className="text-slate-500 mt-1">
                  {clinicSettings.dentistName}
                </p>
              )}

              <p className="text-slate-500 mt-1">
                Phone: {clinicSettings.phone}
              </p>

              <p className="text-slate-500">
                {clinicSettings.address}
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-bold tracking-wider text-slate-800">
                INVOICE
              </h2>

              <span
                className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold ${
                  invoiceStatus === "Paid"
                    ? "bg-green-100 text-green-700"
                    : invoiceStatus === "Partial"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {invoiceStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-4">
              <p className="text-sm text-slate-500">Invoice No</p>
              <p className="font-semibold">{invoiceNumber}</p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm text-slate-500">Issue Date</p>
              <p className="font-semibold">{invoiceDate}</p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm text-slate-500">Patient ID</p>
              <p className="font-semibold">{patient.id}</p>
            </div>
          </div>

          {/* Patient Information */}
          <div className="border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">
              Patient Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <strong>Name:</strong> {patient.name}
              </p>

              <p>
                <strong>Phone:</strong> {patient.phone || "N/A"}
              </p>

              <p>
                <strong>Age:</strong> {patient.age || "N/A"}
              </p>

              <p>
                <strong>Problem:</strong> {patient.problem || "N/A"}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Financial Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-xl p-5">
                <p className="text-sm text-slate-500">Total Amount</p>
                <p className="text-2xl font-bold text-slate-800">
                  {clinicSettings.currency} {safeTotal.toLocaleString()}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-sm text-slate-500">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {clinicSettings.currency} {safePaid.toLocaleString()}
                </p>
              </div>

              <div className="border rounded-xl p-5">
                <p className="text-sm text-slate-500">Pending Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  {clinicSettings.currency} {safePending.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Treatment Details Table */}
          <div className="border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">
                Treatment Details
              </h3>
            </div>

            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-full print:table-fixed">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Treatment
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Date
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      Amount
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      Paid
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      Balance
                    </th>

                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visits.length > 0 ? (
                    visits.map((visit, index) => {
                      const amount = Number(
                        visit.amount ?? visit.cost ?? 0
                      );

                      const paidAmount = Number(
                        visit.paidAmount ?? visit.paid ?? 0
                      );

                      const balance = amount - paidAmount;

                      const status =
                        balance <= 0
                          ? "Paid"
                          : paidAmount > 0
                          ? "Partial"
                          : "Pending";

                      return (
                        <tr
                          key={visit.id || index}
                          className="border-t hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-medium">
                            {visit.treatment}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {visit.date
                              ? new Date(
                                  visit.date
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {clinicSettings.currency} {amount.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-right text-green-600 font-medium">
                            {clinicSettings.currency} {paidAmount.toLocaleString()}
                          </td>

                          <td
                            className={`px-4 py-3 text-right font-medium ${
                              balance > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {clinicSettings.currency} {balance.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                status === "Paid"
                                  ? "bg-green-100 text-green-700"
                                  : status === "Partial"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-8 text-slate-500"
                      >
                        No treatment records available for this patient.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extra Summary */}
          <div className="border rounded-xl p-5">
            <div className="flex justify-between">
              <span className="font-medium">
                Total Treatments
              </span>

              <span className="font-semibold">
                {visits.length}
              </span>
            </div>
          </div>

          <div className="border rounded-xl p-5 bg-slate-50 print:bg-white">
            <h3 className="text-lg font-semibold mb-4">
              Signature
            </h3>
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">Dentist Signature</p>
              {clinicSettings.dentistName && (
                <p className="font-semibold mt-2">
                  {clinicSettings.dentistName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          Print / Download Invoice
        </button>
      </div>
    </div>
  );
}