import { useState, useEffect, useRef } from "react";
import {
  User, Landmark, Shield, Save, Loader2,
  Edit3, X, Camera, Mail, Globe, MapPin, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  // -- State Management --

  // Profile
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Force re-render of file input
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    role: "",
    avatarUrl: "",
    dob: "",
    country: "",
    city: "",
    postalCode: "",
    address: "",
    gstNumber: "",
    businessName: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);



  // Bank
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "PRK SMILES PRIVATE LIMITED",
    accountNumber: "50200012345678",
    bankName: "HDFC BANK",
    ifscCode: "HDFC0001234",
    branch: "Pune"
  });
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);

  // -- Effects --

  useEffect(() => {
    fetchProfile();
  }, []);

  // -- Handlers --

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await api.get('/admin/auth/profile');
      const data = response.data.data;

      if (data) {
        const nameParts = (data.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setProfileData({
          firstName,
          lastName,
          username: data.username || "",
          email: data.email || "",
          phone: data.mobileNumber || "",
          bio: data.bio || "",
          role: data.role || "Administrator",
          avatarUrl: data.avatarUrl || "",
          dob: data.dob || "",
          country: data.country || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          address: data.address || "",
          gstNumber: data.gstNumber || "",
          businessName: data.businessName || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

      const payload = {
        name: fullName,
        username: profileData.username,
        mobileNumber: profileData.phone,
        email: profileData.email || null,
        bio: profileData.bio || null,
        avatarUrl: profileData.avatarUrl || null,
        dob: profileData.dob || null,
        country: profileData.country || null,
        city: profileData.city || null,
        postalCode: profileData.postalCode || null,
        address: profileData.address || null,
        gstNumber: profileData.gstNumber || null,
        businessName: profileData.businessName || null
      };

      await api.put('/admin/auth/profile', payload);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile changes");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }

      try {
        const uploadToast = toast.loading("Uploading avatar...");
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const newAvatarUrl = response.data.data.secure_url || response.data.data.url;

        if (newAvatarUrl) {
          const updatedProfile = { ...profileData, avatarUrl: newAvatarUrl };
          setProfileData(updatedProfile);

          const fullName = `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim();
          await api.put('/admin/auth/profile', {
            name: fullName,
            avatarUrl: newAvatarUrl
          });

          toast.dismiss(uploadToast);
          toast.success("Avatar updated!");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.dismiss(); // Dismiss the loading toast
        toast.error("Failed to upload avatar");
      }
      // Reset input
      setFileInputKey(Date.now());
    }
  };

  const handleDeleteAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingAvatar) return;

    try {
      setDeletingAvatar(true);
      const deleteToast = toast.loading("Removing avatar...");

      await api.put('/admin/auth/profile', {
        avatarUrl: null
      });

      setProfileData(prev => ({ ...prev, avatarUrl: "" }));
      toast.dismiss(deleteToast);
      toast.success("Avatar removed successfully");
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      toast.dismiss();
      toast.error("Failed to remove avatar");
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleSaveBank = () => {
    setIsSavingBank(true);
    setTimeout(() => {
      setIsSavingBank(false);
      setIsEditingBank(false);
      toast.success("Bank details updated successfully!");
    }, 800);
  };

  // -- Render Helpers --

  const SectionHeader = ({ title, description }: { title: string, description: string }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FA] w-full">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="profile" className="w-full space-y-8">
          <div className="sticky top-0 z-40 bg-[#F6F8FA]/95 backdrop-blur-sm pb-4 pt-2 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-border/40">
            <TabsList className="bg-transparent p-0 h-auto gap-2 md:gap-6 w-full flex-wrap justify-start">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-full px-4 py-2 gap-2 transition-all"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>


              <TabsTrigger
                value="bank"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-full px-4 py-2 gap-2 transition-all"
              >
                <Landmark className="w-4 h-4" />
                Bank Details
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: PROFILE */}
          <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
            <Card className="border-0 shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="bg-white p-6 md:p-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white shadow-lg ring-1 ring-black/5">
                      <AvatarImage src={profileData.avatarUrl} className="object-cover" />
                      <AvatarFallback className="text-3xl bg-muted text-muted-foreground font-semibold">
                        {profileData.firstName[0]}{profileData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden">
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-6 h-6 text-white/90" />
                        <span className="text-[10px] text-white/90 font-medium uppercase tracking-wider">Change</span>
                      </div>

                      {profileData.avatarUrl && (
                        <div
                          onClick={handleDeleteAvatar}
                          className="absolute bottom-0 inset-x-0 bg-red-600/80 py-1.5 flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      key={fileInputKey}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  <div className="text-center md:text-left pt-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-muted-foreground">
                      <Badge variant="secondary" className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                        {profileData.role}
                      </Badge>
                      <span className="text-sm">•</span>
                      <span className="text-sm">{profileData.email}</span>
                    </div>
                  </div>
                </div>

                <Separator className="mb-8" />

                {/* Profile Form */}
                <div className="space-y-8">
                  <SectionHeader
                    title="Profile Information"
                    description="Update your personal information and contact details."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-inherit">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="pl-9 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={profileData.dob}
                        onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="country"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          className="pl-9"
                          placeholder="United States"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                          className="pl-9"
                          placeholder="San Francisco"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        placeholder="94107"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={profileData.businessName}
                        onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                        placeholder="Enter your business name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="min-h-[100px] resize-y"
                      placeholder="Enter your business address..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GSTIN Number</Label>
                    <Input
                      id="gstNumber"
                      value={profileData.gstNumber}
                      onChange={(e) => setProfileData({ ...profileData, gstNumber: e.target.value.toUpperCase() })}
                      placeholder="Enter GSTIN number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="min-h-[100px] resize-y"
                      placeholder="Tell us a little about yourself..."
                    />
                    <p className="text-xs text-muted-foreground text-right">0/500 characters</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 px-6 py-4 border-t flex justify-end items-center gap-4">
                <p className="text-sm text-muted-foreground mr-auto hidden sm:block">
                  Last saved: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <Button variant="outline" onClick={fetchProfile}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile} className="min-w-[140px]">
                  {savingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>





          {/* TAB 4: BANK DETAILS */}
          <TabsContent value="bank" className="space-y-6 focus-visible:outline-none">
            <Card className="border-0 shadow-sm ring-1 ring-black/5 max-w-4xl">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                  <Landmark className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Bank Account Information</CardTitle>
                  <CardDescription>These details are used for invoices and payouts.</CardDescription>
                </div>
                <div className="ml-auto">
                  {!isEditingBank ? (
                    <Button
                      onClick={() => setIsEditingBank(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> Edit Details
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setIsEditingBank(false)} disabled={isSavingBank}>Cancel</Button>
                      <Button onClick={handleSaveBank} disabled={isSavingBank}>
                        {isSavingBank ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Account Holder Name</Label>
                    <Input
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                      disabled={!isEditingBank}
                      className={`h-11 ${!isEditingBank ? "bg-muted/30 border-transparent font-medium text-lg px-0 shadow-none focus-visible:ring-0" : "bg-white"}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Bank Name</Label>
                    <Input
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      disabled={!isEditingBank}
                      className={`h-11 ${!isEditingBank ? "bg-muted/30 border-transparent font-medium px-0 shadow-none focus-visible:ring-0" : "bg-white"}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Account Number</Label>
                    <Input
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      disabled={!isEditingBank}
                      type={!isEditingBank ? "password" : "text"}
                      className={`h-11 font-mono ${!isEditingBank ? "bg-muted/30 border-transparent font-medium px-0 shadow-none focus-visible:ring-0 text-xl tracking-widest text-muted-foreground" : "bg-white"}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">IFSC Code</Label>
                    <Input
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                      disabled={!isEditingBank}
                      className={`h-11 font-mono ${!isEditingBank ? "bg-muted/30 border-transparent font-medium px-0 shadow-none focus-visible:ring-0 uppercase" : "bg-white uppercase"}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Branch</Label>
                    <Input
                      value={bankDetails.branch}
                      onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                      disabled={!isEditingBank}
                      className={`h-11 ${!isEditingBank ? "bg-muted/30 border-transparent font-medium px-0 shadow-none focus-visible:ring-0" : "bg-white"}`}
                    />
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="mt-8 bg-green-50/50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Bank Account Verified</p>
                    <p className="text-xs text-green-700">Verified on Jan 15, 2024. Your payouts are active.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
