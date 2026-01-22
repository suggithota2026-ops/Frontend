import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateOrdersReportPDF = (allOrders: any[], drivers: any[], startDate: string, endDate: string, formatStatus: (status: string) => string) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDERS REPORT', 105, 20, { align: 'center' });

    // Date Range
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : 'All Orders';
    doc.text(`Period: ${dateRange}`, 20, 35);
    doc.text(`Total Orders: ${allOrders.length}`, 20, 42);

    // Prepare table data
    const tableData = allOrders.map((order: any) => {
        const products = order.items
            ? order.items.map((item: any) => `${item.name || item.productName} (${item.quantity})`).join(", ")
            : "N/A";
        const driverName = order.assignedTo
            ? (drivers.find((d: any) => d.id === order.assignedTo)?.name || order.assignedTo)
            : "Unassigned";

        return [
            order.id,
            order.customer || `Hotel #${order.hotelId}`,
            order.date || new Date(order.createdAt).toLocaleDateString(),
            formatStatus(order.status),
            driverName,
            products,
            `₹${(order.deliveryCharge || 0).toFixed(2)}`,
            `₹${(order.total || order.totalAmount || 0).toFixed(2)}`
        ];
    });

    // Generate table
    autoTable(doc, {
        startY: 50,
        head: [['ID', 'Client', 'Date', 'Status', 'Driver', 'Products', 'Delivery', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
        },
        styles: {
            fontSize: 8,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 35 },
            2: { cellWidth: 25 },
            3: { cellWidth: 20 },
            4: { cellWidth: 25 },
            5: { cellWidth: 40 },
            6: { cellWidth: 18, halign: 'right' },
            7: { cellWidth: 20, halign: 'right' }
        }
    });

    // Save the PDF
    doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
