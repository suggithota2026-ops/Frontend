import { useState } from "react";
import { User, Lock, Bell, Landmark, Shield, Save, Loader2, Landmark as BankIcon, Edit3, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "PRK SMILES PRIVATE LIMITED",
    accountNumber: "50200012345678",
    bankName: "HDFC BANK",
    ifscCode: "HDFC0001234",
    branch: "Pune"
  });
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBank = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditingBank(false);
      toast.success("Bank details updated successfully!");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <BankIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Bank Details</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="dashboard-card">
            <h2 className="font-semibold text-foreground mb-6">Profile Information</h2>

            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} />
                <AvatarFallback>{user?.name?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">{user?.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{user?.role} Account</p>
                <div className="flex gap-3">
                  <Button size="sm">Upload</Button>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Full Name</Label>
                <Input id="firstName" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={user?.username} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={`${user?.username}@prksmiles.com`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue={user?.mobileNumber || "N/A"} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue={`${user?.role} at PRK Smiles`} />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <div className="dashboard-card">
            <h2 className="font-semibold text-foreground mb-6">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Update Password</Button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="font-semibold text-foreground mb-6">Two-Factor Authentication</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Enable 2FA</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="font-semibold text-foreground mb-4">Active Sessions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Current Session</p>
                    <p className="text-sm text-muted-foreground">Chrome on MacOS • New York, USA</p>
                  </div>
                </div>
                <span className="status-badge status-delivered">Active</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="dashboard-card">
            <h2 className="font-semibold text-foreground mb-6">Email Notifications</h2>
            <div className="space-y-4">
              {[
                { label: "Order updates", description: "Receive emails about order status changes" },
                { label: "New users", description: "Get notified when new users register" },
                { label: "Marketing", description: "Receive marketing and promotional emails" },
                { label: "Security alerts", description: "Important security notifications" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.label !== "Marketing"} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank" className="mt-6">
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BankIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Bank Account Information</h2>
                <p className="text-xs text-muted-foreground">These details are shown on invoices for payment.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="accountHolder">Account Holder Name</Label>
                <Input
                  id="accountHolder"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  placeholder="Official Company Name"
                  disabled={!isEditingBank}
                  className={!isEditingBank ? "bg-muted/50 border-transparent cursor-default" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank"
                  disabled={!isEditingBank}
                  className={!isEditingBank ? "bg-muted/50 border-transparent cursor-default" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="Enter 12-16 digit account number"
                  disabled={!isEditingBank}
                  className={!isEditingBank ? "bg-muted/50 border-transparent cursor-default" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                  placeholder="e.g. HDFC0001234"
                  disabled={!isEditingBank}
                  className={`font-mono ${!isEditingBank ? "bg-muted/50 border-transparent cursor-default" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={bankDetails.branch}
                  onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                  placeholder="Branch location"
                  disabled={!isEditingBank}
                  className={!isEditingBank ? "bg-muted/50 border-transparent cursor-default" : ""}
                />
              </div>

              <div className="pt-4 md:col-span-2">
                {!isEditingBank ? (
                  <Button
                    onClick={() => setIsEditingBank(true)}
                    variant="outline"
                    className="gap-2 border-primary text-primary hover:bg-primary/5 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Change Details
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSaveBank}
                      disabled={isSaving}
                      className="gap-2 bg-primary hover:bg-primary/90 shadow-lg"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Update Details
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditingBank(false)}
                      disabled={isSaving}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
