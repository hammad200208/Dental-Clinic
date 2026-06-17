const getAll = async () => {
  if (!window.api?.getAppointments) return [];
  return await window.api.getAppointments();
};

const getById = async (id) => {
  const appointments = await getAll();
  return appointments.find((a) => a.id === Number(id));
};

const add = async (appointment) => {
  if (!window.api?.addAppointment) return null;
  return await window.api.addAppointment(appointment);
};

const update = async (id, updatedData) => {
  if (!window.api?.updateAppointment) return false;
  return await window.api.updateAppointment({ id: Number(id), ...updatedData });
};

const remove = async (id) => {
  if (!window.api?.deleteAppointment) return false;
  return await window.api.deleteAppointment(Number(id));
};

const updateStatus = async (id, status) => {
  if (!window.api?.updateAppointmentStatus) return false;
  return await window.api.updateAppointmentStatus(Number(id), status);
};

const getByPatientId = async (patientId) => {
  if (!window.api?.getAppointmentsByPatient) return [];
  return await window.api.getAppointmentsByPatient(Number(patientId));
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