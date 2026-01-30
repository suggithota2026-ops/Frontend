import { useState, useEffect } from "react";
import { Download, FileText, Printer, Filter, CreditCard, DollarSign, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Mock Data for Charts
// Mock data constants removed

const Billing = () => {
  const [period, setPeriod] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [billingData, setBillingData] = useState<any>({
    revenue: 0,
    gst: 0,
    pendingPayments: 0,
    invoicesCount: 0,
    reportData: [],
    gstData: [],
    invoices: []
  });

  const fetchBillingData = async () => {
    setIsLoading(true);
    try {
      // Fetch report based on period
      const endpoint = `/admin/reports/${period}`;
      const response = await api.get(endpoint);
      if (response.data.success) {
        const data = response.data.data;

        // Transform backend data for frontend
        const transformedData = {
          revenue: data.totalSales,
          gst: (data.totalSales || 0) * 0.18,
          pendingPayments: 0,
          invoicesCount: (data.invoices || []).length,
          reportData: [
            {
              month: period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'This Month',
              sales: data.totalSales,
              gst: (data.totalSales || 0) * 0.18,
              invoices: (data.invoices || []).length
            }
          ],
          gstData: [],
          invoices: (data.invoices || []).map((inv: any) => ({
            id: inv.invoiceNumber,
            date: new Date(inv.createdAt).toLocaleDateString(),
            client: inv.hotel?.hotelName || `Hotel #${inv.hotelId}`,
            amount: parseFloat(inv.totalAmount || 0),
            gst: parseFloat(inv.gstAmount || 0),
            status: inv.status
          }))
        };
        setBillingData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to fetch billing data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [period]);

  const handleDownloadReport = async (type: string) => {
    setIsLoading(true);
    try {
      toast.info(`Preparing ${type.toUpperCase()} report...`);

      // Helper to trigger CSV download
      const triggerDownload = (content: string, fname: string) => {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fname);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      if (type === 'gstr1') {
        const invoices = billingData.invoices || [];
        if (invoices.length === 0) {
          toast.error("No invoice data available to export");
          return;
        }

        const doc = new jsPDF('landscape');
        doc.setFontSize(22);
        doc.text("GSTR-1 Sales Report", 140, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Period: ${period.toUpperCase()}`, 20, 30);
        doc.text(`Total Invoices: ${invoices.length}`, 20, 35);

        const tableData = invoices.map((inv: any) => [
          inv.id,
          inv.date,
          inv.client,
          `INR ${(inv.amount - inv.gst).toFixed(2)}`,
          '18%',
          `INR ${inv.gst.toFixed(2)}`,
          `INR ${inv.amount.toFixed(2)}`,
          inv.status
        ]);

        autoTable(doc, {
          startY: 45,
          head: [['Inv No', 'Date', 'Customer', 'Taxable Val', 'Rate', 'GST Amt', 'Total', 'Status']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`report_gstr1_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("GSTR-1 PDF report downloaded!");

      } else if (type === 'item_sales') {
        const response = await api.get(`/admin/reports/${period}`);
        if (response.data.success) {
          const orders = response.data.data.orders || [];
          const itemSales: any = {};

          orders.forEach((order: any) => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                const name = item.productName || item.name;
                const unit = item.unit || 'kg';
                if (!itemSales[name]) {
                  itemSales[name] = { name, quantity: 0, total: 0, unit };
                }
                itemSales[name].quantity += parseFloat(item.quantity || 0);
                itemSales[name].total += parseFloat(item.totalPrice || item.amount || 0);
              });
            }
          });

          const doc = new jsPDF();
          doc.setFontSize(22);
          doc.text("Item-wise Sales Report", 105, 20, { align: 'center' });

          doc.setFontSize(10);
          doc.text(`Period: ${period.toUpperCase()}`, 20, 30);
          doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 35);

          const tableData = Object.values(itemSales).map((item: any) => [
            item.name,
            `${item.quantity.toFixed(2)} ${item.unit}`,
            `INR ${item.total.toFixed(2)}`
          ]);

          autoTable(doc, {
            startY: 45,
            head: [['Product Name', 'Total Quantity', 'Total Sales (INR)']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [142, 68, 173] }
          });

          doc.save(`item_wise_sales_${new Date().toISOString().split('T')[0]}.pdf`);
          toast.success("Item-wise sales PDF report downloaded!");
        }
      } else if (type === 'gstr3b') {
        const doc = new jsPDF();

        // PDF Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("GSTR-3B Monthly Return Summary", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Period: ${period.toUpperCase()}`, 20, 30);
        doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 35);

        // Summary Table
        const summaryData = [
          ['Total Taxable Value', `INR ${(billingData.revenue - billingData.gst).toLocaleString()}`],
          ['Integrated Tax (IGST)', 'INR 0.00'],
          ['Central Tax (CGST)', `INR ${(billingData.gst / 2).toLocaleString()}`],
          ['State Tax (SGST)', `INR ${(billingData.gst / 2).toLocaleString()}`],
          ['Total GST Amount', `INR ${billingData.gst.toLocaleString()}`],
          ['Total Gross Sales', `INR ${billingData.revenue.toLocaleString()}`],
          ['Total Invoices', `${billingData.invoicesCount}`],
        ];

        autoTable(doc, {
          startY: 45,
          head: [['Description', 'Value']],
          body: summaryData,
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
        });

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Generated by PRK Smile Admin Panel. This is a computer-generated summary for filing reference.", 20, doc.internal.pageSize.height - 10);

        doc.save(`gstr3b_summary_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("GSTR-3B PDF report downloaded!");
      } else {
        // Summary PDF
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Business Performance Summary", 105, 25, { align: 'center' });

        const summaryData = [
          ['Metric', 'Value'],
          ['Total Revenue', `INR ${billingData.revenue.toLocaleString()}`],
          ['Total GST', `INR ${billingData.gst.toLocaleString()}`],
          ['Total Invoices', billingData.invoicesCount.toString()]
        ];

        autoTable(doc, {
          startY: 40,
          body: summaryData,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`business_summary_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("Business Summary PDF downloaded!");
      }

    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (id: string) => {
    toast.info(`Downloading Invoice ${id}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Reports</h1>
          <p className="text-muted-foreground">Manage invoices, track payments, and detailed GST reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleDownloadReport('summary')}>
            <Download className="mr-2 h-4 w-4" /> Export Summary
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{billingData.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GST Collected</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{billingData.gst.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{billingData.pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">0 invoices pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.invoicesCount}</div>
            <p className="text-xs text-muted-foreground">+0 since last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="gst">GST Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & GST Over Time</CardTitle>
              <CardDescription>
                Comparison of total sales vs tax collected over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={billingData.reportData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGst" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" name="Total Sales (₹)" />
                    <Area type="monotone" dataKey="gst" stroke="#16a34a" fillOpacity={1} fill="url(#colorGst)" name="GST (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Manage and download generated invoices.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" /> Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingData.invoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'Paid' ? 'secondary' : invoice.status === 'Overdue' ? 'destructive' : 'outline'}
                          className={invoice.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(invoice.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>GST Summary (GSTR-1)</CardTitle>
                <CardDescription>Outward supplies summary for the selected period.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HSN Code</TableHead>
                      <TableHead>Taxable Value</TableHead>
                      <TableHead>Rate (%)</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.gstData.map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono">{item.hsn}</TableCell>
                        <TableCell>₹{item.taxable.toLocaleString()}</TableCell>
                        <TableCell>{item.rate}%</TableCell>
                        <TableCell className="text-right">₹{item.tax.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {(billingData.gstData && billingData.gstData.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No GST data available for this period.
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={3}>Total Liability</TableCell>
                      <TableCell className="text-right">₹{billingData.gst.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>Download detailed reports for filing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">GSTR-1 Report</p>
                      <p className="text-xs text-muted-foreground">Sales & Outward Supplies (PDF)</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadReport('gstr1')}>Download</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">GSTR-3B Summary</p>
                      <p className="text-xs text-muted-foreground">Monthly Return Summary (PDF)</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadReport('gstr3b')}>Download</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                      <Table className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Item-wise Sales</p>
                      <p className="text-xs text-muted-foreground">Detailed product sales report (PDF)</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadReport('item_sales')}>Download</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;
