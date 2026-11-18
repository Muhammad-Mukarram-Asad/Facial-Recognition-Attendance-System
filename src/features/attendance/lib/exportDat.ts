export function downloadAsDatFile(
  records: string[],
  filename: string = "attendance_records.dat",
) {
  if (!records || records.length === 0) {
    alert("No attendance records available to export.");
    return;
  }

  // Join the JSON array strings with Windows line endings (\r\n),
  // which is standard for most biometric and payroll software.
  const fileContent = records.join("\r\n");

  // Create a plain-text Blob
  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });

  // Trigger the browser download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".dat") ? filename : `${filename}.dat`;

  document.body.appendChild(link);
  link.click();

  // Clean up DOM and memory
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
