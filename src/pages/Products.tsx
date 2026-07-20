import { useState, useRef, useEffect, useMemo, Fragment } from "react";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Upload, X, Image as ImageIcon, Folder, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEnterNavigation } from "@/hooks/useEnterNavigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import api from "@/api/axios";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { compressImageFile } from "@/utils/compressImage";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[];
}

// Types
type ProductStatus = 'active' | 'inactive' | 'archived';

interface Product {
  id: number;
  name: string;
  category: { id: number; name: string } | string;
  categoryId: number;
  subcategory?: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  isActive: boolean;
  image?: string; // Temporarily kept for base64 uploads
}

// Initial Data
const initialProducts: Product[] = [];

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith('data:')) return path; // Base64 images

  // Check if it's already a Cloudinary URL or other external URL
  if (path.startsWith('http')) {
    // If it's a Cloudinary URL, return as is
    if (path.includes('cloudinary.com')) {
      return path;
    }
    return path; // Return other full URLs as is
  }

  // Handle local file paths
  const cleanPath = path.replace(/^uploads\//, '').replace(/^\/uploads\//, '');
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isDev) {
    return `/uploads/${cleanPath}`;
  } else {
    // For production, derive the backend URL from the API's baseURL
    // Get the API base URL and extract the backend domain
    let apiBase = 'https://prk-smile-backend.onrender.com';

    // Try to get the actual API base URL from the imported api module
    try {
      if (api.defaults && api.defaults.baseURL) {
        const baseURL = api.defaults.baseURL;
        if (baseURL && !baseURL.startsWith('/')) {
          // If baseURL is a full URL, extract the origin
          const urlObj = new URL(baseURL);
          apiBase = `${urlObj.protocol}//${urlObj.host}`;
        } else if (baseURL === '/api') {
          // If using proxy, use the current host
          apiBase = `${window.location.protocol}//${window.location.host}`;
        }
      }
    } catch (e) {
      // Fallback to default if URL parsing fails
      console.warn('Could not parse API base URL, using default:', e);
    }

    return `${apiBase}/uploads/${cleanPath}`;
  }
};

