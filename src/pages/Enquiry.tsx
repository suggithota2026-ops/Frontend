import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, MoreHorizontal, Trash2, Phone, Mail, MapPin, MessageSquare, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

interface ContactMessage {
  id: number;
  hotelName: string;
  contactNumber: string;
  address: string;
  city: string;
  pinCode: string;
  landmark: string | null;
  email: string | null;
  message: string;
  status: "pending" | "contacted" | "resolved";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const Enquiry = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Fetch contact messages
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await api.get("/admin/contact-messages", { params });
      if (response.data.success) {
        setMessages(response.data.data.messages);
        setPagination({
          page: response.data.data.pagination.page,
          limit: response.data.data.pagination.limit,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages,
        });
      }
    } catch (error: any) {
      console.error("Error fetching contact messages:", error);
      toast.error(error.response?.data?.message || "Failed to fetch enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/contact-messages/${id}`);
      if (response.data.success) {
        toast.success("Enquiry deleted successfully");
        fetchMessages();
      }
    } catch (error: any) {
      console.error("Error deleting enquiry:", error);
      toast.error(error.response?.data?.message || "Failed to delete enquiry");
    }
  };

  const handleAccept = async (message: ContactMessage) => {
    if (!confirm(`Accept enquiry from "${message.hotelName}"?

This will:
✓ Create a hotel account
✓ Send welcome message to ${message.contactNumber}
✓ Add hotel to Hotels list`)) {
      return;
    }

    setIsAccepting(true);
    try {
      const response = await api.post(`/admin/contact-messages/${message.id}/accept`);
      if (response.data.success) {
        toast.success(
          <div>
            <p className="font-semibold">✅ Enquiry Accepted!</p>
            <p className="text-sm">Hotel account created and welcome message sent</p>
          </div>
        );
        fetchMessages();
        if (isViewOpen) setIsViewOpen(false);
      }
    } catch (error: any) {
      console.error("Error accepting enquiry:", error);
      toast.error(error.response?.data?.message || "Failed to accept enquiry");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowRejectDialog(true);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!selectedMessage) return;

    setIsRejecting(true);
    try {
      const response = await api.post(`/admin/contact-messages/${selectedMessage.id}/reject`, {
        reason: rejectReason || undefined,
      });
      if (response.data.success) {
        toast.success("Enquiry rejected successfully");
        fetchMessages();
        setShowRejectDialog(false);
        if (isViewOpen) setIsViewOpen(false);
      }
    } catch (error: any) {
      console.error("Error rejecting enquiry:", error);
      toast.error(error.response?.data?.message || "Failed to reject enquiry");
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredMessages = messages.filter((message) =>
    message.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.contactNumber.includes(searchTerm) ||
    message.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "contacted":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
          <p className="text-muted-foreground">Manage customer enquiries and contact requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by hotel name, contact, or city..."
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
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="max-w-xs">Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-2">Loading enquiries...</p>
                  </TableCell>
                </TableRow>
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No enquiries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">{message.hotelName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{message.contactNumber}</span>
                        {message.email && (
                          <span className="text-xs text-muted-foreground">{message.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{message.city}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">{message.message}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(message.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(message.status)}>
                        {formatStatus(message.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {message.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAccept(message)}
                              disabled={isAccepting}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClick(message)}
                              disabled={isRejecting}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(message)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(message.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} enquiries
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
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              View complete enquiry information and add internal notes.
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getStatusColor(selectedMessage.status)}>
                  {formatStatus(selectedMessage.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(selectedMessage.createdAt)}
                </span>
              </div>

              {/* Hotel Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hotel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Hotel Name</Label>
                    <p className="font-medium">{selectedMessage.hotelName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Contact Number
                      </Label>
                      <p className="font-medium">{selectedMessage.contactNumber}</p>
                    </div>
                    {selectedMessage.email && (
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </Label>
                        <p className="font-medium text-sm">{selectedMessage.email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{selectedMessage.address}</p>
                  {selectedMessage.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {selectedMessage.landmark}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm">
                    <span>
                      <strong>City:</strong> {selectedMessage.city}
                    </span>
                    <span>
                      <strong>PIN:</strong> {selectedMessage.pinCode}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </CardContent>
              </Card>

              <DialogFooter className="gap-2 sm:gap-0">
                {selectedMessage.status === "pending" && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
                      onClick={() => handleAccept(selectedMessage)}
                      disabled={isAccepting}
                    >
                      {isAccepting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Accept Enquiry
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleRejectClick(selectedMessage)}
                      disabled={isRejecting}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Reject Enquiry
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this enquiry from{" "}
              <span className="font-semibold">{selectedMessage?.hotelName}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for Rejection (Optional)</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isRejecting}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirm Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enquiry;
