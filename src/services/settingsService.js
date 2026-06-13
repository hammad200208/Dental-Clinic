const STORAGE_KEY = "dental_settings";

const getSettings = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  const defaultSettings = {
    clinicName: "Dental Clinic",
    dentistName: "Dr. Ahmed",
    phone: "0300-1234567",
    currency: "PKR",
    address: "Main Road, Faisalabad",
    logo: "",
  };

  return data
    ? {
        ...defaultSettings,
        ...JSON.parse(data),
      }
    : defaultSettings;
};

const saveSettings = (settings) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(settings)
  );
};

export const settingsService = {
  getSettings,
  saveSettings,
};