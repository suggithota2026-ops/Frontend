import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Trash2, Ban, CheckCircle, Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/axios";

interface Hotel {
  id: number;
  hotelName: string;
  mobileNumber: string;
  address: string;
  gstNumber?: string;
  creditLimit: number;
  isBlocked: boolean;
  rateType?: string;
  pricePerUnit?: number;
  createdAt: string;
  updatedAt: string;
}

const Hotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [formData, setFormData] = useState({
    hotelName: "",
    mobileNumber: "",
    address: "",
    gstNumber: "",
    creditLimit: "",
    rateType: "",
    pricePerUnit: "",
  });

  // Fetch hotels from API
  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await api.get("/admin/hotels", { params });
      if (response.data.success) {
        setHotels(response.data.data.hotels);
        setPagination({
          page: response.data.data.pagination.page,
          limit: response.data.data.pagination.limit,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages,
        });
      }
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchTerm]);

  const handleBlockToggle = async (hotel: Hotel) => {
    try {
      const newBlockedStatus = !hotel.isBlocked;
      await api.patch(`/admin/hotels/${hotel.id}/block`, {
        isBlocked: newBlockedStatus,
      });
      toast.success(`Customer ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchHotels();
    } catch (error: any) {
      console.error("Error updating customer status:", error);
      toast.error(error.response?.data?.message || "Failed to update customer status");
    }
  };

  const handleDelete = async (id: number) => {
    const hotel = hotels.find(h => h.id === id);
    if (!hotel) return;

    // Enhanced confirmation with warning
    const confirmMessage = 
      "⚠️ WARNING: Delete Customer Account?\n\n" +
      `Customer: ${hotel.hotelName}\n\n` +
      "NOTE: Customers with existing orders cannot be deleted due to data integrity requirements.\n\n" +
      "If this customer has orders, consider BLOCKING instead of deleting.\n\n" +
      "Do you want to proceed with deletion?";

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await api.delete(`/admin/hotels/${id}`);
      toast.success("Customer deleted successfully");
      fetchHotels();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete customer";
      
      // Provide helpful guidance for the common case
      if (errorMessage.includes("existing orders")) {
        toast.error(
          "Cannot delete customer with existing orders. Use the Block option instead to prevent new orders while preserving order history.",
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleAddHotel = async () => {
    if (!formData.hotelName || !formData.mobileNumber || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/admin/hotels", {
        hotelName: formData.hotelName,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        gstNumber: formData.gstNumber || undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        rateType: formData.rateType || undefined,
        pricePerUnit: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : undefined,
      });
      toast.success("Customer created successfully");
      setIsAddOpen(false);
      setFormData({
        hotelName: "",
        mobileNumber: "",
        address: "",
        gstNumber: "",
        creditLimit: "",
        rateType: "",
        pricePerUnit: "",
      });
      fetchHotels();
    } catch (error: any) {
      console.error("Error creating customer:", error);
      toast.error(error.response?.data?.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditHotel = async () => {
    if (!currentHotel || !formData.hotelName || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      await api.put(`/admin/hotels/${currentHotel.id}`, {
        hotelName: formData.hotelName,
        address: formData.address,
        gstNumber: formData.gstNumber || undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        rateType: formData.rateType || undefined,
        pricePerUnit: formData.pricePerUnit ? parseFloat(formData.pricePerUnit) : undefined,
      });
      toast.success("Customer updated successfully");
      setIsEditOpen(false);
      setCurrentHotel(null);
      setFormData({
        hotelName: "",
        mobileNumber: "",
        address: "",
        gstNumber: "",
        creditLimit: "",
        rateType: "",
        pricePerUnit: "",
      });
      fetchHotels();
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.response?.data?.message || "Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (hotel: Hotel) => {
    setCurrentHotel(hotel);
    setFormData({
      hotelName: hotel.hotelName,
      mobileNumber: hotel.mobileNumber,
      address: hotel.address,
      gstNumber: hotel.gstNumber || "",
      creditLimit: hotel.creditLimit.toString(),
      rateType: hotel.rateType || "",
      pricePerUnit: hotel.pricePerUnit?.toString() || "",
    });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts, credit limits, and access</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Customer Account
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by customer name or mobile number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Hotels Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Rate Type</TableHead>
                <TableHead>Price Per Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (hotels && hotels.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : (hotels && hotels.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.hotelName}</TableCell>
                    <TableCell>{hotel.mobileNumber}</TableCell>
                    <TableCell className="max-w-xs truncate">{hotel.address}</TableCell>
                    <TableCell>{hotel.gstNumber || "-"}</TableCell>
                    <TableCell>₹{parseFloat(hotel.creditLimit.toString()).toLocaleString()}</TableCell>
                    <TableCell>{hotel.rateType || "-"}</TableCell>
                    <TableCell>₹{hotel.pricePerUnit ? parseFloat(hotel.pricePerUnit.toString()).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={!hotel.isBlocked ? "default" : "destructive"} className={!hotel.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                        {hotel.isBlocked ? "Blocked" : "Active"}
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
                          <DropdownMenuItem onClick={() => handleEditClick(hotel)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBlockToggle(hotel)}>
                            {hotel.isBlocked ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" /> Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" /> Block
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(hotel.id)}>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
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

      {/* Add Hotel Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer Account</DialogTitle>
            <DialogDescription>
              Create a new account for a customer or B2B client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hotelName">Customer Name *</Label>
              <Input
                id="hotelName"
                placeholder="e.g. John Doe"
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                placeholder="e.g. 9876543210"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="e.g. 123 Main Street, Mumbai, MH"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  placeholder="50000"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rateType">Rate Type</Label>
                <select
                  id="rateType"
                  value={formData.rateType}
                  onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Rate Type</option>
                  <option value="Dairy Prize">Dairy Prize</option>
                  <option value="Weekly Fixes">Weekly Fixes</option>
                  <option value="Fixed Price">Fixed Price</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricePerUnit">Price Per Unit (₹)</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleAddHotel} disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Account</DialogTitle>
            <DialogDescription>
              Update customer information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-hotelName">Customer Name *</Label>
              <Input
                id="edit-hotelName"
                placeholder="e.g. John Doe"
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-mobileNumber">Mobile Number</Label>
              <Input
                id="edit-mobileNumber"
                placeholder="e.g. 9876543210"
                value={formData.mobileNumber}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                placeholder="e.g. 123 Main Street, Mumbai, MH"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-gstNumber">GST Number</Label>
                <Input
                  id="edit-gstNumber"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-creditLimit">Credit Limit (₹)</Label>
                <Input
                  id="edit-creditLimit"
                  type="number"
                  placeholder="50000"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-rateType">Rate Type</Label>
                <select
                  id="edit-rateType"
                  value={formData.rateType}
                  onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Rate Type</option>
                  <option value="Dairy Prize">Dairy Prize</option>
                  <option value="Weekly Fixes">Weekly Fixes</option>
                  <option value="Fixed Price">Fixed Price</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pricePerUnit">Price Per Unit (₹)</Label>
                <Input
                  id="edit-pricePerUnit"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditOpen(false);
              setCurrentHotel(null);
            }} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleEditHotel} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hotels;
