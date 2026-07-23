import { useState, useEffect } from "react";
import { Plus, FolderOpen, MoreHorizontal, Edit, Trash2, Search, Package, ChevronRight, LayoutGrid, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useEnterNavigation } from "@/hooks/useEnterNavigation";
import { compressImageFile } from "@/utils/compressImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image?: string | null;
  products: number;
  isActive: boolean;
  subcategories: Subcategory[];
}

const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("blob:") || path.startsWith("http")) {
    return path;
  }
  const cleanPath = path.replace(/^uploads\//, "").replace(/^\/uploads\//, "");
  return `/uploads/${cleanPath}`;
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subcategories: "",
  });

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

  const resetDialogState = () => {
    setFormData({ name: "", description: "", subcategories: "" });
    setImageFile(null);
    setImagePreview("");
  };

  const handleOpenAdd = () => {
    setCurrentCategory(null);
    resetDialogState();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      subcategories: category.subcategories?.map(s => s.name).join(", ") || "",
    });
    setImageFile(null);
    setImagePreview(getImageUrl(category.image));
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Could not process image. Try a smaller JPG or PNG.");
    } finally {
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category? All associated products will also be deleted.")) {
      try {
        const response = await api.delete(`/admin/categories/${id}`);
        if (response.data.success) {
          toast.success("Category and its products deleted");
          fetchCategories();
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("subcategories", formData.subcategories);
      formDataToSend.append("isActive", "true");

      if (imageFile) {
        formDataToSend.append("image", imageFile, imageFile.name || "category.jpg");
      }

      const uploadConfig = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      const response = currentCategory
        ? await api.put(`/admin/categories/${currentCategory.id}`, formDataToSend, uploadConfig)
        : await api.post("/admin/categories", formDataToSend, uploadConfig);

      if (response.data.success) {
        toast.success(currentCategory ? "Category updated" : "Category added");
        fetchCategories();
        setIsDialogOpen(false);
        resetDialogState();
      }
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const { formRef: categoryFormRef } = useEnterNavigation({
    onSubmit: handleSave,
    disabled: isLoading,
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize and manage your product catalog efficiently.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 w-full sm:w-auto shadow-lg hover:shadow-primary/20 transition-all">
          <Plus className="w-5 h-5" />
          Create Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by category name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-card border-border/50 focus:border-primary/50 transition-all"
            />
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <span className="text-2xl font-bold text-primary">{categories.length}</span>
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              className="group relative bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  {category.image ? (
                    <img
                      src={getImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderOpen className="w-6 h-6 text-primary" />
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-border/60 bg-background text-foreground hover:bg-muted hover:text-foreground shadow-sm"
                    >
                      <MoreHorizontal className="w-5 h-5 text-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleOpenEdit(category)} className="cursor-pointer text-foreground">
                      <Edit className="w-4 h-4 mr-2" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">{category.name}</h3>
                  <span className={`h-2 w-2 rounded-full ${category.isActive ? "bg-green-500 animate-pulse" : "bg-muted"}`} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed">
                  {category.description || "No description provided."}
                </p>

                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {category.subcategories.slice(0, 2).map((sub) => (
                      <span key={sub.id} className="bg-muted/50 border border-border/50 px-2 py-0.5 rounded-md text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {sub.name}
                      </span>
                    ))}
                    {category.subcategories.length > 2 && (
                      <span className="text-[10px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md self-center">
                        +{category.subcategories.length - 2} MORE
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all cursor-pointer group/stat"
                  onClick={() => navigate(`/admin/products?category=${category.id}`)}
                >
                  <Package className="w-4 h-4 group-hover/stat:scale-125 transition-transform" />
                  <span className="text-xs font-bold">{category.products || 0} Products</span>
                  <ChevronRight className="w-3 h-3 ml-0.5 opacity-0 -translate-x-2 group-hover/stat:opacity-100 group-hover/stat:translate-x-0 transition-all" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${category.isActive ? "text-green-500" : "text-muted-foreground"}`}>
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card/30 border border-dashed border-border rounded-3xl animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No Categories Found</h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-center px-4">
            {searchTerm ? `We couldn't find any categories matching "${searchTerm}"` : "Get started by creating your first product category."}
          </p>
          {!searchTerm && (
            <Button onClick={handleOpenAdd} variant="outline" className="mt-8 gap-2 border-primary/20 hover:bg-primary/5">
              <Plus className="w-4 h-4" />
              Initial Setup
            </Button>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetDialogState();
      }}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl">
          <form ref={categoryFormRef}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{currentCategory ? "Edit Category" : "Create Category"}</DialogTitle>
              <DialogDescription>
                Organization helps customers find products faster.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="category-image-upload" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                  Category Picture
                  <span className="text-[10px] font-normal normal-case opacity-60 italic">Optional</span>
                </Label>
                <div className="border-2 border-dashed border-input rounded-lg w-full h-[140px] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                  <Input
                    id="category-image-upload"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Category preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Click to upload picture (optional)</span>
                    </>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Vegetables"
                  className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subcategories" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                  Subcategories
                  <span className="text-[10px] font-normal normal-case opacity-60 italic">Comma separated</span>
                </Label>
                <Input
                  id="subcategories"
                  value={formData.subcategories}
                  onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                  placeholder="e.g. Leafy, Roots, Exotics"
                  className="h-11 bg-muted/30 border-none focus-visible:ring-primary/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What kinds of products belong here?"
                  className="min-h-[100px] bg-muted/30 border-none focus-visible:ring-primary/30 resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading} className="font-semibold px-8 text-foreground">Cancel</Button>
              <Button type="submit" onClick={handleSave} disabled={isLoading} className="font-bold px-8 shadow-lg shadow-primary/20">
                {isLoading ? "Processing..." : (currentCategory ? "Update" : "Save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
