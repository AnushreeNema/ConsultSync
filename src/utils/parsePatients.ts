// utils/parsePatients.ts
export function parsePatientsFromText(text: string) {
  const patients = [];
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i += 4) {
    const name = lines[i]?.split(":")[1]?.trim();
    const age = parseInt(lines[i + 1]?.split(":")[1]?.trim() || "0");
    const ipdNumber = lines[i + 2]?.split(":")[1]?.trim();
    const hospital = lines[i + 3]?.split(":")[1]?.trim();

    if (name && ipdNumber && hospital) {
      patients.push({ name, age, ipdNumber, hospital });
    }
  }

  return patients;
}
