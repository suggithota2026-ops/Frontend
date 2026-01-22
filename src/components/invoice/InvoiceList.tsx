import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Search, Eye, MoreHorizontal } from 'lucide-react';
import api from '@/api/axios';
import { format } from 'date-fns';

interface Invoice {
  id: number;
  invoiceNumber: string;
  hotelName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  subtotal: number;
  gstAmount: number;
  deliveryCharge: number;
  orderNumber?: string;
}

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load invoices
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/invoices');
      if (response.data.success) {
        setInvoices(response.data.data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.orderNumber && invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const downloadInvoice = async (invoiceId: number) => {
    try {
      const response = await api.get(`/admin/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });

      // Create a temporary link to download the file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  // Export functions
  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Invoice #', 'Client', 'Order #', 'Subtotal', 'GST', 'Delivery', 'Total', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(invoice => [
        `"${invoice.invoiceNumber}"`,
        `"${invoice.hotelName}"`,
        `"${invoice.orderNumber || 'N/A'}"`,
        `"₹${invoice.subtotal.toFixed(2)}"`,
        `"₹${invoice.gstAmount.toFixed(2)}"`,
        `"₹${invoice.deliveryCharge.toFixed(2)}"`,
        `"₹${invoice.totalAmount.toFixed(2)}"`,
        `"${invoice.status}"`,
        `"${format(new Date(invoice.createdAt), 'dd/MM/yyyy')}"`,
      ].join(','))
    ].join('\n');

    // Create and download file
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // This would require jsPDF and autoTable libraries
    alert('PDF export functionality would be implemented here using jsPDF and autoTable libraries.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground">Manage and export invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search invoices by number, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.hotelName}</TableCell>
                      <TableCell>{invoice.orderNumber || 'N/A'}</TableCell>
                      <TableCell>₹{invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={invoice.status === 'generated' ? 'default' : 'secondary'}
                          className={
                            invoice.status === 'generated' 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          }
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => downloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4 mr-1" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceList;