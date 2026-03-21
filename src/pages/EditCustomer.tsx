import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const EditCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBulkPricingModalOpen, setIsBulkPricingModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [bulkProductSearch, setBulkProductSearch] = useState('');
  const [selectedBulkProducts, setSelectedBulkProducts] = useState<Set<number>>(new Set());
  const [bulkFixedPrices, setBulkFixedPrices] = useState<Record<number, number>>({});

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

  // Reset form function
  const resetForm = () => {
    if (hotel) {
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
    }
    // Reset bulk pricing state
    setSelectedBulkProducts(new Set());
    setBulkFixedPrices({});
    setBulkProductSearch('');
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

  // Bulk pricing functions
  const toggleBulkProductSelection = (productId: number) => {
    const newSelected = new Set(selectedBulkProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      // Also remove the fixed price if it exists
      const newPrices = { ...bulkFixedPrices };
      delete newPrices[productId];
      setBulkFixedPrices(newPrices);
    } else {
      newSelected.add(productId);
    }
    setSelectedBulkProducts(newSelected);
  };

  const updateBulkFixedPrice = (productId: number, price: number) => {
    setBulkFixedPrices({
      ...bulkFixedPrices,
      [productId]: price
    });
  };

  const saveBulkPricing = () => {
    // Validate that all selected products have fixed prices
    const selectedProductIds = Array.from(selectedBulkProducts);
    const missingPrices = selectedProductIds.filter(id => !bulkFixedPrices[id] || bulkFixedPrices[id] <= 0);

    if (missingPrices.length > 0) {
      toast.error('Please enter fixed prices for all selected products');
      return;
    }

    // Add selected products to pricing
    const newPricing = selectedProductIds.map(productId => ({
      productId,
      fixedPrice: bulkFixedPrices[productId]
    }));

    setFormData({
      ...formData,
      customerProductPricing: [...formData.customerProductPricing, ...newPricing]
    });

    // Close modal and reset state
    setIsBulkPricingModalOpen(false);
    setSelectedBulkProducts(new Set());
    setBulkFixedPrices({});
    setBulkProductSearch('');
    toast.success('Bulk pricing added successfully');
  };

  // Helper function to get product name by ID
  const getProductName = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.name : `Product ID: ${productId}`;
  };

  // Helper function to get product base price
  const getProductBasePrice = (productId: number) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.price : 0;
  };

  // Filter products for bulk pricing modal
  const filteredBulkProducts = allProducts.filter(product => {
    const existingProductIds = formData.customerProductPricing.map(p => p.productId);
    const matchesSearch = product.name.toLowerCase().includes(bulkProductSearch.toLowerCase()) ||
      product.id.toString().includes(bulkProductSearch);
    return !existingProductIds.includes(product.id) && matchesSearch;
  });

  // Fetch hotel data
  const fetchHotel = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/admin/hotels/${id}`);
      if (response.data.success) {
        const hotelData = response.data.data.hotel;
        setHotel(hotelData);
        setFormData({
          hotelName: hotelData.hotelName,
          mobileNumber: hotelData.mobileNumber,
          address: hotelData.address,
          gstNumber: hotelData.gstNumber || "",
          creditLimit: hotelData.creditLimit.toString(),
          rateType: hotelData.rateType || "",
          contractDuration: hotelData.contractDuration || "",
          customerProductPricing: hotelData.customerProductPricing || [],
        });
      }
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      toast.error(error.response?.data?.message || "Failed to fetch customer");
      navigate("/admin/hotels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHotel = async () => {
    if (!hotel || !formData.hotelName || !formData.address) {
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
      await api.put(`/admin/hotels/${hotel.id}`, {
        hotelName: formData.hotelName,
        address: formData.address,
        gstNumber: formData.gstNumber || undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        rateType: formData.rateType || undefined,
        contractDuration: formData.contractDuration || undefined,
        customerProductPricing: formData.customerProductPricing || undefined,
      });
      toast.success("Customer updated successfully");
      navigate("/admin/hotels");
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.response?.data?.message || "Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchHotel();
  }, [id]);

  if (isLoading && !hotel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading customer data...</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/hotels")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Customer Account</h1>
          <p className="text-muted-foreground">Update customer information and pricing configuration.</p>
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
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              placeholder="e.g. 9876543210"
              value={formData.mobileNumber}
              disabled
              className="bg-muted"
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
              variant="default"
              size="sm"
              onClick={() => {
                setIsBulkPricingModalOpen(true);
                // Reset bulk pricing state
                setSelectedBulkProducts(new Set());
                setBulkFixedPrices({});
                setBulkProductSearch('');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Bulk Add Prices
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
          }}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button
          onClick={handleUpdateHotel}
          disabled={isLoading || (formData.rateType === 'Fixed Price' && (!formData.contractDuration || formData.customerProductPricing.length === 0))}
        >
          {isLoading ? "Updating..." : "Update Customer Account"}
        </Button>
      </div>

      {/* Product Selection Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent>
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

      {/* Bulk Pricing Modal */}
      <Dialog open={isBulkPricingModalOpen} onOpenChange={setIsBulkPricingModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Bulk Add Fixed Prices</DialogTitle>
            <DialogDescription>
              Select multiple products and set fixed prices for this customer
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh] overflow-hidden">
            {/* Left Panel - Product Selector */}
            <div className="flex flex-col border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium mb-2">Select Products</h3>
                <div className="relative">
                  <MoreHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={bulkProductSearch}
                    onChange={(e) => setBulkProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredBulkProducts.length > 0 ? (
                  <div className="divide-y">
                    {filteredBulkProducts.map(product => {
                      const isSelected = selectedBulkProducts.has(product.id);
                      return (
                        <div
                          key={product.id}
                          className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                          onClick={() => toggleBulkProductSelection(product.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBulkProductSelection(product.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">Base Price: ₹{product.price || 0}</p>
                            {product.description && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">{product.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No products available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Fixed Price Entry */}
            <div className="flex flex-col border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">Set Fixed Prices</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedBulkProducts.size} product(s) selected
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {selectedBulkProducts.size > 0 ? (
                  <div className="divide-y">
                    {Array.from(selectedBulkProducts).map(productId => {
                      const product = allProducts.find(p => p.id === productId);
                      if (!product) return null;
                      return (
                        <div key={productId} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">Base Price: ₹{product.price || 0}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBulkProductSelection(productId)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="mt-2">
                            <Label htmlFor={`price-${productId}`}>Fixed Price (₹)</Label>
                            <Input
                              id={`price-${productId}`}
                              type="number"
                              value={bulkFixedPrices[productId] || ''}
                              onChange={(e) => updateBulkFixedPrice(productId, parseFloat(e.target.value) || 0)}
                              className="mt-1"
                              min="0"
                              step="0.01"
                              placeholder="Enter fixed price"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select products from the left panel</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Selected: {selectedBulkProducts.size} products
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsBulkPricingModalOpen(false);
                  setSelectedBulkProducts(new Set());
                  setBulkFixedPrices({});
                  setBulkProductSearch('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={saveBulkPricing}
                disabled={selectedBulkProducts.size === 0 ||
                  Array.from(selectedBulkProducts).some(id => !bulkFixedPrices[id] || bulkFixedPrices[id] <= 0)}
              >
                Save Prices ({selectedBulkProducts.size})
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditCustomer;