import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/axios';
import { Upload, X, Edit3, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Brand {
  id: number;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

const Brands: React.FC = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Fetch brands from API
  useEffect(() => {
    fetchBrands();
  }, []);

  // Cleanup preview when dialogs close
  useEffect(() => {
    if (!isOpen && !isEditOpen) {
      setBrandName('');
      setBrandImage(null);
      setPreviewUrl(null);
      setEditingBrand(null);
    }
  }, [isOpen, isEditOpen]);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/admin/brands');
      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch brands',
        variant: 'destructive'
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrandImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBrand = async () => {
    if (!brandName.trim()) {
      toast({
        title: 'Error',
        description: 'Brand name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!previewUrl) {
      toast({
        title: 'Error',
        description: 'Brand image is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const brandData = {
        name: brandName,
        imageUrl: previewUrl,
        description: ''
      };

      const response = await api.post('/admin/brands', brandData);
      
      if (response.data.success) {
        // Refresh the brands list
        await fetchBrands();
        
        // Reset form
        setBrandName('');
        setBrandImage(null);
        setPreviewUrl(null);
        setIsOpen(false);
        
        toast({
          title: 'Success',
          description: `Brand "${brandName}" added successfully`
        });
      }
    } catch (error: any) {
      console.error('Error adding brand:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add brand. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    // Show custom confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this brand?\n\nThis action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    setDeleteLoading(id);
    
    try {
      const response = await api.delete(`/admin/brands/${id}`);
      
      if (response.data.success) {
        // Refresh the brands list
        await fetchBrands();
        
        toast({
          title: 'Success',
          description: 'Brand deleted successfully',
          duration: 3000 // Auto-dismiss after 3 seconds
        });
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete brand',
        variant: 'destructive',
        duration: 5000 // Auto-dismiss after 5 seconds for errors
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditBrand = async (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setPreviewUrl(brand.imageUrl);
    setIsEditOpen(true);
  };

  const handleUpdateBrand = async () => {
    if (!brandName.trim()) {
      toast({
        title: 'Error',
        description: 'Brand name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!previewUrl) {
      toast({
        title: 'Error',
        description: 'Brand image is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const brandData = {
        name: brandName,
        imageUrl: previewUrl,
        description: ''
      };

      const response = await api.put(`/admin/brands/${editingBrand?.id}`, brandData);
      
      if (response.data.success) {
        // Refresh the brands list
        await fetchBrands();
        
        // Reset form
        setBrandName('');
        setBrandImage(null);
        setPreviewUrl(null);
        setEditingBrand(null);
        setIsEditOpen(false);
        
        toast({
          title: 'Success',
          description: `Brand "${brandName}" updated successfully`
        });
      }
    } catch (error: any) {
      console.error('Error updating brand:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update brand. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    
    // Handle base64 data URLs
    if (path.startsWith('data:')) return path;
    
    // Handle full HTTP/HTTPS URLs
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    
    // Handle blob URLs - these should not be sent to backend but if they are, return empty
    if (path.startsWith('blob:')) {
      console.warn('Blob URL detected, skipping:', path);
      return "";
    }
    
    // Handle relative paths and clean up any malformed URLs
    const cleanPath = path
      .replace(/^\/uploads\//, '')
      .replace(/^uploads\//, '')
      .replace(/\\/g, '/');
    
    // If path contains protocol-like patterns, it's likely malformed
    if (cleanPath.includes('://') || cleanPath.includes('blob:')) {
      console.warn('Malformed image path detected, skipping:', path);
      return "";
    }
    
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDev) {
      return `/uploads/${cleanPath}`;
    } else {
      // For production, derive the backend URL from the API's baseURL
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brands Management</h1>
          <p className="text-muted-foreground">Manage your brand catalog and branding assets.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsOpen(true)}
            >
              Add New Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>
                Enter the brand name and upload a logo for the new brand.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  placeholder="Enter brand name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brandImage">Brand Logo/Image</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative border-2 border-dashed border-border rounded-lg p-4 w-full sm:w-auto">
                    <input
                      id="brandImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-center py-8">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {previewUrl ? 'Click to change image' : 'Click to upload image'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                  
                  {previewUrl && (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Brand preview" 
                        className="w-24 h-24 object-contain rounded-lg border"
                        onError={(e) => {
                          // Handle broken image URLs gracefully
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Optionally show a fallback or error state
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          setBrandImage(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setBrandName('');
                    setBrandImage(null);
                    setPreviewUrl(null);
                    setIsOpen(false);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddBrand} 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Adding...' : 'Add Brand'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Brand Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Brand</DialogTitle>
              <DialogDescription>
                Update the brand name or logo as needed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editBrandName">Brand Name</Label>
                <Input
                  id="editBrandName"
                  placeholder="Enter brand name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editBrandImage">Brand Logo/Image</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative border-2 border-dashed border-border rounded-lg p-4 w-full sm:w-auto">
                    <input
                      id="editBrandImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-center py-8">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {previewUrl ? 'Click to change image' : 'Click to upload image'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                  
                  {previewUrl && (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Brand preview" 
                        className="w-24 h-24 object-contain rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          setBrandImage(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setBrandName('');
                    setBrandImage(null);
                    setPreviewUrl(null);
                    setEditingBrand(null);
                    setIsEditOpen(false);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateBrand} 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Updating...' : 'Update Brand'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brands List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <Card key={brand.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img 
                  src={getImageUrl(brand.imageUrl)} 
                  alt={brand.name} 
                  className="w-24 h-24 object-contain rounded-lg border mx-auto"
                  onError={(e) => {
                    // Handle broken image URLs gracefully
                    const target = e.target as HTMLImageElement;
                    // Hide the broken image
                    target.style.display = 'none';
                    // Create a fallback element
                    const fallback = document.createElement('div');
                    fallback.className = 'w-24 h-24 rounded-lg border mx-auto flex items-center justify-center bg-muted';
                    fallback.innerHTML = `<span class="text-muted-foreground text-xs">${brand.name.substring(0, 2).toUpperCase()}</span>`;
                    target.parentNode?.insertBefore(fallback, target.nextSibling);
                  }}
                  onLoad={(e) => {
                    // Restore visibility if image loads successfully
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'block';
                    // Remove fallback if it exists
                    const fallback = target.nextSibling as HTMLElement;
                    if (fallback?.className?.includes('bg-muted')) {
                      fallback.remove();
                    }
                  }}
                />
                <Badge className="absolute -top-2 -right-2 text-xs">
                  #{brand.id}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg text-foreground">{brand.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Created: {formatDate(brand.createdAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                Updated: {formatDate(brand.updatedAt)}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditBrand(brand)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteBrand(brand.id)}
                disabled={deleteLoading === brand.id}
              >
                {deleteLoading === brand.id ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>


    </div>
  );
};

export default Brands;