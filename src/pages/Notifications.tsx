import { useState, useEffect } from "react";
import { Bell, Send, Tag, Users, AlertTriangle, CheckCircle2, ShoppingCart, Settings, XCircle, Package, Loader2, X } from "lucide-react";
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

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const handlePushOffer = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Offer pushed to selected users!");
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
    if (type === 'admin_message') return <Megaphone className="w-5 h-5" />;
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
          <Card>
            <CardHeader>
              <CardTitle>Push Promotional Offers</CardTitle>
              <CardDescription>Create and send discount offers to boost engagement.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePushOffer} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Offer Title</label>
                  <Input placeholder="e.g., Monsoon Flash Sale" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Promo Code</label>
                    <Input placeholder="e.g., WELCOME50" className="font-mono uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discount Type</label>
                    <Select defaultValue="percentage">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discount Value</label>
                    <Input type="number" placeholder="e.g. 20" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valid Until</label>
                    <Input type="date" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Brief details about the offer..." />
                </div>

                <Button type="submit" variant="default" className="w-full md:w-auto">
                  <Tag className="w-4 h-4 mr-2" />
                  Push Offer Notification
                </Button>
              </form>
            </CardContent>
          </Card>
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
