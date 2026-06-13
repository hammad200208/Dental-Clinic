import patients from "../data/patients";

const STORAGE_KEY = "dental_patients";

export const seedPatients = () => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);

    // Only seed if key doesn't exist at all
    if (existing !== null) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(patients)
    );
  } catch (error) {
    console.error("Seed error:", error);
  }
};