import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Trash2, Ban, CheckCircle, Search, Edit, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnterNavigation } from "@/hooks/useEnterNavigation";
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
  contractDuration?: string;
  customerProductPricing?: {
    id?: number;
    productId: number;
    fixedPrice: number;
    contractStartDate?: string;
    contractEndDate?: string;
    isActive?: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

const Hotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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
    contractDuration: "",
    customerProductPricing: [],
  });

  // State for product selection modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [allProducts, setAllProducts] = useState([]);

  // Reset form function
  const resetForm = () => {
    setFormData({
      hotelName: "",
      mobileNumber: "",
      address: "",
      gstNumber: "",
      creditLimit: "",
      rateType: "",
      contractDuration: "",
      customerProductPricing: [],
    });
  };

  // Function to fetch all products
  const fetchAllProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      if (response.data.success) {
        setAllProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  // Function to fetch products for pricing
  const fetchProductsForPricing = async () => {
    try {
      const response = await api.get('/admin/products');
      if (response.data.success) {
        // Filter out products already added to pricing
        const existingProductIds = formData.customerProductPricing.map(p => p.productId);
        const availableProducts = response.data.data.products.filter(
          product => !existingProductIds.includes(product.id)
        );
        setAvailableProducts(availableProducts);
        setIsProductModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  // Function to add a product to pricing
  const addProductToPricing = () => {
    if (selectedProduct && tempPrice && parseFloat(tempPrice) > 0) {
      const newPricing = {
        productId: selectedProduct.id,
        fixedPrice: parseFloat(tempPrice),
      };

      setFormData({
        ...formData,
        customerProductPricing: [...formData.customerProductPricing, newPricing]
      });

      // Reset selection
      setSelectedProduct(null);
      setTempPrice('');
      setIsProductModalOpen(false);
    }
  };

  // Function to update product price
  const updateProductPrice = (index, newPrice) => {
    const updatedPricing = [...formData.customerProductPricing];
    updatedPricing[index].fixedPrice = newPrice;
    setFormData({
      ...formData,
      customerProductPricing: updatedPricing
    });
  };

  // Function to remove product from pricing
  const removeProductPricing = (index) => {
    const updatedPricing = [...formData.customerProductPricing];
    updatedPricing.splice(index, 1);
    setFormData({
      ...formData,
      customerProductPricing: updatedPricing
    });
  };

  // Helper function to get product name by ID
  const getProductName = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.name : `Product ID: ${productId}`;
  };

  // Fetch all products when component mounts
  useEffect(() => {
    fetchAllProducts();
  }, []);

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
      "NOTE: Customers with pending, confirmed, or dispatched orders cannot be deleted.\n" +
      "Hotels with only delivered or cancelled orders can be deleted.\n\n" +
      "If this customer has active orders, consider BLOCKING instead of deleting.\n\n" +
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
      if (errorMessage.includes("pending or active orders")) {
        toast.error(
          "Cannot delete customer with pending or active orders. Deliver or cancel all orders first, or use Block instead.",
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleAddHotel = async () => {
    if (!formData.hotelName || !formData.mobileNumber || !formData.address) {
      toast.error("Please fill in all required customer information fields");
      return;
    }

    if (!formData.rateType) {
      toast.error("Please select a rate type");
      return;
    }

    if (formData.rateType === 'Fixed Price' && !formData.contractDuration) {
      toast.error("Please select a contract duration for fixed price customers");
      return;
    }

    if (formData.rateType === 'Fixed Price' && (!formData.customerProductPricing || formData.customerProductPricing.length === 0)) {
      toast.error("Please add at least one product for fixed price customers");
      return;
    }

    setIsLoading(true);
    try {
      const normalizedMobile = (formData.mobileNumber || "").replace(/\D/g, "");
      if (normalizedMobile.length !== 10) {
        toast.error("Please enter correct mobile number");
        return;
      }

      await api.post("/admin/hotels", {
        hotelName: formData.hotelName?.trim(),
        mobileNumber: normalizedMobile,
        address: formData.address?.trim(),
        gstNumber: formData.gstNumber ? formData.gstNumber.trim().toUpperCase() : undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        rateType: formData.rateType || undefined,
        contractDuration: formData.contractDuration || undefined,
        customerProductPricing: (formData.customerProductPricing || []).map((p) => ({
          productId: Number(p.productId),
          fixedPrice: Number(p.fixedPrice),
        })) || undefined,
      });
      toast.success("Customer created successfully");
      setShowAddForm(false);
      setFormData({
        hotelName: "",
        mobileNumber: "",
        address: "",
        gstNumber: "",
        creditLimit: "",
        rateType: "",
        contractDuration: "",
        customerProductPricing: [],
      });
      fetchHotels();
    } catch (error: any) {
      console.error("Error creating customer:", error);
      const apiMsg = error.response?.data?.message;
      const details = error.response?.data?.errors;
      const firstDetail =
        Array.isArray(details) && details.length > 0
          ? details[0]?.message || details[0]
          : null;

      const detailText = typeof firstDetail === "string" ? firstDetail.toLowerCase() : "";
      if (detailText.includes("mobilenumber")) {
        toast.error("Please enter correct mobile number");
      } else if (detailText.includes("gstnumber")) {
        toast.error("Please enter correct GST number");
      } else if (detailText.includes("address")) {
        toast.error("Please enter correct address");
      } else if (detailText.includes("hotelname")) {
        toast.error("Please enter correct customer name");
      } else {
        toast.error(firstDetail || apiMsg || "Failed to create customer");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditHotel = async () => {
    if (!currentHotel || !formData.hotelName || !formData.address) {
      toast.error("Please fill in all required customer information fields");
      return;
    }

    if (!formData.rateType) {
      toast.error("Please select a rate type");
      return;
    }

    if (formData.rateType === 'Fixed Price' && !formData.contractDuration) {
      toast.error("Please select a contract duration for fixed price customers");
      return;
    }

    if (formData.rateType === 'Fixed Price' && (!formData.customerProductPricing || formData.customerProductPricing.length === 0)) {
      toast.error("Please add at least one product for fixed price customers");
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
        contractDuration: formData.contractDuration || undefined,
        customerProductPricing: formData.customerProductPricing || undefined,
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
        contractDuration: "",
        customerProductPricing: [],
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
      contractDuration: hotel.contractDuration || "",
      customerProductPricing: hotel.customerProductPricing || [],
    });
    setIsEditOpen(true);
  };

  // Get enter navigation refs
  const { addFormRef, editFormRef } = useHotelEnterNavigation(handleAddHotel, handleEditHotel, isLoading);

  return (
    <div className="space-y-6">
      {/* Main Content - Either Customer List or Add Form */}
      {!showAddForm ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customers</h1>
              <p className="text-muted-foreground">Manage customer accounts, credit limits, and access</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}>
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
                    <TableHead>Rate Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (hotels && hotels.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading customers...
                      </TableCell>
                    </TableRow>
                  ) : (hotels && hotels.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                        <TableCell>{hotel.rateType || "-"}</TableCell>
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
        </>
      ) : (
        /* Add Customer Form Page */
        <form ref={addFormRef} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add New Customer Account</h1>
              <p className="text-muted-foreground">Create a new account for a customer or B2B client.</p>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Main Street, Mumbai, MH"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Contract Configuration */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing & Contract Configuration</h2>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rateType">Rate Type *</Label>
                <select
                  id="rateType"
                  value={formData.rateType}
                  onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Rate Type</option>
                  <option value="Daily Price">Daily Price</option>
                  <option value="Weekly Price">Weekly Price</option>
                  <option value="Fixed Price">Fixed Price</option>
                </select>
                {formData.rateType === 'Fixed Price' && (
                  <p className="text-sm text-muted-foreground">Fixed Price allows custom product pricing only for this customer.</p>
                )}
              </div>

              {formData.rateType === 'Fixed Price' && (
                <div className="grid gap-2">
                  <Label htmlFor="contractDuration">Contract Duration *</Label>
                  <select
                    id="contractDuration"
                    value={formData.contractDuration}
                    onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Duration</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Product Pricing Section */}
          {formData.rateType === 'Fixed Price' && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>🧾</span>
                  Product Pricing (Customer-Specific)
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchProductsForPricing}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  Prices set here will apply only to this customer for the selected contract duration, regardless of future price changes.
                </p>
              </div>

              {formData.customerProductPricing && formData.customerProductPricing.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Product</th>
                        <th className="text-left py-2 px-4">Fixed Price (₹)</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.customerProductPricing.map((pricing, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{getProductName(pricing.productId)}</td>
                          <td className="py-2 px-4">
                            <Input
                              type="number"
                              value={pricing.fixedPrice}
                              onChange={(e) => updateProductPrice(index, parseFloat(e.target.value) || 0)}
                              className="w-24"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProductPricing(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p className="text-lg font-medium">No products added yet</p>
                  <p className="text-sm mt-2">Click "Add Product" to set customer-specific pricing</p>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleAddHotel} 
              disabled={isLoading || (formData.rateType === 'Fixed Price' && (!formData.contractDuration || formData.customerProductPricing.length === 0))}
            >
              {isLoading ? "Creating..." : "Create Customer Account"}
            </Button>
          </div>
        </form>
      )}
      {/* Edit Hotel Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <form ref={editFormRef} className="flex flex-col max-h-[90vh] min-h-0">
            <DialogHeader className="px-6 pr-12 pt-6 pb-4 shrink-0 border-b">
              <DialogTitle>Edit Customer Account</DialogTitle>
              <DialogDescription>
                Update customer information and pricing configuration.
              </DialogDescription>
            </DialogHeader>
          <div className="space-y-4 px-6 py-4 flex-1 min-h-0 overflow-y-auto">
            {/* Customer Information Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="edit-address">Address *</Label>
                  <Input
                    id="edit-address"
                    placeholder="e.g. 123 Main Street, Mumbai, MH"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gstNumber">GST Number</Label>
                  <Input
                    id="edit-gstNumber"
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Contract Configuration */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Pricing & Contract Configuration</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-rateType">Rate Type *</Label>
                  <select
                    id="edit-rateType"
                    value={formData.rateType}
                    onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Rate Type</option>
                    <option value="Daily Price">Daily Price</option>
                    <option value="Weekly Price">Weekly Price</option>
                    <option value="Fixed Price">Fixed Price (Contract Based)</option>
                  </select>
                  {formData.rateType === 'Fixed Price' && (
                    <p className="text-sm text-muted-foreground">Fixed Price allows custom product pricing only for this customer.</p>
                  )}
                </div>

                {formData.rateType === 'Fixed Price' && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contractDuration">Contract Duration *</Label>
                    <select
                      id="edit-contractDuration"
                      value={formData.contractDuration}
                      onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Duration</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Product Pricing Section */}
            {formData.rateType === 'Fixed Price' && (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span>🧾</span>
                    Product Pricing (Customer-Specific)
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchProductsForPricing}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Prices set here will apply only to this customer for the selected contract duration, regardless of future price changes.
                  </p>
                </div>

                {formData.customerProductPricing && formData.customerProductPricing.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Product</th>
                          <th className="text-left py-2 px-4">Fixed Price (₹)</th>
                          <th className="text-left py-2 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.customerProductPricing.map((pricing, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4">{getProductName(pricing.productId)}</td>
                            <td className="py-2 px-4">
                              <Input
                                type="number"
                                value={pricing.fixedPrice}
                                onChange={(e) => updateProductPrice(index, parseFloat(e.target.value) || 0)}
                                className="w-24"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProductPricing(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p className="text-lg font-medium">No products added yet</p>
                    <p className="text-sm mt-2">Click "Add Product" to set customer-specific pricing</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
            <Button variant="outline" onClick={() => {
              setIsEditOpen(false);
              setCurrentHotel(null);
            }} disabled={isLoading}>Cancel</Button>
            <Button type="submit" onClick={handleEditHotel} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Account"}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Selection Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Product for Fixed Pricing</DialogTitle>
            <DialogDescription>
              Choose a product and set a fixed price for this customer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product-select">Product</Label>
              <select
                id="product-select"
                value={selectedProduct ? selectedProduct.id : ""}
                onChange={(e) => {
                  const product = allProducts.find(p => p.id === parseInt(e.target.value));
                  setSelectedProduct(product);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a product</option>
                {allProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fixed-price">Fixed Price (₹)</Label>
              <Input
                id="fixed-price"
                type="number"
                placeholder="Enter fixed price"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            <Button onClick={addProductToPricing} disabled={!selectedProduct || !tempPrice || parseFloat(tempPrice) <= 0}>
              Add to Pricing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Enter key navigation hooks
const useHotelEnterNavigation = (handleAddHotel, handleEditHotel, isLoading) => {
  const { formRef: addFormRef } = useEnterNavigation({
    onSubmit: handleAddHotel,
    disabled: isLoading
  });

  const { formRef: editFormRef } = useEnterNavigation({
    onSubmit: handleEditHotel,
    disabled: isLoading
  });

  return { addFormRef, editFormRef };
};

export default Hotels;
