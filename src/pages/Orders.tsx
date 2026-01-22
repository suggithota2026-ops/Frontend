import { useState, useEffect } from "react";
import { Search, Filter, Eye, Download, MoreHorizontal, Truck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/axios";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // UI fields
  name?: string;
  price?: number;
  amount?: number;
  unit?: string;
  discount?: number;
}

interface Hotel {
  id: number;
  hotelName: string;
  mobileNumber: string;
  address: string;
}

interface Order {
  id: number;
  hotelId: number;
  hotel?: Hotel;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  assignedTo?: string;
  specialInstructions?: string;
  deliveryTime?: string;
  // Transformed fields for UI
  customer?: string;
  date?: string;
  total?: number;
  remarks?: string;
  paymentMethod?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isClientOrdersOpen, setIsClientOrdersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [todaysOrdersData, setTodaysOrdersData] = useState<any>(null);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [editingDeliveryId, setEditingDeliveryId] = useState<number | null>(null);
  const [tempDeliveryCharge, setTempDeliveryCharge] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Mock drivers (can be replaced with API call later)
  // State for drivers
  const [drivers, setDrivers] = useState<any[]>([]);

  // Transform API order to UI format
  const transformOrder = (order: any): Order => {
    const transformedItems = order.items.map((item: OrderItem) => ({
      ...item,
      name: item.productName,
      price: item.unitPrice,
      amount: item.totalPrice,
      unit: item.unit || "Kgs",
      discount: item.discount || 0,
    }));

    return {
      ...order,
      customer: order.hotel?.hotelName || `Hotel #${order.hotelId}`,
      date: new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      total: parseFloat(order.totalAmount.toString()),
      deliveryCharge: parseFloat(order.deliveryCharge?.toString() || "0"),
      items: transformedItems,
      remarks: order.specialInstructions || order.remarks,
      paymentMethod: order.paymentMethod,
    };
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter.toLowerCase();
      }

