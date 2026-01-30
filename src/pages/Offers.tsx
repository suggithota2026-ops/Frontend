import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEnterNavigation } from "@/hooks/useEnterNavigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Calendar as CalendarIcon,
  Percent as PercentIcon,
  Tag as TagIcon,
  Clock as ClockIcon,
  DollarSign as DollarIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

interface Offer {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  title?: string;
  description?: string;
  metadata?: {
    offerTitle?: string;
    offerDescription?: string;
    categoryIds?: number[];
    subcategoryNames?: string[];
    originalValidUntil?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

const Offers: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/offers-admin');

        if (response.data.success) {
          const offersData = response.data.data?.offers || [];
          setOffers(offersData);
          setFilteredOffers(offersData);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch offers. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [token, toast]);

  // Filter offers based on search term and status
  useEffect(() => {
    let result = offers;

    if (searchTerm) {
      result = result.filter(offer =>
        offer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.metadata?.offerTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.metadata?.offerDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(offer =>
        filterStatus === 'active' ? offer.isActive : !offer.isActive
      );
    }

    setFilteredOffers(result);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, offers]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filteredOffers ?? []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((filteredOffers?.length ?? 0) / itemsPerPage);

  const handleEdit = (offer: Offer) => {
    setCurrentOffer(offer);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (offer: Offer) => {
    setCurrentOffer(offer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentOffer || !token) return;

    try {
      const response = await api.delete(`/admin/offers-admin/${currentOffer.id}`);

      if (response.data.success) {
        // Update local state to remove the offer
        const updatedOffers = offers.filter(offer => offer.id !== currentOffer.id);
        setOffers(updatedOffers);
        setFilteredOffers(updatedOffers);

        toast({
          title: 'Offer deleted',
          description: `Offer "${currentOffer.code}" has been deleted successfully.`,
        });
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentOffer(null);
    }
  };

  const handleSaveChanges = async (updatedOffer: Offer) => {
    try {
      // Ensure we use the offers-admin endpoint
      const response = await api.put(`/admin/offers-admin/${updatedOffer.id}`, updatedOffer);

      if (response.data.success) {
        // Update local state
        const updatedOffers = offers.map(offer =>
          offer.id === updatedOffer.id ? updatedOffer : offer
        );
        setOffers(updatedOffers);

        toast({
          title: 'Offer updated',
          description: `Offer "${updatedOffer.code}" has been updated successfully.`,
        });
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEditDialogOpen(false);
      setCurrentOffer(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysRemaining = (validUntil: string) => {
    const now = new Date();
    const endDate = new Date(validUntil);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Offers Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage promotional offers and discounts for your customers
            </p>
          </div>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Offer
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium mb-2">
                  Search Offers
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by code, title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2">
                  Status
                </label>
                <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Offers ({filteredOffers?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(currentItems && currentItems.length > 0) ? (
                        currentItems.map((offer) => {
                          const daysRemaining = calculateDaysRemaining(offer.validUntil);

                          return (
                            <TableRow key={offer.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                                  {offer.code}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{offer.title || offer.metadata?.offerTitle || offer.code}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {offer.description || offer.metadata?.offerDescription}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {offer.discountType === 'percentage' ? (
                                    <PercentIcon className="h-4 w-4" />
                                  ) : (
                                    <DollarIcon className="h-4 w-4" />
                                  )}
                                  <span>
                                    {offer.discountType === 'percentage'
                                      ? `${offer.discountValue}%`
                                      : `₹${offer.discountValue}`}
                                  </span>
                                </div>
                                {offer.minOrderAmount && (
                                  <div className="text-xs text-muted-foreground">
                                    Min: ₹{offer.minOrderAmount}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>{formatDate(offer.validFrom)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <ClockIcon className="h-3 w-3" />
                                    <span>to {formatDate(offer.validUntil)}</span>
                                  </div>
                                  <Badge
                                    variant={daysRemaining > 7 ? 'secondary' : daysRemaining > 0 ? 'default' : 'destructive'}
                                    className="mt-1 w-fit"
                                  >
                                    {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  Used: {offer.usedCount}/{offer.usageLimit || '∞'}
                                </div>
                                {offer.usageLimit && (
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          (offer.usedCount / offer.usageLimit) * 100,
                                          100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                                  {offer.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(offer)}
                                  >
                                    <EditIcon className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(offer)}
                                      >
                                        <DeleteIcon className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the offer "{offer.code}" and remove all associated data.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={confirmDelete}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No offers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {indexOfFirstItem + 1} to{' '}
                      {Math.min(indexOfLastItem, filteredOffers?.length || 0)} of{' '}
                      {filteredOffers?.length || 0} offers
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Offer Dialog */}
      {currentOffer && (
        <EditOfferDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          offer={currentOffer}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

// Edit Offer Dialog Component
interface EditOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer;
  onSave: (updatedOffer: Offer) => void;
}

const EditOfferDialog: React.FC<EditOfferDialogProps> = ({
  isOpen,
  onClose,
  offer,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Offer>(offer);

  useEffect(() => {
    setFormData(offer);
  }, [offer]);

  const handleChange = (field: keyof Offer, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSave(formData);
      toast({
        title: 'Success',
        description: 'Offer updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update offer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Wrapper function for Enter navigation
  const handleSaveWrapper = () => {
    const event = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(event);
  };

  // Enter key navigation hook
  const { formRef: editOfferFormRef } = useEnterNavigation({
    onSubmit: handleSaveWrapper,
    disabled: false
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Offer</DialogTitle>
        </DialogHeader>

        <form ref={editOfferFormRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <Select
                value={formData.discountType}
                onValueChange={(value: 'percentage' | 'fixed') => handleChange('discountType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => handleChange('discountValue', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={formData.isActive.toString()}
                onValueChange={(value) => handleChange('isActive', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <Input
                type="datetime-local"
                value={formData.validFrom.substring(0, 16)}
                onChange={(e) => handleChange('validFrom', e.target.value + ':00.000Z')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <Input
                type="date"
                value={formData.validUntil ? formData.validUntil.substring(0, 10) : ''}
                onChange={(e) => handleChange('validUntil', e.target.value + 'T23:59:59.000Z')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min Order Amount</label>
              <Input
                type="number"
                value={formData.minOrderAmount || ''}
                onChange={(e) => handleChange('minOrderAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Discount Amount</label>
              <Input
                type="number"
                value={formData.maxDiscountAmount || ''}
                onChange={(e) => handleChange('maxDiscountAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit</label>
              <Input
                type="number"
                value={formData.usageLimit || ''}
                onChange={(e) => handleChange('usageLimit', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={formData.metadata?.offerTitle || ''}
              onChange={(e) => {
                const newMetadata = {
                  ...formData.metadata,
                  offerTitle: e.target.value
                };
                handleChange('metadata', newMetadata);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={formData.metadata?.offerDescription || ''}
              onChange={(e) => {
                const newMetadata = {
                  ...formData.metadata,
                  offerDescription: e.target.value
                };
                handleChange('metadata', newMetadata);
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Offers;