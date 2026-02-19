import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateDailyReport = (stats, rangeType, dateRange, bookings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Colors ---
    const primaryColor = [0, 77, 67]; // #004d43

    // --- Helper Text ---
    const title = rangeType === 'custom'
        ? 'Custom Period Report'
        : `${rangeType === 'today' ? 'Daily' : rangeType === 'yesterday' ? 'Daily' : `${rangeType}-Day`} Financial Report`;

    const dateStr = `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;

    // --- 1. Header Section ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Covered: ${dateStr}`, 14, 30);

    // Vendor Name Placeholder (Ideally passed in props)
    doc.setFontSize(12);
    doc.text("PitchIt Vendor Admin", pageWidth - 14, 20, { align: 'right' });

    // --- 2. Key Metrics Summary (The Big Table) ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Key Metrics Summary", 14, 55);

    const tableData = [
        ['Revenue', `PKR ${stats.totalRevenue.toLocaleString()}`],
        ['Cash Collection', `PKR ${stats.cashCollection.toLocaleString()}`],
        ['Digital Payments', `PKR ${stats.digitalPayments.toLocaleString()}`],
        ['Net Profit (Est.)', `PKR ${stats.totalRevenue.toLocaleString()}`], // Assuming 100% margin for now
        ['Total Bookings', stats.totalBookings],
        ['Completed', stats.completedBookings],
        ['Cancelled', stats.cancelledBookings],
        ['Utilization', `${stats.avgUtilization}%`],
    ];

    doc.autoTable({
        startY: 60,
        head: [['Metric', 'Value']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 11, fontStyle: 'bold' },
        bodyStyles: { fontSize: 10, textColor: 50 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' }
        },
        styles: { cellPadding: 3 },
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // --- 3. Booking & Customer Highlights ---
    // Two columns: Left (Customer Stats), Right (Time Stats)

    // Left Box (Customers)
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, finalY, 85, 35, 2, 2, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Customer Insights", 20, finalY + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`New Customers: ${stats.newCustomers}`, 20, finalY + 18);
    doc.text(`Returning: ${stats.returningCustomers}`, 20, finalY + 24);
    doc.text(`Total Unique: ${stats.newCustomers + stats.returningCustomers}`, 20, finalY + 30);

    // Right Box (Time Stats)
    doc.roundedRect(pageWidth - 99, finalY, 85, 35, 2, 2, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Operational Insights", pageWidth - 93, finalY + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Peak Hours: ${stats.peakHourBookings} bookings`, pageWidth - 93, finalY + 18);
    doc.text(`No-Shows: ${stats.noShows}`, pageWidth - 93, finalY + 24);
    doc.text(`Avg Utilization: ${stats.avgUtilization}%`, pageWidth - 93, finalY + 30);

    finalY += 45;

    // --- 4. Recent Bookings Table ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Detailed Bookings Log", 14, finalY);

    const bookingRows = bookings.map(b => [
        b.customerName || b.userName || 'Guest',
        b.date ? new Date(b.date.seconds * 1000).toLocaleDateString() : '-',
        b.timeSlot || '-',
        `PKR ${(b.totalAmount || b.amount || 0).toLocaleString()}`,
        b.paymentMethod || '-',
        b.status || '-'
    ]);

    doc.autoTable({
        startY: finalY + 5,
        head: [['Customer', 'Date', 'Time', 'Amount', 'Payment', 'Status']],
        body: bookingRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        styles: { cellPadding: 2 },
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated via PitchIt Vendor - Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`Report_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};
