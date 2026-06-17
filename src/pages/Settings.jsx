import { FaSave } from "react-icons/fa";
import { useState } from "react";
import { settingsService } from "../services/settingsService";
import PageHeader from "../components/ui/PageHeader";

export default function Settings() {
  const [settings, setSettings] = useState(settingsService.getSettings());

  const handleSubmit = (e) => {
    e.preventDefault();
    settingsService.saveSettings(settings);
    alert("Settings saved successfully");
  };

  // =========================
  // 📦 EXPORT BACKUP
  // =========================
  const handleExport = async () => {
    if (!window.api?.exportBackup) {
      alert("Export not available in browser mode.");
      return;
    }

    const data = await window.api.exportBackup();
    if (!data) {
      alert("Export failed.");
      return;
    }

    // include settings in backup
    data.settings = settingsService.getSettings();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dental-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =========================
  // 📥 IMPORT BACKUP
  // =========================
  const handleImport = (e) => {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (!data.patients || !data.appointments) {
          alert("Invalid backup file.");
          input.value = null;
          return;
        }

        if (!window.confirm("This will overwrite all existing data. Continue?")) {
          input.value = null;
          return;
        }

        if (!window.api?.importBackup) {
          alert("Import not available in browser mode.");
          return;
        }

        const result = await window.api.importBackup(data);

        if (!result?.success) {
          alert("Import failed: " + (result?.error || "unknown error"));
          input.value = null;
          return;
        }

        // restore settings if included
        if (data.settings) {
          settingsService.saveSettings(data.settings);
          setSettings(data.settings);
        }

        alert("Backup restored successfully!");
        input.value = null;
      } catch (err) {
        console.error(err);
        alert("Error reading backup file.");
        input.value = null;
      }
    };

    reader.readAsText(file);
  };

  // =========================
  // 🧹 CLEAR DATA
  // =========================
  const handleClear = async () => {
    if (!window.confirm("Delete ALL patients, visits and appointments? This cannot be undone.")) return;

    if (!window.api?.clearAllData) {
      alert("Clear not available in browser mode.");
      return;
    }

    const result = await window.api.clearAllData();

    if (result?.success) {
      alert("All data cleared.");
    } else {
      alert("Clear failed.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage clinic information" />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Clinic Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Clinic Name</label>
                <input
                  type="text"
                  value={settings.clinicName}
                  onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Dentist Name</label>
                <input
                  type="text"
                  value={settings.dentistName}
                  onChange={(e) => setSettings({ ...settings, dentistName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Rs.">Rs. (PKR)</option>
                  <option value="$">$ (USD)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium">Address</label>
              <textarea
                rows={4}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium">Clinic Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setSettings({ ...settings, logo: reader.result });
                  reader.readAsDataURL(file);
                }}
                className="w-full text-sm text-slate-700"
              />
              {settings.logo && (
                <img
                  src={settings.logo}
                  alt="Clinic Logo Preview"
                  className="mt-4 h-24 w-auto rounded-xl border border-slate-200 object-contain"
                />
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                <FaSave />
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Backup & Restore</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Export */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Export Backup</h3>
            <p className="text-sm text-slate-500 mb-4">Download all clinic data as a backup file.</p>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
            >
              Download Backup
            </button>
          </div>

          {/* Import */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Import Backup</h3>
            <p className="text-sm text-slate-500 mb-4">Restore clinic data from a backup file.</p>
            <label className="inline-block cursor-pointer">
              <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
              <span className="bg-blue-600 text-white px-4 py-2 rounded-xl">Choose File</span>
            </label>
          </div>

          {/* Clear */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Clear Data</h3>
            <p className="text-sm text-slate-500 mb-4">Delete all patients, visits and appointments.</p>
            <button
              onClick={handleClear}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}