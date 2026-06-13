import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { patientService } from "../services/patientServices";

import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import DataTable from "../components/ui/DataTable";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

export default function Billing() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const navigate = useNavigate();

  const patients = patientService.getAll();

  const invoices = patients.flatMap((patient) =>
    (patient.visits || []).map((visit) => {
      const amount = Number(visit.amount) || 0;
      const paidAmount = Number(visit.paidAmount) || 0;
      const balance = amount - paidAmount;

      const status =
        balance <= 0
          ? "Paid"
          : paidAmount > 0
          ? "Partial"
          : "Pending";

      return {
        id: `INV-${visit.id}`,
        visitId: visit.id,
        patientId: patient.id,
        patient: patient.name || "Unknown",
        treatment: visit.treatment || "-",
        amount,
        paidAmount,
        balance,
        status,
        date: visit.date
          ? new Date(visit.date).toLocaleDateString("en-CA")
          : "",
      };
    })
  );

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPending = invoices
    .filter((inv) => inv.balance > 0)
    .reduce((sum, inv) => sum + inv.balance, 0);
  const invoiceCount = invoices.length;

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.patient.toLowerCase().includes(search.toLowerCase()) ||
      invoice.id.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ? true : invoice.status === filter;

    return matchesSearch && matchesFilter;
  });

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount("");
  };

  const handleCollectPayment = () => {
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    if (amount > selectedInvoice.balance) {
      alert(
        `Maximum payment allowed is Rs. ${selectedInvoice.balance}`
      );
      return;
    }

    

    patientService.collectPayment(
      selectedInvoice.patientId,
      selectedInvoice.visitId,
      amount
    );

    setSelectedInvoice(null);

    window.location.reload();
  };

  const columns = [
    {
      key: "id",
      label: "Invoice #",
    },
    {
      key: "patient",
      label: "Patient",
    },
    {
      key: "treatment",
      label: "Treatment",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => `Rs. ${row.amount.toLocaleString()}`,
    },
    {
      key: "paidAmount",
      label: "Paid",
      render: (row) => (
        <span className="text-green-600 font-medium">
          Rs. {row.paidAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      render: (row) => (
        <span
          className={`${
            row.balance > 0
              ? "text-red-600 font-medium"
              : "text-green-600 font-medium"
          }`}
        >
          Rs. {row.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "date",
      label: "Date",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate(
                `/patients/${row.patientId}/invoice`
              )
            }
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg"
          >
            View
          </button>

          {row.balance > 0 && (
            <button
              onClick={() =>
                openPaymentModal(row)
              }
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg"
            >
              Collect
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        subtitle="Manage invoices and payments"
        action={
          <button
            onClick={() => navigate("/patients")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            <FaPlus />
            New Invoice
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          icon={<span className="text-2xl">₹</span>}
          color="blue"
        />
        <StatCard
          title="Paid Amount"
          value={`Rs. ${totalPaid.toLocaleString()}`}
          icon={<span className="text-2xl">✓</span>}
          color="green"
        />
        <StatCard
          title="Pending Amount"
          value={`Rs. ${totalPending.toLocaleString()}`}
          icon={<span className="text-2xl">⏳</span>}
          color="orange"
        />
        <StatCard
          title="Invoices"
          value={invoiceCount}
          icon={<span className="text-2xl">#</span>}
          color="purple"
        />
      </div>

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search invoice or patient..."
      />

      <div className="flex flex-wrap gap-3 mt-4">
        {['All', 'Paid', 'Partial', 'Pending'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-xl border transition ${
              filter === item
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item} ({
              item === 'All'
                ? invoices.length
                : invoices.filter((i) => i.status === item).length
            })
          </button>
        ))}
      </div>

      {filteredInvoices.length ? (
        <DataTable
          columns={columns}
          data={filteredInvoices}
        />
      ) : (
        <EmptyState
          title="No Invoices Found"
          description="No invoice matches your search."
        />
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Collect Payment
            </h2>

            <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
              <p className="text-sm">
                <span className="font-medium">Patient:</span>{" "}
                {selectedInvoice.patient}
              </p>

              <p className="text-sm">
                <span className="font-medium">Treatment:</span>{" "}
                {selectedInvoice.treatment}
              </p>

              <div className="border-t border-slate-200 pt-3 mt-3 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Total Amount:</span>
                  {" "}Rs.{" "}
                  {selectedInvoice.amount.toLocaleString()}
                </p>

                <p className="text-sm text-green-600">
                  <span className="font-medium">Already Paid:</span>
                  {" "}Rs.{" "}
                  {selectedInvoice.paidAmount.toLocaleString()}
                </p>

                <p className="text-sm font-semibold text-red-600">
                  <span className="font-medium">Remaining Balance:</span>
                  {" "}Rs.{" "}
                  {selectedInvoice.balance.toLocaleString()}
                </p>
              </div>
            </div>

            <input
              type="number"
              value={paymentAmount}
              onChange={(e) =>
                setPaymentAmount(e.target.value)
              }
              placeholder="Enter payment amount"
              min="0"
              max={selectedInvoice.balance}
              className="w-full border rounded-xl p-3 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setSelectedInvoice(null)
                }
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCollectPayment}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}