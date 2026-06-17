import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase, getDb } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// ========== PATIENTS ==========

ipcMain.handle("patients:get", () => {
  try {
    return getDb().prepare("SELECT * FROM patients ORDER BY id DESC").all();
  } catch (err) {
    console.error("patients:get error", err);
    return [];
  }
});

ipcMain.handle("patients:getById", (_, id) => {
  try {
    const db = getDb();
    const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
    if (!patient) return null;
    const visits = db.prepare("SELECT * FROM visits WHERE patient_id = ? ORDER BY date DESC").all(id);

    const normalizedVisits = visits.map((v) => ({
      id: v.id,
      patientId: v.patient_id,
      treatment: v.treatment,
      notes: v.notes,
      amount: v.amount,
      paidAmount: v.paid_amount,
      nextVisit: v.next_visit,
      date: v.date,
    }));

    return { ...patient, visits: normalizedVisits };
  } catch (err) {
    console.error("patients:getById error", err);
    return null;
  }
});

ipcMain.handle("patients:add", (_, data) => {
  try {
    const result = getDb().prepare(`
      INSERT INTO patients (name, phone, age, gender, problem, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.name, data.phone, data.age, data.gender, data.problem, data.status || "Active");
    return { id: result.lastInsertRowid, ...data };
  } catch (err) {
    console.error("patients:add error", err);
    return null;
  }
});

ipcMain.handle("patients:update", (_, { id, data }) => {
  try {
    getDb().prepare(`
      UPDATE patients SET name=?, phone=?, age=?, gender=?, problem=?, status=? WHERE id=?
    `).run(data.name, data.phone, data.age, data.gender, data.problem, data.status, id);
    return { success: true };
  } catch (err) {
    console.error("patients:update error", err);
    return { success: false };
  }
});

ipcMain.handle("patients:delete", (_, id) => {
  try {
    const db = getDb();
    // delete child rows first to avoid foreign key constraint errors
    db.prepare("DELETE FROM visits WHERE patient_id = ?").run(id);
    db.prepare("DELETE FROM appointments WHERE patient_id = ?").run(id);
    db.prepare("DELETE FROM patients WHERE id = ?").run(id);
    return { success: true };
  } catch (err) {
    console.error("patients:delete error", err);
    return { success: false };
  }
});

// ========== VISITS ==========

ipcMain.handle("visits:add", (_, { patientId, visit }) => {
  try {
    const result = getDb().prepare(`
      INSERT INTO visits (patient_id, treatment, notes, amount, paid_amount, next_visit)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(patientId, visit.treatment, visit.notes, visit.amount, visit.paidAmount, visit.nextVisit);
    return { id: result.lastInsertRowid, ...visit };
  } catch (err) {
    console.error("visits:add error", err);
    return null;
  }
});

ipcMain.handle("visits:delete", (_, visitId) => {
  try {
    getDb().prepare("DELETE FROM visits WHERE id = ?").run(visitId);
    return { success: true };
  } catch (err) {
    console.error("visits:delete error", err);
    return { success: false };
  }
});

ipcMain.handle("visits:getByPatient", (_, patientId) => {
  try {
    return getDb().prepare("SELECT * FROM visits WHERE patient_id = ? ORDER BY date DESC").all(patientId);
  } catch (err) {
    console.error("visits:getByPatient error", err);
    return [];
  }
});

ipcMain.handle("visits:updatePayment", (_, { visitId, amount }) => {
  try {
    const db = getDb();
    const visit = db.prepare("SELECT paid_amount FROM visits WHERE id = ?").get(visitId);
    if (!visit) return { success: false };
    const newPaid = (visit.paid_amount || 0) + amount;
    db.prepare("UPDATE visits SET paid_amount = ? WHERE id = ?").run(newPaid, visitId);
    return { success: true };
  } catch (err) {
    console.error("visits:updatePayment error", err);
    return { success: false };
  }
});

// ========== APPOINTMENTS ==========

ipcMain.handle("getAppointments", () => {
  try {
    return getDb().prepare("SELECT * FROM appointments ORDER BY date, time").all();
  } catch (err) {
    console.error("getAppointments error", err);
    return [];
  }
});

ipcMain.handle("addAppointment", (_, appointment) => {
  try {
    const result = getDb().prepare(`
      INSERT INTO appointments (patient_id, name, phone, treatment, date, time, status)
      VALUES (@patientId, @name, @phone, @treatment, @date, @time, @status)
    `).run(appointment);
    return { id: result.lastInsertRowid, ...appointment };
  } catch (err) {
    console.error("addAppointment error", err);
    return null;
  }
});

ipcMain.handle("updateAppointment", (_, { id, ...data }) => {
  try {
    getDb().prepare(`
      UPDATE appointments SET name=@name, phone=@phone, treatment=@treatment,
      date=@date, time=@time, status=@status WHERE id=@id
    `).run({ id, ...data });
    return true;
  } catch (err) {
    console.error("updateAppointment error", err);
    return false;
  }
});

ipcMain.handle("updateAppointmentStatus", (_, { id, status }) => {
  try {
    getDb().prepare("UPDATE appointments SET status=@status WHERE id=@id").run({ id, status });
    return true;
  } catch (err) {
    console.error("updateAppointmentStatus error", err);
    return false;
  }
});

ipcMain.handle("deleteAppointment", (_, id) => {
  try {
    getDb().prepare("DELETE FROM appointments WHERE id=?").run(id);
    return true;
  } catch (err) {
    console.error("deleteAppointment error", err);
    return false;
  }
});

ipcMain.handle("getAppointmentsByPatient", (_, patientId) => {
  try {
    return getDb().prepare("SELECT * FROM appointments WHERE patient_id=?").all(patientId);
  } catch (err) {
    console.error("getAppointmentsByPatient error", err);
    return [];
  }
});

// ========== BACKUP ==========

ipcMain.handle("backup:export", () => {
  try {
    const db = getDb();
    const patients = db.prepare("SELECT * FROM patients").all();
    const visits = db.prepare("SELECT * FROM visits").all();
    const appointments = db.prepare("SELECT * FROM appointments").all();
    return { patients, visits, appointments };
  } catch (err) {
    console.error("backup:export error", err);
    return null;
  }
});

ipcMain.handle("backup:import", (_, data) => {
  try {
    const db = getDb();

    // clear existing
    db.prepare("DELETE FROM visits").run();
    db.prepare("DELETE FROM appointments").run();
    db.prepare("DELETE FROM patients").run();

    // restore patients
    const insertPatient = db.prepare(`
      INSERT INTO patients (id, name, phone, age, gender, problem, status, created_at)
      VALUES (@id, @name, @phone, @age, @gender, @problem, @status, @created_at)
    `);
    for (const p of data.patients || []) {
      insertPatient.run(p);
    }

    // restore visits
    const insertVisit = db.prepare(`
      INSERT INTO visits (id, patient_id, treatment, notes, amount, paid_amount, next_visit, date)
      VALUES (@id, @patient_id, @treatment, @notes, @amount, @paid_amount, @next_visit, @date)
    `);
    for (const v of data.visits || []) {
      insertVisit.run(v);
    }

    // restore appointments
    const insertAppt = db.prepare(`
      INSERT INTO appointments (id, patient_id, name, phone, treatment, date, time, status, created_at)
      VALUES (@id, @patient_id, @name, @phone, @treatment, @date, @time, @status, @created_at)
    `);
    for (const a of data.appointments || []) {
      insertAppt.run(a);
    }

    return { success: true };
  } catch (err) {
    console.error("backup:import error", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("backup:clear", () => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM visits").run();
    db.prepare("DELETE FROM appointments").run();
    db.prepare("DELETE FROM patients").run();
    return { success: true };
  } catch (err) {
    console.error("backup:clear error", err);
    return { success: false };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  initDatabase();
  createWindow();
});