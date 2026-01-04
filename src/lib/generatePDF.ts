import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateIncidentReport = (incidents: any[], userName: string) => {
  const doc = new jsPDF();

  // 1. Add Header & Branding
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text("Smart Maintenance Report", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated for: ${userName}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);

  // 2. Define Table Columns
  const tableColumn = ["ID", "Title", "Category", "Status", "Date"];
  const tableRows: any[] = [];

  // 3. Format Data for Table
  incidents.forEach((incident) => {
    const rowData = [
      incident._id.slice(-6).toUpperCase(),
      incident.title,
      incident.category,
      incident.status,
      new Date(incident.createdAt).toLocaleDateString(),
    ];
    tableRows.push(rowData);
  });

  // 4. Generate Table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
  });

  // 5. Save the File
  doc.save(`Maintenance_Report_${Date.now()}.pdf`);
};