import { useState, useEffect, useRef } from "react";
import { Plus, MoreHorizontal, Trash2, Ban, CheckCircle, Search, Edit, ArrowLeft, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
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
import { DatePickerField } from "@/components/ui/date-picker-field";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/axios";

interface Hotel {
  id: number;
  hotelName: string;
  mobileNumber: string;
  address: string;
  city?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  gstNumber?: string;
  creditLimit: number;
  isBlocked: boolean;
  rateType?: string;
  pricePerUnit?: number;
  contractDuration?: string;
  customerProductPricing?: {
    id?: number;
    productId: number;
    productName?: string;
    fixedPrice: number;
    contractStartDate?: string;
    contractEndDate?: string;
    isActive?: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface CategoryOption {
  id: number;
  name: string;
  subcategories?: { id: string; name: string }[];
}

interface CatalogProduct {
  id: number;
  name: string;
  categoryId?: number;
}

const Hotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const hotelsFetchIdRef = useRef(0);
  const skipSearchDebounceRef = useRef(false);
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
    contractStartDate: "",
    contractEndDate: "",
    customerProductPricing: [],
  });

  // State for product selection modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [excelImportResultOpen, setExcelImportResultOpen] = useState(false);
  const [excelImportResult, setExcelImportResult] = useState<{
    title: string;
    summary: string;
    errors: string[];
    variant: "success" | "warning" | "error";
  } | null>(null);
  const [alreadyExistsOpen, setAlreadyExistsOpen] = useState(false);
  const [alreadyExistsMessage, setAlreadyExistsMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<Hotel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sameNameDialogOpen, setSameNameDialogOpen] = useState(false);
  const [sameNameMatches, setSameNameMatches] = useState<Hotel[]>([]);
  const [pendingExcelPricing, setPendingExcelPricing] = useState<{
    pricing: { productId: number; fixedPrice: number; productName?: string }[];
    successCount: number;
    updateCount: number;
    createdCount: number;
    failCount: number;
    errors: string[];
    duplicateNames: string[];
  } | null>(null);

  const toInputDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
      contractStartDate: "",
      contractEndDate: "",
      customerProductPricing: [],
    });
  };

  // Function to fetch all products
  const fetchAllProducts = async () => {
    try {
      const response = await api.get("/admin/products?limit=5000");
      if (response.data.success) {
        setAllProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const err = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Array<{ message?: string } | string>;
        };
      };
      message?: string;
    };
    const data = err?.response?.data;
    if (data?.message && data.message !== "Validation failed") {
      return data.message;
    }
    const firstErr = Array.isArray(data?.errors) ? data.errors[0] : null;
    if (firstErr) {
      if (typeof firstErr === "string") return firstErr;
      if (firstErr.message) return firstErr.message;
    }
    return data?.message || err?.message || fallback;
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
        productName: selectedProduct.name,
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
    const fromPricing = (formData.customerProductPricing || []).find(
      (p) => Number(p.productId) === Number(productId)
    );
    if (fromPricing?.productName) return fromPricing.productName;
    const product = allProducts.find((p) => p.id === productId);
    return product ? product.name : `Product ID: ${productId}`;
  };

  const normalizeHeader = (value: unknown) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

  const normalizeProductName = (value: string) =>
    String(value || "")
      .toLowerCase()
      .replace(/[()[\],./\\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getRowValue = (row: Record<string, unknown>, keys: string[]) => {
    const entries = Object.entries(row);
    for (const key of keys) {
      const match = entries.find(([header]) => normalizeHeader(header) === key);
      if (match && match[1] !== undefined && match[1] !== null && String(match[1]).trim() !== "") {
        return String(match[1]).trim();
      }
    }
    return "";
  };

  const resolveProductId = (
    productValue: string,
    products: CatalogProduct[] = allProducts,
    existingPricing: { productId: number; productName?: string }[] = []
  ) => {
    if (!productValue) return null;
    const asNumber = Number(productValue);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      const byId = products.find((p) => p.id === asNumber);
      if (byId) return byId.id;
      const byPricingId = existingPricing.find((p) => Number(p.productId) === asNumber);
      if (byPricingId) return byPricingId.productId;
    }

    const normalizedValue = normalizeProductName(productValue);

    // Prefer this customer's already-assigned contract rows (re-upload / same session)
    const fromExisting = existingPricing.find(
      (p) => p.productName && normalizeProductName(p.productName) === normalizedValue
    );
    if (fromExisting) return Number(fromExisting.productId);

    const exact = products.find(
      (p) => p.name.trim().toLowerCase() === productValue.trim().toLowerCase()
    );
    if (exact) return exact.id;

    const byNormalized = products.find(
      (p) => normalizeProductName(p.name) === normalizedValue
    );
    if (byNormalized) return byNormalized.id;

    const partialMatches = products.filter((p) => {
      const normalizedName = normalizeProductName(p.name);
      return (
        normalizedName.includes(normalizedValue) ||
        normalizedValue.includes(normalizedName)
      );
    });
    if (partialMatches.length === 1) return partialMatches[0].id;

    return null;
  };

  const resolveCategoryId = (categoryValue: string) => {
    if (!categoryValue) return null;
    const asNumber = Number(categoryValue);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      const byId = categories.find((c) => c.id === asNumber);
      if (byId) return byId.id;
    }
    const normalized = categoryValue.trim().toLowerCase();
    const byName = categories.find(
      (c) => c.name.trim().toLowerCase() === normalized
    );
    if (byName) return byName.id;

    const partialMatches = categories.filter((c) => {
      const catName = c.name.trim().toLowerCase();
      return catName.includes(normalized) || normalized.includes(catName);
    });
    if (partialMatches.length === 1) return partialMatches[0].id;

    return null;
  };

  const resolveSubcategory = (categoryId: number, subcategoryValue: string) => {
    if (!subcategoryValue) return null;
    const category = categories.find((c) => c.id === categoryId);
    const subs = category?.subcategories || [];
    if (subs.length === 0) return subcategoryValue;

    const byId = subs.find((s) => s.id === subcategoryValue);
    if (byId) return byId.id;

    const byName = subs.find(
      (s) => s.name.trim().toLowerCase() === subcategoryValue.trim().toLowerCase()
    );
    return byName?.id || null;
  };

  const createProductFromExcelRow = async (
    row: Record<string, unknown>,
    productsCache: CatalogProduct[]
  ) => {
    const name = getRowValue(row, ["name", "productname", "product"]);
    const categoryValue = getRowValue(row, ["category", "categoryid", "categoryname"]);
    const subcategoryValue = getRowValue(row, [
      "subcategory",
      "subcategoryid",
      "subcategoryname",
    ]);
    const priceValue = getRowValue(row, ["price", "fixedprice", "rate", "mrp"]);
    const unitValue = getRowValue(row, ["unit"]) || "kg";
    const minQuantityValue = getRowValue(row, [
      "minimumquantity",
      "minquantity",
      "minqty",
      "minimumqty",
      "stock",
    ]);

    const categoryId = resolveCategoryId(categoryValue);
    if (!categoryId) {
      throw new Error(`category "${categoryValue || "missing"}" not found`);
    }

    const price = Number(priceValue);
    if (Number.isNaN(price) || price < 0) {
      throw new Error("invalid price");
    }

    const minimumQuantity = minQuantityValue ? Number(minQuantityValue) : 0.5;
    if (Number.isNaN(minimumQuantity) || minimumQuantity < 0) {
      throw new Error("invalid minimumQuantity");
    }

    const subcategory = subcategoryValue
      ? resolveSubcategory(categoryId, subcategoryValue)
      : null;

    const formDataToSend = new FormData();
    formDataToSend.append("name", name);
    formDataToSend.append("category", categoryId.toString());
    if (subcategory) {
      formDataToSend.append("subcategory", String(subcategory));
    }
    formDataToSend.append("price", price.toString());
    formDataToSend.append("unit", unitValue);
    formDataToSend.append("stock", minimumQuantity.toString());
    formDataToSend.append("isActive", "true");
    // Do NOT send isContractOnly in body — live Joi rejects it.
    // Use query flag so newer backends can mark contract-only SKUs.

    const postProduct = async () =>
      api.post("/admin/products?contractOnly=1", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

    let response;
    try {
      response = await postProduct();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // Retry once after short wait on rate limit
      if (status === 429) {
        await new Promise((r) => setTimeout(r, 1500));
        response = await postProduct();
      } else {
        throw err;
      }
    }

    if (!response.data.success) {
      throw new Error(response.data.message || "failed to create product");
    }

    const created = response.data.data;
    const catalogProduct: CatalogProduct = {
      id: Number(created.id),
      name: created.name || name,
      categoryId: Number(created.categoryId || categoryId),
    };
    productsCache.push(catalogProduct);
    return catalogProduct.id;
  };

  const showExcelImportResult = (
    successCount: number,
    updateCount: number,
    createdCount: number,
    failCount: number,
    errors: string[]
  ) => {
    const importedTotal = successCount + updateCount;
    let variant: "success" | "warning" | "error" = "success";
    let title = "Excel import complete";
    let summary = "";

    if (importedTotal === 0) {
      variant = "error";
      title = "Excel import failed";
      summary = "No rows were imported.";
    } else if (failCount > 0) {
      variant = "warning";
      title = "Excel import completed with errors";
      summary = `Imported ${importedTotal} product(s) for fixed pricing (${createdCount} new product(s) created, ${updateCount} updated). ${failCount} row(s) failed.`;
    } else {
      summary = `Successfully imported ${importedTotal} product(s) (${createdCount} new, ${updateCount} updated).`;
    }

    setExcelImportResult({ title, summary, errors, variant });
    setExcelImportResultOpen(true);

    if (variant === "success") {
      toast.success(summary);
    } else if (variant === "warning") {
      toast.warning(summary);
    } else {
      toast.error(summary);
    }
  };

  const handleDownloadPricingExcelTemplate = () => {
    const sampleProduct = allProducts[0]?.name || "Tomato";
    const sampleProduct2 = allProducts[1]?.name || "Onion";
    const worksheet = XLSX.utils.json_to_sheet([
      {
        name: sampleProduct,
        category: "VEGETABLES",
        subcategory: "",
        price: 40,
        unit: "kg",
        minimumQuantity: 0.5,
      },
      {
        name: sampleProduct2,
        category: "VEGETABLES",
        subcategory: "",
        price: 30,
        unit: "kg",
        minimumQuantity: 1,
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Pricing");
    XLSX.writeFile(workbook, "customer-fixed-price-template.xlsx");
  };

  const applyExcelPricing = (
    pricing: { productId: number; fixedPrice: number; productName?: string }[],
    successCount: number,
    updateCount: number,
    createdCount: number,
    failCount: number,
    errors: string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      customerProductPricing: pricing,
    }));

    showExcelImportResult(successCount, updateCount, createdCount, failCount, errors);
  };

  const handlePricingExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const isValidExt = /\.(xlsx|xls|csv)$/i.test(file.name);
    if (!validTypes.includes(file.type) && !isValidExt) {
      toast.error("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    if (categories.length === 0) {
      await fetchCategories();
    }

    setIsExcelUploading(true);
    try {
      let productsCache = [...allProducts];
      if (productsCache.length === 0) {
        const response = await api.get("/admin/products?limit=5000");
        if (response.data.success) {
          productsCache = response.data.data.products || [];
          setAllProducts(productsCache);
        }
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        toast.error("Excel file has no sheets");
        return;
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        workbook.Sheets[firstSheetName],
        { defval: "" }
      );

      if (!rows.length) {
        toast.error("Excel file is empty");
        return;
      }

      let successCount = 0;
      let failCount = 0;
      let updateCount = 0;
      let createdCount = 0;
      const errors: string[] = [];
      const duplicateNames: string[] = [];
      const pricingMap = new Map<number, number>();
      const productNameById = new Map<number, string>();
      const existingPricing = formData.customerProductPricing || [];
      const existingIds = new Set(
        existingPricing.map((p) => Number(p.productId))
      );
      for (const p of existingPricing) {
        if (p.productName) {
          productNameById.set(Number(p.productId), p.productName);
        }
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;
        const productValue = getRowValue(row, [
          "name",
          "product",
          "productname",
          "productid",
        ]);
        const priceValue = getRowValue(row, [
          "price",
          "fixedprice",
          "rate",
          "mrp",
        ]);
        const categoryValue = getRowValue(row, ["category", "categoryid", "categoryname"]);

        if (!productValue && !priceValue) continue;

        if (!productValue || !priceValue) {
          failCount += 1;
          errors.push(
            `Row ${rowNumber}: required fields missing (${[
              !productValue ? "name" : "",
              !priceValue ? "price" : "",
            ]
              .filter(Boolean)
              .join(", ")})`
          );
          continue;
        }

        const fixedPrice = Number(priceValue);
        if (Number.isNaN(fixedPrice) || fixedPrice < 0) {
          failCount += 1;
          errors.push(`Row ${rowNumber}: invalid price`);
          continue;
        }

        let productId = resolveProductId(productValue, productsCache, [
          ...existingPricing,
          ...Array.from(productNameById.entries()).map(([id, productName]) => ({
            productId: id,
            productName,
          })),
        ]);

        if (!productId) {
          if (!categoryValue) {
            failCount += 1;
            errors.push(
              `Row ${rowNumber}: product "${productValue}" not found — add a category column to create it`
            );
            continue;
          }
          try {
            // Throttle creates (5 at a time) to avoid live rate-limit
            if (createdCount > 0 && createdCount % 5 === 0) {
              await new Promise((r) => setTimeout(r, 1200));
            } else if (createdCount > 0) {
              await new Promise((r) => setTimeout(r, 250));
            }
            productId = await createProductFromExcelRow(row, productsCache);
            createdCount += 1;
          } catch (createError) {
            failCount += 1;
            errors.push(
              `Row ${rowNumber}: product "${productValue}" — ${getApiErrorMessage(createError, "failed to create")}`
            );
            continue;
          }
        }

        productNameById.set(
          productId,
          productsCache.find((p) => p.id === productId)?.name || productValue
        );

        if (existingIds.has(productId)) {
          const name = getProductName(productId);
          if (!duplicateNames.includes(name)) duplicateNames.push(name);
          updateCount += 1;
        } else if (pricingMap.has(productId)) {
          updateCount += 1;
        } else {
          successCount += 1;
        }
        pricingMap.set(productId, fixedPrice);
      }

      const newPricing = Array.from(pricingMap.entries()).map(([productId, fixedPrice]) => ({
        productId,
        fixedPrice,
        productName: productNameById.get(productId) || getProductName(productId),
      }));

      if (duplicateNames.length > 0 && updateCount > 0) {
        setPendingExcelPricing({
          pricing: newPricing,
          successCount,
          updateCount,
          createdCount,
          failCount,
          errors,
          duplicateNames,
        });
        setAlreadyExistsMessage(
          `${duplicateNames.length} product(s) already exist in pricing${
            duplicateNames.length <= 5 ? `: ${duplicateNames.join(", ")}` : ""
          }. Do you want to update their fixed prices?`
        );
        setAlreadyExistsOpen(true);
        return;
      }

      applyExcelPricing(newPricing, successCount, updateCount, createdCount, failCount, errors);
    } catch (error) {
      console.error("Excel upload error:", error);
      toast.error("Failed to process Excel file");
    } finally {
      setIsExcelUploading(false);
    }
  };

  const handleConfirmAlreadyExists = () => {
    if (pendingExcelPricing) {
      applyExcelPricing(
        pendingExcelPricing.pricing,
        pendingExcelPricing.successCount,
        pendingExcelPricing.updateCount,
        pendingExcelPricing.createdCount,
        pendingExcelPricing.failCount,
        pendingExcelPricing.errors
      );
    }
    setPendingExcelPricing(null);
    setAlreadyExistsOpen(false);
  };

  const handleCancelAlreadyExists = () => {
    if (pendingExcelPricing) {
      const existingPricingMap = new Map<number, number>(
        (formData.customerProductPricing || []).map((p) => [
          Number(p.productId),
          Number(p.fixedPrice),
        ])
      );

      // Replacement behavior: contract should contain only Excel rows.
      // For products that already existed, keep the existing fixed price.
      const replacedPricing = pendingExcelPricing.pricing.map((p) => {
        const existingPrice = existingPricingMap.get(Number(p.productId));
        if (existingPrice == null || Number.isNaN(existingPrice)) return p;
        return { ...p, fixedPrice: existingPrice };
      });

      setFormData((prev) => ({
        ...prev,
        customerProductPricing: replacedPricing,
      }));

      toast.info("Excel imported. Existing prices were not changed.");
    }
    setPendingExcelPricing(null);
    setAlreadyExistsOpen(false);
  };

  // Fetch all products when component mounts
  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, []);

  // Debounce search so typing doesn't flood the API
  useEffect(() => {
    if (skipSearchDebounceRef.current) return;
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const mapApiHotel = (row: Partial<Hotel> & { id?: number }): Hotel => ({
    id: Number(row.id),
    hotelName: row.hotelName || "",
    mobileNumber: String(row.mobileNumber || ""),
    address: row.address || "",
    gstNumber: row.gstNumber || undefined,
    creditLimit: Number(row.creditLimit ?? 0),
    isBlocked: !!row.isBlocked,
    rateType: row.rateType || undefined,
    city: row.city,
    pinCode: row.pinCode,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
  });

  const applyHotelsResponse = (
    response: { data?: { success?: boolean; data?: { hotels?: Hotel[]; pagination?: Partial<typeof pagination> } } },
    prepend?: Hotel
  ) => {
    if (!response.data?.success) return;
    let nextHotels = (response.data.data?.hotels || []).map((h) => mapApiHotel(h));
    if (prepend?.id) {
      nextHotels = [prepend, ...nextHotels.filter((h) => h.id !== prepend.id)];
    }
    setHotels(nextHotels);

    const pg = response.data.data?.pagination;
    if (pg) {
      setPagination((prev) => ({
        page: Number(pg.page) || prev.page,
        limit: Number(pg.limit) || prev.limit,
        total: Number(pg.total) || 0,
        pages: Number(pg.pages) || 0,
      }));
    }
  };

  // Fetch hotels from API
  const fetchHotels = async (overrides?: { page?: number; search?: string; prepend?: Hotel }) => {
    const page = overrides?.page ?? pagination.page;
    const search = overrides?.search ?? debouncedSearchTerm;
    const fetchId = ++hotelsFetchIdRef.current;

    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: pagination.limit,
      };
      if (search) {
        params.search = search;
      }

      const response = await api.get("/admin/hotels", { params });
      // Ignore stale responses so an older request cannot wipe a newer list
      if (fetchId !== hotelsFetchIdRef.current) return;

      applyHotelsResponse(response, overrides?.prepend);
    } catch (error: any) {
      if (fetchId !== hotelsFetchIdRef.current) return;
      console.error("Error fetching customers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch customers");
    } finally {
      if (fetchId === hotelsFetchIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const refreshCustomerList = async (opts?: { prepend?: Hotel; keepSearch?: boolean }) => {
    skipSearchDebounceRef.current = true;
    if (!opts?.keepSearch) {
      setSearchTerm("");
      setDebouncedSearchTerm("");
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
    await fetchHotels({
      page: 1,
      search: opts?.keepSearch ? debouncedSearchTerm : "",
      prepend: opts?.prepend,
    });
    skipSearchDebounceRef.current = false;
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, debouncedSearchTerm]);

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

  const handleDelete = (id: number) => {
    const hotel = hotels.find((h) => h.id === id);
    if (!hotel) return;
    setHotelToDelete(hotel);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/admin/hotels/${hotelToDelete.id}`);
      toast.success("Customer deleted successfully");
      setDeleteDialogOpen(false);
      setHotelToDelete(null);
      fetchHotels();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete customer";

      if (errorMessage.includes("pending or active orders")) {
        toast.error(
          "Cannot delete customer with pending or active orders. Deliver or cancel all orders first, or use Block instead.",
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddHotel = async (options?: { skipSameNameCheck?: boolean }) => {
    if (!formData.hotelName || !formData.mobileNumber) {
      toast.error("Please fill in all required customer information fields");
      return;
    }

    if (!formData.rateType) {
      toast.error("Please select a rate type");
      return;
    }

    if (formData.rateType === 'Fixed Price') {
      if (!formData.contractStartDate || !formData.contractEndDate) {
        toast.error("Please select contract start and end dates for fixed price customers");
        return;
      }
      if (new Date(formData.contractStartDate) > new Date(formData.contractEndDate)) {
        toast.error("Contract start date must be before end date");
        return;
      }
    }

    if (formData.rateType === 'Fixed Price' && (!formData.customerProductPricing || formData.customerProductPricing.length === 0)) {
      toast.error("Please add at least one product for fixed price customers");
      return;
    }

    const normalizedMobile = (formData.mobileNumber || "").replace(/\D/g, "");
    if (normalizedMobile.length !== 10) {
      toast.error("Please enter correct mobile number");
      return;
    }

    const trimmedName = formData.hotelName.trim();

    setIsLoading(true);
    try {
      // Same name + different mobile is allowed as a separate customer.
      // Confirm once so the admin knows both will appear in the table.
      if (!options?.skipSameNameCheck) {
        try {
          const searchRes = await api.get("/admin/hotels", {
            params: { search: trimmedName, page: 1, limit: 50 },
          });
          const matches = (searchRes.data?.data?.hotels || []).filter(
            (h: Hotel) =>
              (h.hotelName || "").trim().toLowerCase() === trimmedName.toLowerCase() &&
              String(h.mobileNumber || "").replace(/\D/g, "") !== normalizedMobile
          );
          if (matches.length > 0) {
            setSameNameMatches(matches);
            setSameNameDialogOpen(true);
            setIsLoading(false);
            return;
          }
        } catch {
          // If name check fails, still allow create — uniqueness is by mobile only
        }
      }

      const response = await api.post("/admin/hotels", {
        hotelName: trimmedName,
        mobileNumber: normalizedMobile,
        address: formData.address?.trim(),
        gstNumber: formData.gstNumber ? formData.gstNumber.trim().toUpperCase() : undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        rateType: formData.rateType || undefined,
        contractDuration: formData.rateType === 'Fixed Price' ? 'Custom' : undefined,
        contractStartDate: formData.rateType === 'Fixed Price' ? formData.contractStartDate : undefined,
        contractEndDate: formData.rateType === 'Fixed Price' ? formData.contractEndDate : undefined,
        customerProductPricing:
          formData.rateType === "Fixed Price"
            ? (formData.customerProductPricing || []).map((p) => ({
                productId: Number(p.productId),
                fixedPrice: Number(p.fixedPrice),
              }))
            : undefined,
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to create customer");
        return;
      }

      const createdUser = response.data?.data?.user;
      toast.success(
        sameNameMatches.length > 0 || options?.skipSameNameCheck
          ? "Separate customer created successfully (same name, different mobile)"
          : "Customer created successfully"
      );
      setSameNameDialogOpen(false);
      setSameNameMatches([]);
      setShowAddForm(false);
      resetForm();

      const createdHotel = createdUser?.id
        ? mapApiHotel({
            ...createdUser,
            address: createdUser.address || formData.address,
            gstNumber: createdUser.gstNumber || formData.gstNumber || undefined,
            creditLimit: Number(createdUser.creditLimit ?? formData.creditLimit ?? 0),
            rateType: createdUser.rateType || formData.rateType,
          })
        : undefined;

      await refreshCustomerList({ prepend: createdHotel });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      const apiMsg = error.response?.data?.message;
      const details = error.response?.data?.errors;
      const firstDetail =
        Array.isArray(details) && details.length > 0
          ? details[0]?.message || details[0]
          : null;

      const detailText = typeof firstDetail === "string" ? firstDetail.toLowerCase() : "";
      const messageText = String(apiMsg || firstDetail || "").toLowerCase();

      if (messageText.includes("already exists")) {
        setPendingExcelPricing(null);
        setAlreadyExistsMessage(
          apiMsg || "A customer with this mobile number already exists."
        );
        setAlreadyExistsOpen(true);
      } else if (detailText.includes("mobilenumber")) {
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
    if (!currentHotel || !formData.hotelName) {
      toast.error("Please fill in all required customer information fields");
      return;
    }

    if (!formData.rateType) {
      toast.error("Please select a rate type");
      return;
    }

    if (formData.rateType === 'Fixed Price') {
      if (!formData.contractStartDate || !formData.contractEndDate) {
        toast.error("Please select contract start and end dates for fixed price customers");
        return;
      }
      if (new Date(formData.contractStartDate) > new Date(formData.contractEndDate)) {
        toast.error("Contract start date must be before end date");
        return;
      }
    }

    if (formData.rateType === 'Fixed Price' && (!formData.customerProductPricing || formData.customerProductPricing.length === 0)) {
      toast.error("Please add at least one product for fixed price customers");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(`/admin/hotels/${currentHotel.id}`, {
        hotelName: formData.hotelName,
        address: formData.address,
        gstNumber: formData.gstNumber || undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
        rateType: formData.rateType,
        ...(formData.rateType === "Fixed Price"
          ? {
              contractDuration: "Custom",
              contractStartDate: formData.contractStartDate,
              contractEndDate: formData.contractEndDate,
              customerProductPricing: (formData.customerProductPricing || []).map(
                (p) => ({
                  productId: Number(p.productId),
                  fixedPrice: Number(p.fixedPrice),
                })
              ),
            }
          : {
              // Explicitly clear Fixed contract when switching to Daily/Weekly
              customerProductPricing: [],
            }),
      });
      const savedRateType =
        response.data?.data?.rateType || formData.rateType;
      toast.success(`Customer updated (${savedRateType})`);
      setIsEditOpen(false);
      setCurrentHotel(null);
      resetForm();
      await fetchHotels();
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.response?.data?.message || "Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = async (hotel: Hotel) => {
    setCurrentHotel(hotel);
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/hotels/${hotel.id}`);
      const hotelData = response.data?.success ? response.data.data.hotel : hotel;
      const pricing = hotelData.customerProductPricing || [];
      setCurrentHotel({
        ...hotel,
        ...hotelData,
        address: hotelData.address || hotel.address,
        city: hotelData.city,
        pinCode: hotelData.pinCode,
        latitude: hotelData.latitude,
        longitude: hotelData.longitude,
      });
      setFormData({
        hotelName: hotelData.hotelName,
        mobileNumber: hotelData.mobileNumber,
        address: hotelData.address,
        gstNumber: hotelData.gstNumber || "",
        creditLimit: String(hotelData.creditLimit ?? ""),
        rateType: hotelData.rateType || "",
        contractDuration: "Custom",
        contractStartDate: toInputDate(pricing[0]?.contractStartDate),
        contractEndDate: toInputDate(pricing[0]?.contractEndDate),
        customerProductPricing: pricing,
      });
      setIsEditOpen(true);
    } catch (error: any) {
      console.error("Error loading customer pricing:", error);
      toast.error("Failed to load customer pricing");
    } finally {
      setIsLoading(false);
    }
  };

  // Get enter navigation refs
  const { addFormRef, editFormRef } = useHotelEnterNavigation(handleAddHotel, handleEditHotel, isLoading);

  return (
    <div className="space-y-6">
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={handlePricingExcelUpload}
      />
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
                  const value = e.target.value;
                  setSearchTerm(value);
                  setPagination((prev) =>
                    prev.page === 1 ? prev : { ...prev, page: 1 }
                  );
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
                  {isLoading && hotels.length === 0 ? (
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
                <Label htmlFor="address">Address</Label>
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
              <div
                className={
                  formData.rateType === "Fixed Price"
                    ? "grid gap-4 sm:grid-cols-3"
                    : "grid gap-2"
                }
              >
                <div className="grid gap-2">
                  <Label htmlFor="rateType">Rate Type *</Label>
                  <select
                    id="rateType"
                    value={formData.rateType}
                    onChange={(e) => {
                      const nextRateType = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        rateType: nextRateType,
                        ...(nextRateType !== "Fixed Price"
                          ? {
                              customerProductPricing: [],
                              contractStartDate: "",
                              contractEndDate: "",
                              contractDuration: "",
                            }
                          : {}),
                      }));
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Rate Type</option>
                    <option value="Daily Price">Daily Price</option>
                    <option value="Weekly Price">Weekly Price</option>
                    <option value="Fixed Price">Fixed Price</option>
                  </select>
                </div>

                {formData.rateType === "Fixed Price" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="contractStartDate">Contract Start Date *</Label>
                      <DatePickerField
                        id="contractStartDate"
                        value={formData.contractStartDate}
                        placeholder="Select start date"
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            contractStartDate: value,
                            contractDuration: "Custom",
                            contractEndDate:
                              formData.contractEndDate && formData.contractEndDate < value
                                ? ""
                                : formData.contractEndDate,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contractEndDate">Contract End Date *</Label>
                      <DatePickerField
                        id="contractEndDate"
                        value={formData.contractEndDate}
                        placeholder="Select end date"
                        min={formData.contractStartDate || undefined}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            contractEndDate: value,
                            contractDuration: "Custom",
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
              {formData.rateType === "Fixed Price" && (
                <p className="text-sm text-muted-foreground">
                  Fixed Price allows custom product pricing only for this customer.
                </p>
              )}
            </div>
          </div>

          {/* Product Pricing Section */}
          {formData.rateType === 'Fixed Price' && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>🧾</span>
                  Product Pricing (Customer-Specific)
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPricingExcelTemplate}
                    disabled={isExcelUploading}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => excelInputRef.current?.click()}
                    disabled={isExcelUploading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isExcelUploading ? "Uploading..." : "Upload Excel"}
                  </Button>
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
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  Prices set here apply only to this Fixed Price customer for the contract period. New products from Excel are contract-only and will not appear in the Daily/Weekly catalog. Upload Excel using template columns: <strong>name</strong>, <strong>category</strong>, <strong>subcategory</strong> (optional), <strong>price</strong>, <strong>unit</strong>, <strong>minimumQuantity</strong>. Missing products are created automatically (in small batches to avoid rate limits — large files may take a minute).
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
                  <p className="text-sm mt-2">Click "Add Product" or "Upload Excel" to set customer-specific pricing</p>
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
              disabled={
                isLoading ||
                isExcelUploading ||
                (formData.rateType === 'Fixed Price' &&
                  (!formData.contractStartDate ||
                    !formData.contractEndDate ||
                    formData.customerProductPricing.length === 0))
              }
            >
              {isExcelUploading
                ? "Uploading Excel..."
                : isLoading
                  ? "Creating..."
                  : "Create Customer Account"}
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Main Street, Mumbai, MH"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                {currentHotel?.city || currentHotel?.latitude != null ? (
                  <p className="text-xs text-muted-foreground">
                    {[
                      currentHotel?.city,
                      currentHotel?.pinCode,
                      currentHotel?.latitude != null && currentHotel?.longitude != null
                        ? `GPS: ${Number(currentHotel.latitude).toFixed(5)}, ${Number(currentHotel.longitude).toFixed(5)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
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
                <div
                  className={
                    formData.rateType === "Fixed Price"
                      ? "grid gap-4 sm:grid-cols-3"
                      : "grid gap-2"
                  }
                >
                  <div className="grid gap-2">
                    <Label htmlFor="edit-rateType">Rate Type *</Label>
                    <select
                      id="edit-rateType"
                      value={formData.rateType}
                      onChange={(e) => {
                        const nextRateType = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          rateType: nextRateType,
                          ...(nextRateType !== "Fixed Price"
                            ? {
                                customerProductPricing: [],
                                contractStartDate: "",
                                contractEndDate: "",
                                contractDuration: "",
                              }
                            : {}),
                        }));
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Rate Type</option>
                      <option value="Daily Price">Daily Price</option>
                      <option value="Weekly Price">Weekly Price</option>
                      <option value="Fixed Price">Fixed Price (Contract Based)</option>
                    </select>
                  </div>

                  {formData.rateType === "Fixed Price" && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-contractStartDate">Contract Start Date *</Label>
                        <DatePickerField
                          id="edit-contractStartDate"
                          value={formData.contractStartDate}
                          placeholder="Select start date"
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              contractStartDate: value,
                              contractDuration: "Custom",
                              contractEndDate:
                                formData.contractEndDate && formData.contractEndDate < value
                                  ? ""
                                  : formData.contractEndDate,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-contractEndDate">Contract End Date *</Label>
                        <DatePickerField
                          id="edit-contractEndDate"
                          value={formData.contractEndDate}
                          placeholder="Select end date"
                          min={formData.contractStartDate || undefined}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              contractEndDate: value,
                              contractDuration: "Custom",
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
                {formData.rateType === "Fixed Price" && (
                  <p className="text-sm text-muted-foreground">
                    Fixed Price allows custom product pricing only for this customer.
                  </p>
                )}
              </div>
            </div>

            {/* Product Pricing Section */}
            {formData.rateType === 'Fixed Price' && (
              <div className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span>🧾</span>
                    Product Pricing (Customer-Specific)
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPricingExcelTemplate}
                      disabled={isExcelUploading}
                      className="gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Template
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => excelInputRef.current?.click()}
                      disabled={isExcelUploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isExcelUploading ? "Uploading..." : "Upload Excel"}
                    </Button>
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
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Prices set here apply only to this Fixed Price customer for the contract period. New products from Excel are contract-only and will not appear in the Daily/Weekly catalog. Upload Excel using template columns: <strong>name</strong>, <strong>category</strong>, <strong>subcategory</strong> (optional), <strong>price</strong>, <strong>unit</strong>, <strong>minimumQuantity</strong>. Missing products are created automatically (in small batches to avoid rate limits — large files may take a minute).
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
                    <p className="text-sm mt-2">Click "Add Product" or "Upload Excel" to set customer-specific pricing</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4 bg-background">
            <Button variant="outline" onClick={() => {
              if (isExcelUploading) return;
              setIsEditOpen(false);
              setCurrentHotel(null);
            }} disabled={isLoading || isExcelUploading}>Cancel</Button>
            <Button
              type="submit"
              onClick={handleEditHotel}
              disabled={
                isLoading ||
                isExcelUploading ||
                (formData.rateType === 'Fixed Price' &&
                  (!formData.contractStartDate ||
                    !formData.contractEndDate ||
                    formData.customerProductPricing.length === 0))
              }
            >
              {isExcelUploading
                ? "Uploading Excel..."
                : isLoading
                  ? "Updating..."
                  : "Update Account"}
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

      <AlertDialog
        open={sameNameDialogOpen}
        onOpenChange={(open) => {
          setSameNameDialogOpen(open);
          if (!open) setSameNameMatches([]);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Same customer name found</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  A customer named{" "}
                  <span className="font-semibold text-foreground">
                    {formData.hotelName.trim()}
                  </span>{" "}
                  already exists with a different mobile number.
                </p>
                <div className="rounded-md border bg-muted/40 p-3 space-y-1">
                  {sameNameMatches.slice(0, 5).map((h) => (
                    <p key={h.id}>
                      <span className="font-medium text-foreground">{h.hotelName}</span>
                      {" — "}
                      {h.mobileNumber}
                    </p>
                  ))}
                  {sameNameMatches.length > 5 && (
                    <p>and {sameNameMatches.length - 5} more…</p>
                  )}
                </div>
                <p>
                  Because the mobile number is different, this will be created as a{" "}
                  <span className="font-medium text-foreground">separate customer</span>{" "}
                  and both will appear in the customer table.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                handleAddHotel({ skipSameNameCheck: true });
              }}
            >
              {isLoading ? "Creating..." : "Create separate customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setDeleteDialogOpen(open);
          if (!open) setHotelToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Customer Account?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Customer:{" "}
                  <span className="font-semibold text-foreground">
                    {hotelToDelete?.hotelName}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-foreground">NOTE:</span> Customers with
                  pending, confirmed, or dispatched orders cannot be deleted. Hotels with
                  only delivered or cancelled orders can be deleted.
                </p>
                <p>
                  If this customer has active orders, consider{" "}
                  <span className="font-medium text-foreground">blocking</span> instead of
                  deleting.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={excelImportResultOpen} onOpenChange={setExcelImportResultOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{excelImportResult?.title || "Excel import result"}</DialogTitle>
            <DialogDescription className="text-left whitespace-pre-wrap break-words">
              {excelImportResult?.summary}
            </DialogDescription>
          </DialogHeader>
          {excelImportResult?.errors && excelImportResult.errors.length > 0 && (
            <div className="flex-1 min-h-0 overflow-y-auto rounded-md border bg-muted/40 p-3 max-h-64">
              <p className="text-sm font-medium mb-2">Details:</p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {excelImportResult.errors.map((err, idx) => (
                  <li key={`${err}-${idx}`} className="break-words">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setExcelImportResultOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alreadyExistsOpen} onOpenChange={setAlreadyExistsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingExcelPricing ? "Product already exists" : "Customer already exists"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alreadyExistsMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {pendingExcelPricing ? (
              <>
                <AlertDialogCancel
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancelAlreadyExists();
                  }}
                >
                  Keep existing
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirmAlreadyExists();
                  }}
                >
                  Update prices
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => setAlreadyExistsOpen(false)}>
                OK
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
