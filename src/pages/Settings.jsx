import { FaSave } from "react-icons/fa";
import { useState } from "react";
import { settingsService } from "../services/settingsService";
import PageHeader from "../components/ui/PageHeader";

export default function Settings() {
  const [settings, setSettings] = useState(
    settingsService.getSettings()
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    settingsService.saveSettings(settings);

    alert("Settings saved successfully");
  };

  // =========================
  // 📦 EXPORT BACKUP
  // =========================
  const handleExport = () => {
    const data = {
      patients: JSON.parse(localStorage.getItem("dental_patients") || "[]"),
      appointments: JSON.parse(localStorage.getItem("dental_appointments") || "[]"),
      settings: JSON.parse(localStorage.getItem("dental_settings") || "{}"),
    };

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

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (!data.patients || !data.appointments) {
          alert("Invalid backup file");
          input.value = null;
          return;
        }

        if (!window.confirm("This will overwrite existing data. Continue?")) {
          input.value = null;
          return;
        }

        localStorage.setItem("dental_patients", JSON.stringify(data.patients));
        localStorage.setItem("dental_appointments", JSON.stringify(data.appointments));

        if (data.settings) {
          localStorage.setItem("dental_settings", JSON.stringify(data.settings));
        }

        alert("Backup restored successfully!");
        input.value = null;
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Error reading backup file");
        input.value = null;
      }
    };

    reader.readAsText(file);
  };

  // =========================
  // 🧹 CLEAR DATA
  // =========================
  const handleClear = () => {
    if (!window.confirm("Delete all data?")) return;

    // Keep keys present with empty arrays so the app does not reseed default patients on reload.
    localStorage.setItem("dental_patients", JSON.stringify([]));
    localStorage.setItem("dental_appointments", JSON.stringify([]));
    localStorage.removeItem("dental_settings");

    alert("All data cleared");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage clinic information"
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Clinic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Clinic Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Clinic Name
                </label>

                <input
                  type="text"
                  value={settings.clinicName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      clinicName: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dentist Name */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Dentist Name
                </label>

                <input
                  type="text"
                  value={settings.dentistName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dentistName: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Phone Number
                </label>

                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Currency
                </label>

                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      currency: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium">
                Address
              </label>

              <textarea
                rows={4}
                value={settings.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

              {/* Clinic Logo */}
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium">
                  Clinic Logo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();

                    reader.onload = () => {
                      setSettings({
                        ...settings,
                        logo: reader.result,
                      });
                    };

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
              <div className="flex justify-end">
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

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mt-6">
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
            <p className="text-sm text-slate-500 mb-4">Restore clinic data from backup file.</p>

            <label className="inline-block">
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
              />
              <span className="bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer">Choose File</span>
            </label>
          </div>

          {/* Clear */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Clear Data</h3>
            <p className="text-sm text-slate-500 mb-4">Delete all patients and appointments.</p>

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