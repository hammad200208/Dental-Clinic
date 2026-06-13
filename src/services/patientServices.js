const STORAGE_KEY = "dental_patients";

/**
 * Get all patients (with safe normalization)
 */
const getAll = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  const patients = data ? JSON.parse(data) : [];

  return patients.map((p) => ({
    id: p.id,
    name: p.name || "",
    phone: p.phone || "",
    age: p.age || "",
    problem: p.problem || "",
    status: p.status || "Active",
    createdAt: p.createdAt || new Date().toISOString(),
    visits: (p.visits || []).map((v) => ({
      ...v,
      // optional cleanup (ignore old pendingAmount if exists)
      pendingAmount: undefined,
    })),
  }));
};

/**
 * Save all patients
 */
const saveAll = (patients) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};

/**
 * Add new patient
 */
const add = (patient) => {
  const patients = getAll();

  const newPatient = {
    id: Date.now(),
    name: patient.name || "",
    phone: patient.phone || "",
    age: patient.age || "",
    problem: patient.problem || "",
    status: "Active",
    createdAt: new Date().toISOString(),
    visits: [],
  };

  patients.push(newPatient);
  saveAll(patients);

  return newPatient;
};

/**
 * Remove patient
 */
const remove = (id) => {
  const patients = getAll();
  const updated = patients.filter((p) => p.id !== id);
  saveAll(updated);
};

/**
 * Get single patient
 */
const getById = (id) => {
  const patients = getAll();
  return patients.find((p) => p.id === Number(id));
};

/**
 * Add visit (FIXED - no pendingAmount stored)
 */
const addVisit = (patientId, visitData) => {
  const patients = getAll();

  const updatedPatients = patients.map((patient) => {
    if (patient.id === Number(patientId)) {
      const amount = Number(visitData.amount) || 0;

      const paidAmount = Math.min(
        Number(visitData.paidAmount) || 0,
        amount
      );

      const newVisit = {
        id: Date.now(),
        treatment: visitData.treatment || "",
        notes: visitData.notes || "",
        amount,
        paidAmount,
        date: visitData.date || new Date().toISOString(),
        nextVisit: visitData.nextVisit || null,
      };

      return {
        ...patient,
        visits: [...(patient.visits || []), newVisit],
      };
    }

    return patient;
  });

  saveAll(updatedPatients);
};

/**
 * Update patient
 */
const updatePatient = (id, updatedData) => {
  const patients = getAll();

  const updatedPatients = patients.map((patient) => {
    if (patient.id === Number(id)) {
      return {
        ...patient,
        ...updatedData,
      };
    }

    return patient;
  });

  saveAll(updatedPatients);
};

/**
 * Delete visit
 */
const deleteVisit = (patientId, visitId) => {
  const patients = getAll();

  const updatedPatients = patients.map((patient) => {
    if (patient.id === Number(patientId)) {
      return {
        ...patient,
        visits: (patient.visits || []).filter(
          (v) => v.id !== visitId
        ),
      };
    }

    return patient;
  });

  saveAll(updatedPatients);
};

/**
 * Shared billing calculator (FIXED)
 */
const calculateBill = (visits = []) => {
  let total = 0;
  let paid = 0;
  let pending = 0;

  visits.forEach((v) => {
    const amount = v.amount ?? 0;
    const paidAmount = v.paidAmount ?? 0;

    total += amount;
    paid += paidAmount;
    pending += Math.max(0, amount - paidAmount);
  });

  return {
    total,
    paid,
    pending,
  };
};

/**
 * Revenue (ALL PATIENTS) (FIXED)
 */
const getRevenue = () => {
  const patients = getAll();

  let total = 0;
  let paid = 0;
  let pending = 0;

  patients.forEach((patient) => {
    (patient.visits || []).forEach((v) => {
      const amount = v.amount ?? 0;
      const paidAmount = v.paidAmount ?? 0;

      total += amount;
      paid += paidAmount;
      pending += Math.max(0, amount - paidAmount);
    });
  });

  return {
    total,
    paid,
    pending,
  };
};

/**
 * Single patient bill
 */
const getPatientBill = (patientId) => {
  const patient = getById(patientId);

  if (!patient) return null;

  return calculateBill(patient.visits || []);
};

/**
 * Patient invoice (FIXED)
 */
const getPatientInvoice = (patientId) => {
  const patient = getById(patientId);

  if (!patient) return null;

  let total = 0;
  let paid = 0;
  let pending = 0;

  (patient.visits || []).forEach((v) => {
    const amount = v.amount ?? 0;
    const paidAmount = v.paidAmount ?? 0;

    total += amount;
    paid += paidAmount;
    pending += Math.max(0, amount - paidAmount);
  });

  return {
    patient,
    total,
    paid,
    pending,
    invoiceNumber: `INV-${patientId}-${Date.now().toString().slice(-6)}`,
  };
};

const collectPayment = (
  patientId,
  visitId,
  paymentAmount
) => {
  const patients = getAll();

  const updatedPatients = patients.map((patient) => {
    if (patient.id !== Number(patientId)) {
      return patient;
    }

    return {
      ...patient,
      visits: (patient.visits || []).map((visit) => {
        if (visit.id !== visitId) {
          return visit;
        }

        const currentPaid =
          Number(visit.paidAmount) || 0;

        const amount =
          Number(visit.amount) || 0;

        const maxPayment =
          amount - currentPaid;

        const safePayment = Math.min(
          Number(paymentAmount),
          maxPayment
        );

        return {
          ...visit,
          paidAmount:
            currentPaid + safePayment,
        };
      }),
    };
  });

  saveAll(updatedPatients);

  return true;
};

/**
 * Export service
 */
export const patientService = {
  getAll,
  saveAll,
  add,
  remove,
  getById,
  addVisit,
  updatePatient,
  deleteVisit,
  getRevenue,
  getPatientBill,
  getPatientInvoice,
  collectPayment,
};