      const response = await api.get("/admin/orders", { params });
      if (response.data.success) {
        const transformedOrders = response.data.data.orders.map(transformOrder);
        setOrders(transformedOrders);
        setPagination({
          page: response.data.data.pagination.page,
          limit: response.data.data.pagination.limit,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages,
        });
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/admin/drivers");
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o.id.toString() === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      // Prepare request body with status and optionally keep assignedTo
      const requestBody: any = {
        status: newStatus.toLowerCase(),
      };

      // If order has assignedTo, keep it when updating status
      if (order.assignedTo) {
        requestBody.assignedTo = order.assignedTo;
      }

      const response = await api.patch(`/admin/orders/${orderId}/status`, requestBody);

      if (response.data.success) {
        toast.success(`Order ${orderId} status updated to ${formatStatus(newStatus)}`);
        fetchOrders(); // Refresh orders
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    if (driverId === "unassigned") return;

    try {
      const order = orders.find(o => o.id.toString() === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      await api.patch(`/admin/orders/${orderId}/status`, {
        status: order.status, // Keep current status
        assignedTo: driverId,
      });
      const driverName = drivers.find(d => d.id === driverId)?.name || driverId;
      toast.success(`Assigned ${driverName} to order ${orderId}`);
      fetchOrders(); // Refresh orders
    } catch (error: any) {
      console.error("Error assigning driver:", error);
      toast.error(error.response?.data?.message || "Failed to assign driver");
    }
  };

  const handleUpdateDeliveryCharge = async (orderId: number) => {
    try {
      const charge = parseFloat(tempDeliveryCharge);
      if (isNaN(charge)) {
        toast.error("Invalid delivery charge");
        return;
      }

      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        deliveryCharge: charge,
      });

      if (response.data.success) {
        toast.success("Delivery charge updated");
        setEditingDeliveryId(null);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Error updating delivery charge:", error);
      toast.error(error.response?.data?.message || "Failed to update delivery charge");
    }
  };

  const handlePaymentMethodChange = async (orderId: number, method: string) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        paymentMethod: method,
      });

      if (response.data.success) {
        toast.success(`Payment mode updated to ${method.toUpperCase()}`);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Error updating payment mode:", error);
      toast.error(error.response?.data?.message || "Failed to update payment mode");
    }
  };

  /* import html2canvas from 'html2canvas'; import jsPDF from 'jspdf'; import { createRoot } from 'react-dom/client'; import InvoiceTemplate from '@/components/invoice/InvoiceTemplate'; */

  const handleDownloadInvoice = async (order: Order) => {
    try {
      toast.info(`Generating invoice for ${order.id}...`);

      // Dynamic import to avoid SSR/Initial load issues if any, and ensuring libraries are loaded
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const { createRoot } = await import('react-dom/client');
      const { default: InvoiceTemplate } = await import('@/components/invoice/InvoiceTemplate');

      // Create a hidden container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Render the template
      const root = createRoot(container);

      // Wait for render
      await new Promise<void>((resolve) => {
        root.render(
          <InvoiceTemplate order={order} ref={(el) => {
            if (el) resolve();
          }} />
        );
        // Small timeout to ensure styles are applied
        setTimeout(resolve, 500);
      });

      // Give it a moment to fully render
      await new Promise(r => setTimeout(r, 500));

      const element = container.firstElementChild as HTMLElement;
      if (!element) throw new Error("Invoice template failed to render");

      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true // Important for images if any
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${order.id}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);

      toast.success("Invoice downloaded!");

    } catch (error: any) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice locally");
    }
  };

  const handleExportAll = () => {
    toast.info("Exporting all orders...");

    // Create CSV header
    const csvHeader = [
      "Order ID",
      "Client",
      "Date",
      "Status",
      "Delivery Team",
      "Products",
      "Delivery Charge",
      "Total Amount"
    ].join(",");

    // Create CSV rows
    const csvRows = orders.map(order => {
      const products = order.items
        ? order.items.map((item: any) => `${item.name || item.productName} (${item.quantity})`).join("; ")
        : "N/A";
      const driverName = order.assignedTo
        ? (drivers.find(d => d.id === order.assignedTo)?.name || order.assignedTo)
        : "Unassigned";

      return [
        order.id,
        `"${order.customer || `Hotel #${order.hotelId}`}"`,
        order.date || new Date(order.createdAt).toLocaleDateString(),
        formatStatus(order.status),
        `"${driverName}"`,
        `"${products}"`,
        (order.deliveryCharge || 0).toFixed(2),
        (order.total || order.totalAmount || 0).toFixed(2)
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join("\n");

    // Add UTF-8 BOM to force Windows to open in Notepad instead of associated CSV app
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;

    // Create and download file
    // Using text/plain MIME type with UTF-8 BOM so it opens in Notepad
    const blob = new Blob([csvContentWithBOM], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `All_Orders_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("All orders exported successfully!");
  };

  const fetchTodaysOrders = async () => {
    setIsExportLoading(true);
    try {
      const response = await api.get('/admin/orders/today/summary');
      if (response.data.success) {
        setTodaysOrdersData(response.data.data);
        setIsExportModalOpen(true);
      }
    } catch (error: any) {
      console.error("Error fetching today's orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch today's orders");
    } finally {
      setIsExportLoading(false);
    }
  };

  const handleExportTodaysOrders = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!todaysOrdersData) return;

    setIsExportLoading(true);
    try {
      switch (format) {
        case 'csv':
          exportToCSV(todaysOrdersData);
          break;
        case 'excel':
          exportToExcel(todaysOrdersData);
          break;
        case 'pdf':
          exportToPDF(todaysOrdersData);
          break;
      }
      toast.success(`Today's orders exported as ${format.toUpperCase()} successfully!`);
      setIsExportModalOpen(false);
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExportLoading(false);
    }
  };

  const exportToCSV = (data: any) => {
    // Create CSV header
    const csvHeader = ["Client Name", "Item Name", "Quantity"].join(",");

    // Create CSV rows
    const csvRows: string[] = [];

    data.summary.forEach((item: any) => {
      item.clients.forEach((client: any) => {
        csvRows.push([
          `"${client.clientName}"`,
          `"${item.itemName}"`,
          `${client.quantity} kg`
        ].join(","));
      });
      // Add total row
      csvRows.push([
        '"--------------------"',
        '"--------------------"',
        '"--------------------"'
      ].join(","));
      csvRows.push([
        '"Total"',
        `"${item.itemName}"`,
        `${item.totalQuantity} kg`
      ].join(","));
      csvRows.push(""); // Empty row for spacing
    });

    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join("\n");

    // Add UTF-8 BOM
    const BOM = '\uFEFF';
    const csvContentWithBOM = BOM + csvContent;

    // Create and download file
    const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Todays_Orders_${data.date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = (data: any) => {
    // For now, fall back to CSV since we don't have xlsx library installed
    // In a real implementation, you'd use a library like xlsx
    exportToCSV(data);
    toast.info("Excel export not available, falling back to CSV");
  };

  const exportToPDF = (data: any) => {
    // Create PDF content
    let pdfContent = `TODAY'S ORDERS SUMMARY\n`;
    pdfContent += `Date: ${data.date}\n`;
    pdfContent += `Total Orders: ${data.totalOrders}\n\n`;

    pdfContent += "Client Name".padEnd(30) + "| " + "Item Name".padEnd(25) + "| " + "Quantity".padEnd(15) + "\n";
    pdfContent += "-".repeat(80) + "\n";

    data.summary.forEach((item: any) => {
      item.clients.forEach((client: any) => {
        pdfContent += client.clientName.padEnd(30) + "| " +
          item.itemName.padEnd(25) + "| " +
          `${client.quantity} kg`.padEnd(15) + "\n";
      });
      pdfContent += "-".repeat(45) + "|" + "-".repeat(27) + "|" + "-".repeat(15) + "\n";
      pdfContent += "Total".padEnd(30) + "| " +
        item.itemName.padEnd(25) + "| " +
        `${item.totalQuantity} kg`.padEnd(15) + "\n\n";
    });

    // Create and download file
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Todays_Orders_${data.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };


  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const handleClientClick = (clientName: string) => {
    setSelectedClient(clientName);
    setIsClientOrdersOpen(true);
  };

  const getClientOrders = (clientName: string) => {
    return orders.filter(order => order.customer === clientName);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    // Status filter is handled by API, but we keep this for client-side search
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "delivered": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "confirmed": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "dispatched": return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Process orders, assign drivers, and manage invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleExportAll}>
            <Download className="w-4 h-4" />
            Export All
          </Button>
          <Button variant="default" className="gap-2 w-full sm:w-auto bg-primary hover:bg-primary/90" onClick={fetchTodaysOrders} disabled={isExportLoading}>
            <Download className="w-4 h-4" />
            {isExportLoading ? "Loading..." : "Export Today's Orders"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID or Client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Delivery Charge</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[180px]">Delivery Team (Internal)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleClientClick(order.customer || "")}
                        className="text-primary hover:underline font-medium cursor-pointer"
                      >
                        {order.customer}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{order.date}</TableCell>
                    <TableCell>₹{order.total?.toLocaleString()}</TableCell>
                    <TableCell onDoubleClick={() => {
                      setEditingDeliveryId(order.id);
                      setTempDeliveryCharge(order.deliveryCharge.toString());
                    }}>
                      {editingDeliveryId === order.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={tempDeliveryCharge}
                            onChange={(e) => setTempDeliveryCharge(e.target.value)}
                            onBlur={() => handleUpdateDeliveryCharge(order.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateDeliveryCharge(order.id);
                              if (e.key === 'Escape') setEditingDeliveryId(null);
                            }}
                            className="w-20 h-8"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded">
                          ₹{order.deliveryCharge?.toLocaleString() || "0"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.paymentMethod || "cod"}
                        onValueChange={(val) => handlePaymentMethodChange(order.id, val)}
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs font-bold uppercase">
                          <SelectValue>{order.paymentMethod || 'COD'}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cod">COD</SelectItem>
                          <SelectItem value="credit">CREDIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleStatusChange(order.id.toString(), val)}
                      >
                        <SelectTrigger className={`w-[130px] h-8 border-none ${getStatusColor(order.status)}`}>
                          <SelectValue>{formatStatus(order.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.assignedTo || "unassigned"}
                        onValueChange={(val) => handleAssignDriver(order.id.toString(), val)}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <div className="flex items-center gap-2">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            <SelectValue placeholder="Assign Driver" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned" disabled>Select Driver</SelectItem>
                          {drivers.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(order)}>
                            <FileText className="w-4 h-4 mr-2" /> Download Invoice
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              View complete order information and timeline.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Client</span>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Date</span>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div className="space-y-1 flex flex-col items-start">
                  <span className="text-xs text-muted-foreground uppercase">Status</span>
                  <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                    {formatStatus(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Delivery Driver</span>
                  <p className="font-medium capitalize">{selectedOrder.assignedTo ? (drivers.find(d => d.id === selectedOrder.assignedTo)?.name || selectedOrder.assignedTo) : "Unassigned"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Payment Mode</span>
                  <p className="font-bold uppercase">{selectedOrder.paymentMethod || 'COD'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Remarks</span>
                  <p className="font-medium whitespace-pre-wrap">{selectedOrder.remarks || '-'}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2 text-sm">
                  {selectedOrder.items && selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name || item.productName} <span className="text-muted-foreground text-xs">({item.quantity})</span></span>
                      <span>₹{(item.amount || item.totalPrice || 0).toLocaleString()}</span>
                    </div>
                  ))}

                  <div className="border-t pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-primary font-medium">
                      <span>Delivery Charge</span>
                      <span>₹{(selectedOrder.deliveryCharge || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1">
                      <span>Total</span>
                      <span>₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Quick Action */}
              {selectedOrder.hotel?.mobileNumber && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const number = selectedOrder.hotel!.mobileNumber.replace(/\D/g, '');
                      const formattedNumber = number.length === 10 ? `91${number}` : number;
                      window.open(`https://wa.me/${formattedNumber}?text=Hello ${selectedOrder.customer}, This is PRK Smiles Admin. Regarding your Order #${selectedOrder.id}...`, '_blank');
                    }}
                    className="h-9 px-4 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200 gap-2 border-2"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span className="font-bold text-xs">Contact on WhatsApp</span>
                  </Button>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsViewOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Today's Orders Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Export Today's Orders</DialogTitle>
            <DialogDescription>
              Export today's orders summary in various formats. Shows client-wise item breakdown with totals.
            </DialogDescription>
          </DialogHeader>

          {todaysOrdersData && (
            <div className="space-y-6">
              {/* Summary Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{todaysOrdersData.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="font-medium">{todaysOrdersData.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="font-medium">{todaysOrdersData.summary.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Export Format</p>
                    <p className="font-medium">Choose below</p>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <h4 className="font-semibold mb-3">Preview (First 5 items)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium">Client</th>
                        <th className="text-left py-2 px-3 font-medium">Item</th>
                        <th className="text-right py-2 px-3 font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaysOrdersData.summary.slice(0, 5).flatMap((item: any) =>
                        item.clients.map((client: any, idx: number) => (
                          <tr key={`${item.itemName}-${client.clientName}-${idx}`} className="border-t">
                            <td className="py-2 px-3">{client.clientName}</td>
                            <td className="py-2 px-3">{item.itemName}</td>
                            <td className="py-2 px-3 text-right">{client.quantity} kg</td>
                          </tr>
                        ))
                      )}
                      {todaysOrdersData.summary.length > 5 && (
                        <tr className="border-t bg-muted/50">
                          <td colSpan={3} className="py-2 px-3 text-center text-muted-foreground italic">
                            ... and {todaysOrdersData.summary.length - 5} more items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h4 className="font-semibold mb-3">Export Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-1 items-center justify-center"
                    onClick={() => handleExportTodaysOrders('csv')}
                    disabled={isExportLoading}
                  >
                    <FileText className="w-5 h-5" />
                    <span>CSV</span>
                    <span className="text-xs text-muted-foreground">Comma Separated</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-1 items-center justify-center"
                    onClick={() => handleExportTodaysOrders('excel')}
                    disabled={isExportLoading}
                  >
                    <Table className="w-5 h-5" />
                    <span>Excel</span>
                    <span className="text-xs text-muted-foreground">Spreadsheet</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-1 items-center justify-center"
                    onClick={() => handleExportTodaysOrders('pdf')}
                    disabled={isExportLoading}
                  >
                    <FileText className="w-5 h-5" />
                    <span>PDF/TXT</span>
                    <span className="text-xs text-muted-foreground">Text Format</span>
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
