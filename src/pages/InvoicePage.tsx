import React, { useState } from 'react';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoiceList from '@/components/invoice/InvoiceList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Package } from 'lucide-react';
import api from '@/api/axios';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const InvoicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  
  // Export functions for today's orders
  const exportTodaysOrdersExcel = async () => {
    try {
      const response = await api.get('/admin/orders/today/summary');
      if (response.data.success) {
        const data = response.data.data;
        
        // Prepare worksheet data
        const worksheetData = [];
        
        // Add header row
        worksheetData.push(['Client Name', 'Item Name', 'Quantity']);
        
        // Add data rows
        data.summary.forEach((item: any) => {
          item.clients.forEach((client: any) => {
            worksheetData.push([client.clientName, item.itemName, `${client.quantity} kg`]);
          });
          
          // Add total row
          worksheetData.push(['--------------------', '--------------------', '--------------------']);
          worksheetData.push(['Total', item.itemName, `${item.totalQuantity} kg`]);
        });
        
        // Create worksheet and workbook
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Todays Orders');
        
        // Set column widths for better appearance
        const colWidths = [
          {wch: 25}, // Client Name
          {wch: 25}, // Item Name
          {wch: 15}  // Quantity
        ];
        worksheet['!cols'] = colWidths;
        
        // Export the Excel file
        XLSX.writeFile(workbook, `Todays_Orders_${data.date}.xlsx`);
      }
    } catch (error) {
      console.error('Error exporting today\'s orders to Excel:', error);
    }
  };

  const exportTodaysOrdersPDF = async () => {
    try {
      const response = await api.get('/admin/orders/today/summary');
      if (response.data.success) {
        const data = response.data.data;
        
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("TODAY'S ORDERS SUMMARY", 105, 20, { align: 'center' });

        // Date and Total Orders
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${data.date}`, 20, 35);
        doc.text(`Total Orders: ${data.totalOrders}`, 20, 42);

        // Prepare table data
        const tableData: any[] = [];
        data.summary.forEach((item: any) => {
          let firstClient = true;
          item.clients.forEach((client: any) => {
            tableData.push([
              client.clientName,
              firstClient ? { content: item.itemName, rowSpan: item.clients.length } : {},
              `${client.quantity} kg`
            ]);
            firstClient = false;
          });
          // Add total row for each item
          tableData.push([
            { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'left', fillColor: [230, 230, 230] } },
            {},
            { content: `${item.totalQuantity} kg`, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }
          ]);
        });

        // Generate table
        autoTable(doc, {
          startY: 50,
          head: [['Client Name', 'Item Name', 'Quantity']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 10,
            cellPadding: 5
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 70 },
            2: { cellWidth: 40, halign: 'right' }
          }
        });

        // Save the PDF
        doc.save(`Todays_Orders_${data.date}.pdf`);
      }
    } catch (error) {
      console.error('Error exporting today\'s orders to PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
            <p className="text-muted-foreground">Create and manage invoices, export today's orders</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap justify-center items-center">
            <Button variant="outline" onClick={exportTodaysOrdersPDF} className="px-6">
              <FileText className="w-4 h-4 mr-2" />
              Today's Orders PDF
            </Button>
            <span className="text-muted-foreground hidden sm:block">|</span>
            <Button onClick={exportTodaysOrdersExcel} className="px-6">
              <Download className="w-4 h-4 mr-2" />
              Today's Orders Excel
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'form' | 'list')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Create Invoice
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Invoice List
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-0">
            <Card>
              <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <InvoiceForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="list" className="space-y-0">
            <InvoiceList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvoicePage;
