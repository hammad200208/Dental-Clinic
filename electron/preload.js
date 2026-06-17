const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Patients
  getPatients: () => ipcRenderer.invoke("patients:get"),
  getPatientById: (id) => ipcRenderer.invoke("patients:getById", id),
  addPatient: (data) => ipcRenderer.invoke("patients:add", data),
  updatePatient: (id, data) => ipcRenderer.invoke("patients:update", { id, data }),
  deletePatient: (id) => ipcRenderer.invoke("patients:delete", id),

  // Visits
  addVisit: (patientId, visit) => ipcRenderer.invoke("visits:add", { patientId, visit }),
  deleteVisit: (visitId) => ipcRenderer.invoke("visits:delete", visitId),
  getVisitsByPatient: (patientId) => ipcRenderer.invoke("visits:getByPatient", patientId),
  updateVisitPayment: (visitId, amount) => ipcRenderer.invoke("visits:updatePayment", { visitId, amount }),

  // Appointments
  getAppointments: () => ipcRenderer.invoke("getAppointments"),
  addAppointment: (a) => ipcRenderer.invoke("addAppointment", a),
  updateAppointment: (data) => ipcRenderer.invoke("updateAppointment", data),
  updateAppointmentStatus: (id, status) => ipcRenderer.invoke("updateAppointmentStatus", { id, status }),
  deleteAppointment: (id) => ipcRenderer.invoke("deleteAppointment", id),
  getAppointmentsByPatient: (patientId) => ipcRenderer.invoke("getAppointmentsByPatient", patientId),

  // Backup
  exportBackup: () => ipcRenderer.invoke("backup:export"),
  importBackup: (data) => ipcRenderer.invoke("backup:import", data),
  clearAllData: () => ipcRenderer.invoke("backup:clear"),
});