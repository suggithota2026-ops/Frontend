import { useState, useEffect } from "react";
import { Bell, Send, Tag, Users, AlertTriangle, CheckCircle2, ShoppingCart, Settings, XCircle, Package, Loader2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/api/axios";

const notificationSettings = [
  { id: "new_order", label: "New Order Received", description: "Get notified immediately when a hotel places an order.", enabled: true },
  { id: "order_cancelled", label: "Order Cancelled", description: "Notify when a customer cancels an ongoing order.", enabled: true },
  { id: "low_stock", label: "Low Stock Alert", description: "Alert when product inventory drops below threshold.", enabled: true },
  { id: "review_received", label: "New Product Review", description: "Get notified when a product receives a new review.", enabled: false },
  { id: "daily_report", label: "Daily Sales Report", description: "Receive a summary of daily sales at 8 PM.", enabled: false },
];

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("alerts");
  const [settings, setSettings] = useState(notificationSettings);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedSubcategoryNames, setSelectedSubcategoryNames] = useState<string[]>([]);
  const [offerData, setOfferData] = useState({
    title: "",
    discountType: "percentage" as "percentage" | "flat",
    discountValue: "",
    validUntil: "",
    description: ""
  });
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersPagination, setOffersPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchNotifications();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!offerData.title.trim()) {
        toast.error("Offer title is required");
        return;
      }
      
      if (!offerData.description.trim()) {
        toast.error("Offer description is required");
        return;
      }
      
      if (!offerData.validUntil) {
        toast.error("Valid until date is required");
        return;
      }
      
      // Validate date format
      const dateObj = new Date(offerData.validUntil);
      if (isNaN(dateObj.getTime())) {
        toast.error("Valid until date is not valid");
        return;
      }
      
      // Validate discount value before sending
      const discountValue = parseFloat(offerData.discountValue);
      if (isNaN(discountValue) || discountValue <= 0) {
        toast.error("Discount value must be a valid positive number");
        return;
      }
      
      let response;
      
      if (editingOfferId) {
        // Update existing offer
        response = await api.put(`/admin/offers-admin/${editingOfferId}`, {
          title: offerData.title,
          description: offerData.description,
          discountType: offerData.discountType,
          discountValue,
          validUntil: offerData.validUntil, // Keep original format from date input
          categoryIds: selectedCategoryIds,
          subcategoryNames: selectedSubcategoryNames
        });
      } else {
        // Create new offer
        response = await api.post('/admin/notifications/promotional-offer', {
          title: offerData.title,
          description: offerData.description,
          discountType: offerData.discountType,
          discountValue,
          validUntil: offerData.validUntil, // Keep original format from date input
          categoryIds: selectedCategoryIds,
          subcategoryNames: selectedSubcategoryNames
        });
      }
      
      if (response.data.success) {
        const message = editingOfferId ? "Promotional offer updated successfully!" : "Promotional offer pushed successfully!";
        toast.success(message);
        
        // Reset form
        setOfferData({
          title: "",
          discountType: "percentage",
          discountValue: "",
          validUntil: "",
          description: ""
        });
        setSelectedCategoryIds([]);
        setSelectedSubcategoryNames([]);
        setEditingOfferId(null); // Clear editing state
        
        // Refresh the offers list
        if (activeTab === 'offers') {
          fetchOffers(offersPagination.page);
        }
      }
    } catch (error: any) {
      console.error('Error with promotional offer:', error);
      
      // Check if it's an Axios error with response data
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || "Failed to process promotional offer";
        toast.error(`Failed to process promotional offer: ${errorMessage}`);
      } else {
        toast.error("Failed to process promotional offer");
      }
    }
  };

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success("Notification preference updated");
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await api.put(`/admin/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ));
        toast.success("Notification marked as read");
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error("Failed to update notification");
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, { status: 'confirmed' });
      if (response.data.success) {
        toast.success("Order confirmed successfully!");
        setIsDialogOpen(false);
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error("Failed to confirm order");
    }
  };

  const fetchOffers = async (page = 1) => {
    try {
      setOffersLoading(true);
      const response = await api.get('/admin/offers-admin', {
        params: {
          page,
          limit: 10
        }
      });
      
      if (response.data.success) {
        setOffers(response.data.data.offers);
        setOffersPagination({
          page: response.data.data.pagination.page,
          totalPages: response.data.data.pagination.pages,
          total: response.data.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error("Failed to load offers");
    } finally {
      setOffersLoading(false);
    }
  };

  // Update the active tab effect to fetch offers when switching to offers tab
  useEffect(() => {
    if (activeTab === 'offers') {
      fetchOffers();
    }
  }, [activeTab]);

  const handleEditOffer = (offer: any) => {
    // Set the offer data to the form for editing
    setOfferData({
      title: offer.title || offer.code,
      discountType: offer.discountType as "percentage" | "flat",
      discountValue: offer.discountValue.toString(),
      validUntil: offer.originalValidUntil || offer.validUntil.split('T')[0], // Use original date or convert to date format
      description: offer.description || ''
    });
    
    // Set the category and subcategory filters
    setSelectedCategoryIds(offer.categoryIds || []);
    setSelectedSubcategoryNames(offer.subcategoryNames || []);
    
    // Set the editing offer ID
    setEditingOfferId(offer.id);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast.info(`Editing offer: ${offer.code}`);
  };
  
  const cancelEdit = () => {
    // Reset form to default values
    setOfferData({
      title: "",
      discountType: "percentage" as "percentage" | "flat",
      discountValue: "",
      validUntil: "",
      description: ""
    });
    setSelectedCategoryIds([]);
    setSelectedSubcategoryNames([]);
    setEditingOfferId(null);
    toast.info("Edit cancelled");
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (window.confirm("Are you sure you want to delete this offer? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/admin/offers-admin/${offerId}`);
        if (response.data.success) {
          toast.success("Offer deleted successfully");
          // Refresh the offers list
          fetchOffers(offersPagination.page);
        }
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast.error("Failed to delete offer");
      }
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, { status: 'cancelled' });
      if (response.data.success) {
        toast.success("Order cancelled successfully!");
        setIsDialogOpen(false);
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error("Failed to cancel order");
    }
  };

  const getIcon = (type: string, priority: string) => {
    if (priority === 'high' || type === 'order_cancelled') return <XCircle className="w-5 h-5" />;
    if (type.startsWith('order_')) return <ShoppingCart className="w-5 h-5" />;
    if (type === 'admin_message') {
      // Using SVG directly since Megaphone is defined later in the component
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="m3 11 18-5v12L3 13v-2Z" />
          <path d="M11.6 16.8 a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    }
    return <Bell className="w-5 h-5" />;
  };

  const getColorClass = (type: string, priority: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-100 text-gray-400';
    if (priority === 'high' || type === 'order_cancelled') return 'bg-red-100 text-red-600';
    if (type.startsWith('order_')) return 'bg-green-100 text-green-600';
    return 'bg-blue-100 text-blue-600';
  };

  const Megaphone = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 11 18-5v12L3 13v-2Z" /><path d="M11.6 16.8 a3 3 0 1 1-5.8-1.6" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications & Alerts</h1>
          <p className="text-muted-foreground">Manage alerts and push special offers.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchNotifications}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-2" />
            Alerts {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="offers">
            <Tag className="w-4 h-4 mr-2" />
            Push Offers
          </TabsTrigger>
        </TabsList>

        {/* ALERTS TAB */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>System & Order Alerts</CardTitle>
              <CardDescription>Real-time notifications from the system.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-muted-foreground animate-pulse">Fetching latest notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "flex items-start gap-4 p-4 border rounded-lg transition-all duration-200 cursor-pointer",
                        note.isRead ? "bg-card/50 opacity-75" : "bg-card border-l-4 border-l-primary shadow-sm hover:translate-x-1 hover:shadow-md"
                      )}
                      onClick={() => {
                        setSelectedNotification(note);
                        setIsDialogOpen(true);
                      }}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner",
                        getColorClass(note.type, note.metadata?.priority || 'normal', note.isRead)
                      )}>
                        {getIcon(note.type, note.metadata?.priority || 'normal')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={cn(
                            "font-semibold truncate",
                            note.isRead ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {note.title}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(note.sentAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm mt-1 mb-2 line-clamp-2",
                          note.isRead ? "text-muted-foreground/80" : "text-muted-foreground"
                        )}>
                          {note.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 flex-wrap">
                            {note.type.startsWith('order_') && note.order && (
                              <Badge variant="outline" className="text-[10px] h-5">
                                Order #{note.order.orderNumber}
                              </Badge>
                            )}
                            {!note.isRead && (
                              <Badge variant="default" className="text-[10px] h-5 bg-blue-500">New</Badge>
                            )}
                          </div>
                          {!note.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs hover:text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(note.id);
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg bg-muted/20">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No notifications found</h3>
                  <p className="text-sm text-muted-foreground/60 max-w-[250px] text-center mt-1">
                    Everything is up to date! Your notification list is currently empty.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm leading-none">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => toggleSetting(setting.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OFFERS TAB */}
        <TabsContent value="offers">
          <div className="space-y-6">
            {/* Push New Offer Form */}
            <Card>
              <CardHeader>
                <CardTitle>Push Promotional Offers</CardTitle>
                <CardDescription>Create and send discount offers to boost engagement.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePushOffer} className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Offer Title</label>
                    <Input 
                      placeholder="e.g., Monsoon Flash Sale" 
                      required 
                      value={offerData.title}
                      onChange={(e) => setOfferData({...offerData, title: e.target.value})}
                    />
                  </div>
                          
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discount Type</label>
                    <Select 
                      value={offerData.discountType}
                      onValueChange={(value) => setOfferData({...offerData, discountType: value as "percentage" | "flat"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                          
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Value</label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 20" 
                        required 
                        value={offerData.discountValue}
                        onChange={(e) => setOfferData({...offerData, discountValue: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valid Until</label>
                      <Input 
                        type="date" 
                        required 
                        value={offerData.validUntil}
                        onChange={(e) => setOfferData({...offerData, validUntil: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: Promotional codes will expire 24 hours after creation
                      </p>
                    </div>
                  </div>
                          
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category Filter</label>
                      <Select 
                        onValueChange={(value) => {
                          const categoryId = parseInt(value);
                          if (!selectedCategoryIds.includes(categoryId)) {
                            setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                              
                      {selectedCategoryIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCategoryIds.map((categoryId) => {
                            const category = categories.find(cat => cat.id === categoryId);
                            return (
                              <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                                {category?.name}
                                <button 
                                  type="button" 
                                  onClick={() => setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId))}
                                  className="ml-1 text-xs"
                                >
                                  ×
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                          
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subcategory Filter</label>
                      <Input 
                        placeholder="e.g., Organic, Premium" 
                        value={selectedSubcategoryNames.join(", ")}
                        onChange={(e) => {
                          // Allow comma-separated subcategory names
                          const names = e.target.value.split(",").map(name => name.trim()).filter(name => name);
                          setSelectedSubcategoryNames(names);
                        }}
                        className="font-mono"
                      />
                              
                      {selectedSubcategoryNames.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedSubcategoryNames.map((subcatName, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {subcatName}
                              <button 
                                type="button" 
                                onClick={() => setSelectedSubcategoryNames(selectedSubcategoryNames.filter((_, i) => i !== index))}
                                className="ml-1 text-xs"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                          
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Brief details about the offer..." 
                      value={offerData.description}
                      onChange={(e) => setOfferData({...offerData, description: e.target.value})}
                    />
                  </div>
                        
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" variant="default" className="w-full md:w-auto">
                      <Tag className="w-4 h-4 mr-2" />
                      {editingOfferId ? 'Update Offer' : 'Push Offer Notification'}
                    </Button>
                    {editingOfferId && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full md:w-auto"
                        onClick={cancelEdit}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
                    
            {/* Existing Offers Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Manage Offers</CardTitle>
                    <CardDescription>View and manage your promotional offers.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fetchOffers(offersPagination.page)} disabled={offersLoading}>
                    {offersLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {offersLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Loading offers...</p>
                  </div>
                ) : offers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Discount</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usage</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valid Until</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {offers.map((offer) => (
                          <tr key={offer.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-mono font-bold">{offer.code}</td>
                            <td className="py-3 px-4">{offer.title}</td>
                            <td className="py-3 px-4">
                              {offer.discountType === 'percentage' 
                                ? `${offer.discountValue}% off`
                                : `₹${offer.discountValue} off`
                              }
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                offer.status === 'active' ? 'default' :
                                offer.status === 'expired' ? 'destructive' :
                                offer.status === 'exhausted' ? 'secondary' : 'outline'
                              }>
                                {offer.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {offer.usedCount} / {offer.usageLimit || '∞'}
                              {offer.usageLimit && (
                                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, (offer.usedCount / offer.usageLimit) * 100)}%` }}
                                  ></div>
                                </div>
                              )}
                              {offer.usagePercentage !== undefined && (
                                <span className="text-xs text-muted-foreground ml-2">{offer.usagePercentage}%</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {new Date(offer.validUntil).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditOffer(offer)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteOffer(offer.id)}>
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                            
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {((offersPagination.page - 1) * 10) + 1} to {Math.min(offersPagination.page * 10, offersPagination.total)} of {offersPagination.total} offers
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => fetchOffers(offersPagination.page - 1)} 
                          disabled={offersPagination.page <= 1}
                        >
                          Previous
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => fetchOffers(offersPagination.page + 1)} 
                          disabled={offersPagination.page >= offersPagination.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No offers found. Create your first promotional offer above.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>

      {/* Notification Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl">
          {selectedNotification && (
            <div className="relative">
              {/* Gradient Header */}
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 py-5 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110",
                      getColorClass(selectedNotification.type, selectedNotification.metadata?.priority || 'normal', false)
                    )}>
                      {getIcon(selectedNotification.type, selectedNotification.metadata?.priority || 'normal')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-xl font-bold text-foreground mb-1 leading-tight">
                        {selectedNotification.title}
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Bell className="w-3 h-3" />
                        {new Date(selectedNotification.sentAt).toLocaleString([], {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col gap-1.5">
                    {!selectedNotification.isRead && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 shadow-sm">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        New
                      </Badge>
                    )}
                    {selectedNotification.metadata?.priority === 'high' && (
                      <Badge variant="destructive" className="shadow-sm animate-pulse">
                        High Priority
                      </Badge>
                    )}
                  </div>
                </div>
                <DialogDescription className="sr-only">
                  Notification details for {selectedNotification.title}
                </DialogDescription>
              </div>

              {/* Content Area */}
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* Order Information Card */}
                {selectedNotification.type.startsWith('order_') && selectedNotification.order && (
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm p-5 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm text-foreground">Order Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order Number</p>
                        <p className="font-bold text-base text-foreground">#{selectedNotification.order.orderNumber}</p>
                      </div>
                      {selectedNotification.metadata?.hotelName && (
                        <div className="space-y-1 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hotel Name</p>
                          <p className="font-semibold text-base text-foreground truncate">{selectedNotification.metadata.hotelName}</p>
                        </div>
                      )}
                      {selectedNotification.order.totalAmount && (
                        <div className="space-y-1 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Amount</p>
                          <p className="font-bold text-base text-green-600">₹{selectedNotification.order.totalAmount.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedNotification.metadata?.itemCount && (
                        <div className="space-y-1 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</p>
                          <p className="font-bold text-base text-foreground">{selectedNotification.metadata.itemCount}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message Card */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Message</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
                    <div className="relative bg-background/95 backdrop-blur-sm p-5 rounded-xl border border-border/50 shadow-sm">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {selectedNotification.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-5 bg-muted/30 backdrop-blur-sm border-t space-y-3">
                {/* Order Action Buttons - Only show for new orders */}
                {selectedNotification.type === 'new_order' && selectedNotification.metadata?.orderId && (
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      onClick={() => handleConfirmOrder(selectedNotification.metadata.orderId)}
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transform hover:scale-[1.02] transition-all duration-200"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Confirm Order</span>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelOrder(selectedNotification.metadata.orderId)}
                      className="flex-1 h-12 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transform hover:scale-[1.02] transition-all duration-200"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Cancel Order</span>
                    </Button>
                  </div>
                )}

                {/* General Action Buttons */}
                <div className="flex gap-3">
                  {!selectedNotification.isRead && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleMarkAsRead(selectedNotification.id);
                        setIsDialogOpen(false);
                      }}
                      className="flex-1 h-10 hover:bg-primary/5 hover:border-primary/50 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className={cn(
                      "h-10 hover:bg-muted transition-all",
                      !selectedNotification.isRead ? "px-8" : "flex-1"
                    )}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
