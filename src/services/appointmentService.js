const STORAGE_KEY = "dental_appointments";

import { patientService } from "./patientServices";

/**
 * Get all appointments
 */
const getAll = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Save all appointments
 */
const saveAll = (appointments) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(appointments)
  );
};

/**
 * Add appointment
 */
const add = (appointment) => {
  const appointments = getAll();

  const patient = patientService.getById(
    appointment.patientId
  );

  const newAppointment = {
    id: Date.now(),

    patientId: appointment.patientId,

    name: patient?.name || "",
    phone: patient?.phone || "",

    treatment: appointment.treatment || "",
    date: appointment.date || "",
    time: appointment.time || "",

    status: appointment.status || "Pending",

    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);

  saveAll(appointments);

  return newAppointment;
};

/**
 * Get appointment by ID
 */
const getById = (id) => {
  const appointments = getAll();

  return appointments.find(
    (a) => a.id === Number(id)
  );
};

/**
 * Update appointment
 */
const update = (id, updatedData) => {
  const appointments = getAll();

  const updated = appointments.map((a) =>
    a.id === Number(id)
      ? {
          ...a,
          ...updatedData,
        }
      : a
  );

  saveAll(updated);
};

/**
 * Remove appointment
 */
const remove = (id) => {
  const appointments = getAll();

  const updated = appointments.filter(
    (a) => a.id !== Number(id)
  );

  saveAll(updated);
};

const updateStatus = (id, status) => {
  const appointments = getAll();

  const updated = appointments.map((a) =>
    a.id === Number(id)
      ? { ...a, status }
      : a
  );

  saveAll(updated);
};

const getByPatientId = (patientId) => {
  const appointments = getAll();

  return appointments.filter(
    (a) => a.patientId === Number(patientId)
  );
};

export const appointmentService = {
  getAll,
  getById,
  add,
  update,
  remove,
  updateStatus,
  getByPatientId,
};