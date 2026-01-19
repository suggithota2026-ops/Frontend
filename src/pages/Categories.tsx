import { useState, useEffect } from "react";
import { Plus, FolderOpen, MoreHorizontal, Edit, Trash2, Search, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
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
  products: number;
  isActive: boolean;
  subcategories: Subcategory[];
}

const initialCategories: Category[] = [];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
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

  const handleOpenAdd = () => {
    setCurrentCategory(null);
    setFormData({ name: "", description: "", subcategories: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      subcategories: category.subcategories?.map(s => s.name).join(", ") || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await api.delete(`/admin/categories/${id}`);
        if (response.data.success) {
          toast.success("Category deleted");
          fetchCategories();
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name) return; // Basic validation
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subcategories', formData.subcategories);
      formDataToSend.append('isActive', 'true'); // Default for new categories, or add to form if needed

      let response;
      if (currentCategory) {
        response = await api.put(`/admin/categories/${currentCategory.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post("/admin/categories", formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        toast.success(currentCategory ? "Category updated" : "Category added");
        fetchCategories();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage your product classifications</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="dashboard-card !p-4 group hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenEdit(category)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground">{category.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                {category.description}
              </p>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(category.subcategories ?? []).slice(0, 3).map((sub) => (
                    <span key={sub.id} className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">
                      {sub.name}
                    </span>
                  ))}
                  {(category.subcategories?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{(category.subcategories?.length ?? 0) - 3}</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="w-3.5 h-3.5" />
                <span>{category.products || 0} Products</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${category.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              Create or modify a product category for your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vegetables"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategories">Subcategories</Label>
              <Input
                id="subcategories"
                value={formData.subcategories}
                onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                placeholder="e.g. Indian, Exotics, Leafy (comma separated)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of items in this category..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
