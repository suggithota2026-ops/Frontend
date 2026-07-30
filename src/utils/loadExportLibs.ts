export async function loadExportLibs() {
  const [{ default: jsPDF }, autoTableMod, XLSX] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    import("xlsx"),
  ]);

  return {
    jsPDF,
    autoTable: autoTableMod.default,
    XLSX,
  };
}
