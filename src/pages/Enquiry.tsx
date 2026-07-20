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
import { Search, Eye, MoreHorizontal, Trash2, Phone, Mail, MapPin, MessageSquare, Loader2, CheckCircle, XCircle, Edit, Save } from "lucide-react";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
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
      toast.error(error.response?.data?.message || error.message || "Failed to fetch enquiries");
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
      toast.error(error.response?.data?.message || error.message || "Failed to accept enquiry");
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
      toast.error(error.response?.data?.message || error.message || "Failed to reject enquiry");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleUpdateClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setUpdateStatus(message.status);
    setUpdateNotes(message.notes || "");
    setShowUpdateDialog(true);
  };

  const handleUpdateConfirm = async () => {
    if (!selectedMessage) return;

    setIsUpdating(true);
    try {
      const response = await api.put(`/admin/contact-messages/${selectedMessage.id}`, {
        status: updateStatus,
        notes: updateNotes,
      });
      if (response.data.success) {
        toast.success("Enquiry updated successfully");
        fetchMessages();
        setShowUpdateDialog(false);
        if (isViewOpen) setIsViewOpen(false);
      }
    } catch (error: any) {
      console.error("Error updating enquiry:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update enquiry");
    } finally {
      setIsUpdating(false);
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
              ) : (filteredMessages && filteredMessages.length === 0) ? (
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
                          <DropdownMenuItem onClick={() => handleUpdateClick(message)}>
                            <Edit className="w-4 h-4 mr-2" /> Update
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pr-12 pt-6 pb-4 shrink-0 border-b">
            <DialogTitle>{selectedMessage ? `Enquiry Details - ${selectedMessage.hotelName}` : 'Enquiry Details'}</DialogTitle>
            <DialogDescription>
              View complete enquiry information and add internal notes.
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6">
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
                        <p className="font-medium text-sm break-all">{selectedMessage.email}</p>
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
                  <p className="text-sm break-words">{selectedMessage.address}</p>
                  {selectedMessage.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {selectedMessage.landmark}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
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
                  <p className="text-sm whitespace-pre-wrap break-words">{selectedMessage.message}</p>
                </CardContent>
              </Card>

              {/* WhatsApp Quick Action */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const number = selectedMessage.contactNumber.replace(/\D/g, '');
                    const formattedNumber = number.length === 10 ? `91${number}` : number;
                    window.open(`https://wa.me/${formattedNumber}?text=Hello ${selectedMessage.hotelName}, This is PRK Smiles Admin. Regarding your enquiry...`, '_blank');
                  }}
                  className="h-9 px-4 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200 gap-2 border-2"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span className="font-bold text-xs">Chat on WhatsApp</span>
                </Button>
              </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 shrink-0 border-t px-6 py-4 bg-background">
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
            </>
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

      {/* Update Enquiry Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Update Enquiry
            </DialogTitle>
            <DialogDescription>
              Update status and add internal notes for this enquiry from
              <span className="font-semibold">{selectedMessage?.hotelName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-status">Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger id="update-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-notes">Internal Notes</Label>
              <Textarea
                id="update-notes"
                placeholder="Add internal notes about this enquiry..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Enquiry
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
