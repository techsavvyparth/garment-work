import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const PURPLE = [124, 58, 237];
const PINK = [236, 72, 153];
const DARK = [15, 10, 30];

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? format(new Date(d), 'dd/MM/yyyy') : '-';

export const generateLadyPDF = ({ lady, works, payments, summary, user, month, year }) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const monthName = month ? format(new Date(year, month - 1, 1), 'MMMM yyyy') : 'All Time';
  const W = doc.internal.pageSize.getWidth();

  // Header gradient bar
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, W, 32, 'F');
  doc.setFillColor(...PINK);
  doc.rect(W - 60, 0, 60, 32, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(user?.companyName || 'Ladies Work System', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Work Management Report', 14, 20);
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 26);

  // Report title
  doc.setFontSize(11);
  doc.text(`Monthly Report: ${monthName}`, W - 58, 12, { align: 'right' });

  // Lady info box
  doc.setFillColor(248, 245, 255);
  doc.roundedRect(14, 38, W - 28, 28, 3, 3, 'F');
  doc.setTextColor(...DARK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(lady.name, 20, 49);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`📱 ${lady.mobile || '-'}`, 20, 57);
  doc.text(`📍 ${lady.address || '-'}`, 20, 63);

  // Summary cards
  const cards = [
    { label: 'Total Work', value: fmt(summary.monthTotal ?? summary.totalWorkAmount), color: PURPLE },
    { label: 'Total Paid', value: fmt(summary.monthPaid ?? summary.totalPaidAmount), color: [16, 185, 129] },
    { label: 'Pending', value: fmt(summary.monthPending ?? summary.pendingAmount), color: [239, 68, 68] },
  ];
  const cw = (W - 28 - 8) / 3;
  cards.forEach((card, i) => {
    const x = 14 + i * (cw + 4);
    doc.setFillColor(...card.color);
    doc.roundedRect(x, 72, cw, 22, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + cw / 2, 80, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + cw / 2, 89, { align: 'center' });
  });

  // Work entries table
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Work Entries', 14, 104);

  autoTable(doc, {
    startY: 108,
    head: [['Date', 'Work Type', 'Qty', 'Rate (₹)', 'Amount (₹)']],
    body: (works || []).map(w => [
      fmtDate(w.date), w.workType, w.quantity, fmt(w.rate), fmt(w.totalAmount)
    ]),
    foot: [['', '', '', 'Total', fmt(works?.reduce((s, w) => s + w.totalAmount, 0) || 0)]],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: PURPLE, textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [240, 235, 255], textColor: DARK, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [252, 250, 255] },
    margin: { left: 14, right: 14 },
  });

  // Payments table
  const afterWork = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Payment History', 14, afterWork);

  autoTable(doc, {
    startY: afterWork + 4,
    head: [['Date', 'Amount (₹)', 'Method', 'Notes']],
    body: (payments || []).map(p => [
      fmtDate(p.date), fmt(p.amount), p.method?.toUpperCase() || 'CASH', p.notes || '-'
    ]),
    foot: [['', fmt(payments?.reduce((s, p) => s + p.amount, 0) || 0), 'Total', '']],
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [230, 255, 245], textColor: DARK, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 255, 252] },
    margin: { left: 14, right: 14 },
  });

  // Signature section
  const sigY = doc.lastAutoTable.finalY + 14;
  if (sigY < 255) {
    doc.setDrawColor(...PURPLE);
    doc.setLineWidth(0.3);
    doc.line(14, sigY + 10, 80, sigY + 10);
    doc.line(W - 80, sigY + 10, W - 14, sigY + 10);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Admin Signature', 47, sigY + 14, { align: 'center' });
    doc.text("Worker's Signature", W - 47, sigY + 14, { align: 'center' });
  }

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 245, 255);
    doc.rect(0, 285, W, 12, 'F');
    doc.setFontSize(7);
    doc.setTextColor(130, 100, 180);
    doc.text('Ladies Work Management System', 14, 292);
    doc.text(`Page ${i} of ${pages}`, W - 14, 292, { align: 'right' });
  }

  return doc;
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};

export const printPDF = (doc) => {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const win = window.open(url);
  win?.print();
};
