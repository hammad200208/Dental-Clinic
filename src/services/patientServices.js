const getAll = async () => {
  if (!window.api?.getPatients) return [];
  return await window.api.getPatients();
};

const getById = async (id) => {
  if (!window.api?.getPatientById) return null;
  return await window.api.getPatientById(Number(id));
};

const add = async (patient) => {
  if (!window.api?.addPatient) return null;
  return await window.api.addPatient(patient);
};

const remove = async (id) => {
  if (!window.api?.deletePatient) return false;
  return await window.api.deletePatient(Number(id));
};

const updatePatient = async (id, data) => {
  if (!window.api?.updatePatient) return false;
  return await window.api.updatePatient(Number(id), data);
};

const addVisit = async (patientId, visit) => {
  if (!window.api?.addVisit) return null;
  return await window.api.addVisit(Number(patientId), visit);
};

const deleteVisit = async (visitId) => {
  if (!window.api?.deleteVisit) return false;
  return await window.api.deleteVisit(Number(visitId));
};

const getVisitsByPatient = async (patientId) => {
  if (!window.api?.getVisitsByPatient) return [];
  return await window.api.getVisitsByPatient(Number(patientId));
};

const collectPayment = async (patientId, visitId, amount) => {
  if (!window.api?.updateVisitPayment) return false;
  return await window.api.updateVisitPayment(Number(visitId), amount);
};

// Used by Invoice.jsx — returns patient + computed totals
const getPatientInvoice = async (id) => {
  const patient = await getById(id);
  if (!patient) return null;

  const visits = Array.isArray(patient.visits) ? patient.visits : [];

  const total = visits.reduce((sum, v) => sum + (Number(v.amount) || 0), 0);
  const paid = visits.reduce((sum, v) => sum + (Number(v.paidAmount) || 0), 0);
  const pending = total - paid;

  return {
    patient,
    total,
    paid,
    pending,
    invoiceNumber: `INV-${String(patient.id).padStart(4, "0")}`,
    createdAt: patient.created_at,
  };
};

export const patientService = {
  getAll,
  getById,
  add,
  remove,
  updatePatient,
  addVisit,
  deleteVisit,
  getVisitsByPatient,
  collectPayment,
  getPatientInvoice,
};