const PriceInput = ({ product, onUpdate }: { product: Product, onUpdate: (id: number, price: number) => Promise<void> }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(product.price.toString());
  const hasChanged = parseFloat(value) !== product.price;

  useEffect(() => {
    setValue(product.price.toString());
  }, [product.price]);

  const handleSave = async () => {
    if (hasChanged) {
      await onUpdate(product.id, parseFloat(value));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(product.price.toString());
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        className="flex items-center gap-1 group/price cursor-pointer py-1 px-2 -ml-2 rounded hover:bg-muted/50 transition-colors inline-flex"
        onClick={() => setIsEditing(true)}
      >
        <span className="text-foreground font-semibold">₹{product.price}</span>
        <Edit className="w-3 h-3 text-muted-foreground opacity-0 group-hover/price:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 min-w-[140px] animate-in fade-in slide-in-from-left-2 duration-200">
      <span className="text-muted-foreground text-xs">₹</span>
      <Input
        type="number"
        value={value}
        autoFocus
        className="h-8 w-20 text-xs font-bold border-primary ring-1 ring-primary/20"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          else if (e.key === 'Escape') handleCancel();
        }}
      />
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
          onClick={handleSave}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-full"
          onClick={handleCancel}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
import { useSearchParams } from "react-router-dom";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategoryId = searchParams.get('category');

  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // To maintain counts in cards
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const emptyFormData = (): Omit<Product, 'id'> => ({
    name: "",
    category: "",
    categoryId: 0,
    subcategory: "",
    price: 0,
    unit: "kg",
    stock: 0,
    images: [],
    isActive: true,
    image: "",
  });

  const normalizeSavedProduct = (saved: Record<string, unknown>): Product => ({
    id: saved.id as number,
    name: saved.name as string,
    categoryId: saved.categoryId as number,
    category: (saved.category as Product['category']) || { id: saved.categoryId as number, name: "" },
    subcategory: (saved.subcategory as string) || undefined,
    price: Number(saved.price),
    unit: (saved.unit as string) || "kg",
    stock: Number(saved.stock ?? 0),
    images: (saved.images as string[]) || [],
    isActive: saved.isActive !== false,
  });

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<any>;
    if (axiosError?.response?.status === 413) {
      return "Image is too large. Please use a smaller photo (under 1 MB).";
    }
    if (!axiosError?.response && axiosError?.code === "ERR_NETWORK") {
      return "Upload failed — try a smaller image or check your connection.";
    }
    const apiMessage = axiosError?.response?.data?.message;
    const details = axiosError?.response?.data?.errors;
    const firstDetailMessage =
      Array.isArray(details) && details.length > 0
        ? details[0]?.message || details[0]
        : null;

    return firstDetailMessage || apiMessage || fallback;
  };

  // Filtering state
  const [filterCategory, setFilterCategory] = useState<number | null>(urlCategoryId ? parseInt(urlCategoryId) : null);
  const [filterSubcategory, setFilterSubcategory] = useState<string | null>(null);

  // Update filterCategory when URL changes
  useEffect(() => {
    if (urlCategoryId) {
      setFilterCategory(parseInt(urlCategoryId));
    }
  }, [urlCategoryId]);

  // Fetch Data
  const fetchProducts = async (subId?: string | null, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    try {
      const listUrl = subId
        ? `/admin/products/subcategory/${subId}?limit=1000`
        : "/admin/products?limit=1000";

      const requests: Promise<unknown>[] = [api.get(listUrl)];
      if (subId) {
        requests.push(api.get("/admin/products?limit=1000"));
      }

      const [listResponse, allResponse] = await Promise.all(requests);

      const listData = (listResponse as { data: { success: boolean; data: { products: Product[] } } }).data;
      if (listData.success) {
        setProducts(listData.data.products);
        if (!subId) {
          setAllProducts(listData.data.products);
        }
      }

      if (subId && allResponse) {
        const allData = (allResponse as { data: { success: boolean; data: { products: Product[] } } }).data;
        if (allData.success) {
          setAllProducts(allData.data.products);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (!options?.silent) {
        toast.error("Failed to fetch products");
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Only fetch from specific API if subcategory is selected
    fetchProducts(filterSubcategory);
  }, [filterSubcategory]);

  // Form State
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyFormData());

  const selectedCategoryObj = categories.find(c => c.id === formData.categoryId);
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  // Handlers
  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setFormData(emptyFormData());
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({ ...product });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenView = (product: Product) => {
    setCurrentProduct(product);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await api.delete(`/admin/products/${id}`);
        if (response.data.success) {
          toast.success("Product deleted");
          fetchProducts(filterSubcategory);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = (currentStatus === 'active' || currentStatus === 'active_legacy') ? 'out_of_stock' : 'active';
    try {
      const response = await api.put(`/admin/products/${id}`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Product is now ${newStatus === 'active' ? 'Active' : 'Out of Stock'}`);
        // Fetch products to refresh local state from server
        fetchProducts(filterSubcategory);
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      setImageFile(compressed);
      setFormData((prev) => ({
        ...prev,
        image: URL.createObjectURL(compressed),
      }));
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Could not process image. Try a smaller JPG or PNG.");
    } finally {
      e.target.value = "";
    }
  };

  const handlePriceUpdate = async (id: number, newPrice: number) => {
    try {
      const response = await api.patch(`/admin/products/${id}/price`, { price: newPrice });
      if (response.data.success) {
        toast.success("Price updated successfully");
        // Update local state to reflect the change
        setProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
        setAllProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Failed to update price");
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!currentProduct && !formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('category', formData.categoryId.toString());
      if (formData.subcategory) formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('stock', formData.stock.toString());
      formDataToSend.append('isActive', formData.isActive.toString());

      if (imageFile) {
        formDataToSend.append('images', imageFile, imageFile.name || 'product.jpg');
      }

      const uploadConfig = {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      };

      const response = currentProduct
        ? await api.put(`/admin/products/${currentProduct.id}`, formDataToSend, uploadConfig)
        : await api.post('/admin/products', formDataToSend, uploadConfig);

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to save product");
        return;
      }

      toast.success(currentProduct ? "Product updated" : "Product added");

      const saved = response.data.data;
      const savedProduct = saved ? normalizeSavedProduct(saved) : null;
      const newSubId = saved?.subcategory || null;

      if (savedProduct) {
        const upsertProduct = (list: Product[]) => {
          const exists = list.some((p) => p.id === savedProduct.id);
          return exists
            ? list.map((p) => (p.id === savedProduct.id ? savedProduct : p))
            : [savedProduct, ...list];
        };
        setProducts((prev) => upsertProduct(prev));
        setAllProducts((prev) => upsertProduct(prev));
      }

      if (!currentProduct && saved?.categoryId) {
        setFilterCategory(saved.categoryId);
      }

      if (newSubId !== filterSubcategory) {
        setFilterSubcategory(newSubId);
      } else {
        await fetchProducts(newSubId, { silent: true });
      }

      setFormData(emptyFormData());
      setImageFile(null);
      setCurrentProduct(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(getApiErrorMessage(error, "Failed to save product"));
    } finally {
      setIsSaving(false);
    }
  };

  // Enter key navigation hook
  const { formRef: productFormRef } = useEnterNavigation({
    onSubmit: handleSave,
    disabled: isSaving
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Note: If filterSubcategory is active, 'products' is already filtered by server
    // but if only filterCategory is active, we still do client-side filtering here
    const matchesCategory = filterCategory ? product.categoryId === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categoryStats = useMemo(() => {
    const stats: { [key: number]: number } = {};
    allProducts.forEach(p => {
      stats[p.categoryId] = (stats[p.categoryId] || 0) + 1;
    });
    return stats;
  }, [allProducts]);

  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: Product[] } = {};
    filteredProducts.forEach(product => {
      const categoryName = typeof product.category === 'string'
        ? product.category
        : (product.category?.name || 'Uncategorized');
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(product);
    });

    // Sort keys alphabetically
    const sortedGroups: { [key: string]: Product[] } = {};
    Object.keys(groups).sort().forEach(key => {
      // Also sort products within each group alphabetically
      sortedGroups[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    return sortedGroups;
  }, [filteredProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your grocery inventory, pricing, and availability</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div
          onClick={() => { setFilterCategory(null); setFilterSubcategory(null); }}
          className={cn(
            "relative mt-6 pt-8 pb-4 px-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 group active:scale-95",
            !filterCategory && !filterSubcategory
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
              : "border-border hover:border-primary/50 bg-card hover:shadow-xl hover:-translate-y-1"
          )}
        >
          <div className={cn(
            "absolute -top-5 left-1/2 -translate-x-1/2 p-2.5 rounded-full border-4 border-white dark:border-slate-950 transition-all group-hover:animate-bob z-10",
            !filterCategory && !filterSubcategory ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
          )}>
            <Folder className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1">All Items</span>
          <span className="text-2xl font-black tracking-tighter">{allProducts.length}</span>
        </div>
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            onClick={() => {
              if (filterCategory === cat.id) {
                setFilterCategory(null);
                setFilterSubcategory(null);
              } else {
                setFilterCategory(cat.id);
                setFilterSubcategory(null);
              }
            }}
            style={{ animationDelay: `${(index + 1) * 50}ms` }}
            className={cn(
              "relative mt-6 pt-8 pb-4 px-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 group animate-in fade-in slide-in-from-top-4 active:scale-95",
              filterCategory === cat.id
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                : "border-border hover:border-primary/50 bg-card hover:shadow-xl hover:-translate-y-1"
            )}
          >
            <div className={cn(
              "absolute -top-5 left-1/2 -translate-x-1/2 p-2.5 rounded-full border-4 border-white dark:border-slate-950 transition-all group-hover:animate-bob z-10",
              filterCategory === cat.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              <Folder className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground truncate w-full px-1 mt-1">{cat.name}</span>
            <span className="text-2xl font-black tracking-tighter">{categoryStats[cat.id] || 0}</span>
          </div>
        ))}
      </div>

      {(() => {
        const cat = categories.find(c => c.id === filterCategory);
        if (filterCategory && cat?.subcategories && cat.subcategories.length > 0) {
          return (
            <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-xl border border-dashed border-border animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!filterSubcategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSubcategory(null)}
                  className="rounded-full h-8 text-xs font-bold"
                >
                  All Subcategories
                </Button>
                {cat.subcategories.map(sub => (
                  <Button
                    key={sub.id}
                    variant={filterSubcategory === sub.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSubcategory(sub.id)}
                    className="rounded-full h-8 text-xs font-bold"
                  >
                    {sub.name}
                  </Button>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div key={`${filterCategory}-${filterSubcategory}`} className="dashboard-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Min Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-muted-foreground italic">Fetching items...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : Object.entries(groupedProducts).length > 0 ? (
                Object.entries(groupedProducts).map(([categoryName, items]) => (
                  <Fragment key={categoryName}>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-t-2 border-border/50 animate-in fade-in slide-in-from-left-4 duration-500">
                      <TableCell colSpan={7} className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground uppercase tracking-wider">{categoryName}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                            {items.length} {items.length === 1 ? 'Product' : 'Products'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {items.map((product, idx) => {
                      // Calculate a cumulative index for staggered animation across categories
                      // For simplicity, we just use the current group's index + some offset or just current index
                      // But better to just use current group index if we want it to feel like each group rolls in
                      return (
                        <TableRow
                          key={product.id}
                          style={{ animationDelay: `${Math.min(idx * 50, 1000)}ms` }}
                          className={cn(
                            "group transition-colors animate-roll-in",
                            !product.isActive ? 'opacity-60 bg-muted/20' : 'hover:bg-muted/10'
                          )}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {product.images && product.images.length > 0 ? (
                                <img src={getImageUrl(product.images[0])} alt={product.name} className="w-10 h-10 rounded-md object-cover ring-1 ring-border" />
                              ) : product.image ? (
                                <img src={getImageUrl(product.image)} alt={product.name} className="w-10 h-10 rounded-md object-cover ring-1 ring-border" />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center ring-1 ring-border">
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="group-hover:text-primary transition-colors">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground italic">
                            {typeof product.subcategory === 'string' ? (() => {
                              const cat = categories.find(c => c.id === product.categoryId);
                              const sub = cat?.subcategories?.find(s => s.id === product.subcategory);
                              return sub ? sub.name : product.subcategory;
                            })() : ''}
                          </TableCell>
                          <TableCell className="font-semibold px-2">
                            <PriceInput product={product} onUpdate={handlePriceUpdate} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            )}>
                              Min: {product.stock} {product.unit || 'Units'}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-1.5">
                              <Switch
                                checked={(product as any).status === 'active' || (product as any).status === 'active_legacy'}
                                onCheckedChange={() => handleToggleStatus(product.id, (product as any).status || 'active')}
                                className="scale-90"
                              />
                              {(product as any).status === 'out_of_stock' && (
                                <span className="text-[10px] font-bold text-destructive uppercase tracking-tight animate-pulse">Out of Stock</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenView(product)}>
                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Product
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      <p className="font-medium">{searchTerm || filterCategory ? 'No products match your current filters.' : 'Your inventory is currently empty.'}</p>
                      {(searchTerm || filterCategory) && (
                        <Button variant="link" size="sm" onClick={() => { setSearchTerm(""); setFilterCategory(null); setFilterSubcategory(null); }}>
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <form
            ref={productFormRef}
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex flex-col max-h-[90vh] min-h-0"
          >
            <DialogHeader className="px-6 pr-12 pt-6 pb-4 shrink-0 border-b">
              <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {currentProduct ? 'Make changes to the product here.' : 'Add a new grocery item to your inventory.'}
              </DialogDescription>
            </DialogHeader>
          <div className="grid gap-6 px-6 py-4 flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="image-upload">Upload Image</Label>
                <div className="border-2 border-dashed border-input rounded-lg w-full h-[120px] sm:h-[180px] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Click to upload</span>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload New Image
                </Button>
              </div>
              <div className="flex-[2] space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fresh Tomatoes"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category Name</Label>
                    <Select
                      value={formData.categoryId > 0 ? formData.categoryId.toString() : undefined}
                      onValueChange={(value) => {
                        const catId = Number(value);
                        const catObj = categories.find(c => c.id === catId);
                        setFormData({
                          ...formData,
                          categoryId: catId,
                          category: catObj?.name || "",
                          subcategory: ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subcategory">Subcategory Name</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                      disabled={!formData.categoryId || availableSubcategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={availableSubcategories.length === 0 ? "No subcategories" : "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Minimum Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="pc">Pc</SelectItem>
                        <SelectItem value="BOX">BOX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : (currentProduct ? 'Update Product' : 'Add Product')}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pr-12 pt-6 pb-4 shrink-0 border-b">
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <>
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted relative">
                  {currentProduct.images && currentProduct.images.length > 0 ? (
                    <img src={getImageUrl(currentProduct.images[0])} alt={currentProduct.name} className="w-full h-full object-cover" />
                  ) : currentProduct.image ? (
                    <img src={getImageUrl(currentProduct.image)} alt={currentProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold break-words">{currentProduct.name}</h3>
                  <p className="text-muted-foreground">
                    {typeof currentProduct.category === 'string' ? currentProduct.category : currentProduct.category?.name}
                  </p>
                  {currentProduct.subcategory && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {(() => {
                        const cat = categories.find(c => c.id === currentProduct.categoryId);
                        const sub = cat?.subcategories?.find(s => s.id === currentProduct.subcategory);
                        return sub ? sub.name : currentProduct.subcategory;
                      })()}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Price</span>
                    <p className="text-2xl font-bold text-primary">₹{currentProduct.price} <span className="text-sm font-normal text-muted-foreground">/ {currentProduct.unit || 'kg'}</span></p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Minimum Order Quantity</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium">{currentProduct.stock} {currentProduct.unit || 'units'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end shrink-0 border-t px-6 py-4 bg-background">
                <Button onClick={() => { setIsViewOpen(false); handleOpenEdit(currentProduct); }}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Product
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
