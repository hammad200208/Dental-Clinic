import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import AddPatient from "./pages/AddPatient";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import PatientDetails from "./pages/PatientDetails";
import EditPatient from "./pages/EditPatient";
import Invoice from "./pages/Invoice";
import NewAppointment from "./pages/NewAppointment";
import EditAppointment from "./pages/EditAppointment";
import AppointmentDetails from "./pages/AppointmentDetails";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/new" element={<AddPatient />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
        <Route path="/patients/:id/edit" element={<EditPatient />} />
        <Route path="/patients/:id/invoice" element={<Invoice />} />
        <Route path="/appointments/new" element={<NewAppointment />} />
        <Route path="/appointments/edit/:id" element={<EditAppointment />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />
        <Route path="/reports" element={<Reports />} />

      </Routes>
    </AppLayout>
  );
}