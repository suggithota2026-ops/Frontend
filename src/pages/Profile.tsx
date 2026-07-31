import { useState, useRef, useEffect } from "react";
import {
    User, MapPin, Briefcase, Camera, Edit2, Save, X,
    CheckCircle2, Loader2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        role: "Administrator",
        email: "",
        phone: "",
        dob: "",
        location: "",
        country: "",
        city: "",
        postalCode: "",
        bio: "",
        address: "",
        gstNumber: "",
        businessName: "",
        avatarUrl: "",
    });

    const [editData, setEditData] = useState(profileData);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/admin/auth/profile');
            const data = response.data.data;

            if (data) {
                const nameParts = (data.name || "").split(" ");
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";
                const loc = [data.city, data.country].filter(Boolean).join(", ");

                const mapped = {
                    firstName,
                    lastName,
                    role: data.role || "Administrator",
                    email: data.email || data.username || "",
                    phone: data.mobileNumber || "",
                    dob: data.dob || "",
                    location: loc,
                    country: data.country || "",
                    city: data.city || "",
                    postalCode: data.postalCode || "",
                    bio: data.bio || "",
                    address: data.address || "",
                    gstNumber: data.gstNumber || "",
                    businessName: data.businessName || "",
                    avatarUrl: data.avatarUrl || "",
                };

                setProfileData(mapped);
                setEditData(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error("Failed to load profile data");
        }
    };

    const handleStartEdit = () => {
        setEditData(profileData);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditData(profileData);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const fullName = `${editData.firstName} ${editData.lastName}`.trim();

            await api.put('/admin/auth/profile', {
                name: fullName,
                mobileNumber: editData.phone,
                email: editData.email || null,
                bio: editData.bio || null,
                avatarUrl: editData.avatarUrl || null,
                dob: editData.dob || null,
                country: editData.country || null,
                city: editData.city || null,
                postalCode: editData.postalCode || null,
                address: editData.address || null,
                gstNumber: editData.gstNumber || null,
                businessName: editData.businessName || null,
            });

            toast.success("Profile updated successfully!");
            setIsEditing(false);
            await fetchProfile();
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
                await api.put('/admin/auth/profile', { avatarUrl: newAvatarUrl });
                setProfileData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
                setEditData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
                toast.dismiss(uploadToast);
                toast.success("Avatar updated!");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.dismiss();
            toast.error("Failed to upload avatar");
        }
        setFileInputKey(Date.now());
    };

    const handleDeleteAvatar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (deletingAvatar) return;

        try {
            setDeletingAvatar(true);
            const deleteToast = toast.loading("Removing avatar...");
            await api.put('/admin/auth/profile', { avatarUrl: null });
            setProfileData(prev => ({ ...prev, avatarUrl: "" }));
            setEditData(prev => ({ ...prev, avatarUrl: "" }));
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

    const display = isEditing ? editData : profileData;

    const FieldDisplay = ({ value }: { value: string }) => (
        <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">
            {value || "-"}
        </p>
    );

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">
                        {isEditing ? "Edit your profile details" : "View and manage your profile details"}
                    </p>
                </div>
                {!isEditing && (
                    <div className="flex items-center gap-2">
                        <Button onClick={handleStartEdit} className="gap-2">
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </Button>
                    </div>
                )}
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8">
                        <div
                            className="relative -mt-20 sm:-mt-24 group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-1.5 bg-background rounded-full ring-4 ring-background/50 shadow-sm relative">
                                <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-xl">
                                    <AvatarImage src={display.avatarUrl} className="object-cover bg-muted" />
                                    <AvatarFallback className="text-5xl bg-muted/50 text-muted-foreground/50 font-semibold">
                                        {display.firstName[0]}{display.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-1.5 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden">
                                    <Camera className="w-6 h-6 text-white/90" />
                                    <span className="text-[10px] text-white/90 font-medium uppercase tracking-wider mt-1">Change</span>
                                    {display.avatarUrl && (
                                        <div
                                            onClick={handleDeleteAvatar}
                                            className="absolute bottom-0 inset-x-0 bg-red-600/80 py-1.5 flex items-center justify-center hover:bg-red-600 transition-colors"
                                            title="Remove Image"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                key={fileInputKey}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                            <span className="absolute bottom-6 right-6 w-5 h-5 bg-green-500 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2 shadow-sm z-10" title="Online"></span>
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-3 pt-2">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-1">
                                    {display.firstName} {display.lastName}
                                </h2>
                                <p className="text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                                    {display.role}
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                                    <span>{display.email}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                                <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors">
                                    {display.role} Account
                                </Badge>
                                {display.location && (
                                    <span className="flex items-center text-sm px-3 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                        {display.location}
                                    </span>
                                )}
                                <span className="flex items-center text-sm px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200/50">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                    Active Status
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">First Name</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.firstName}
                                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.firstName} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Last Name</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.lastName}
                                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.lastName} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Email Address</Label>
                                {isEditing ? (
                                    <Input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.email} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Phone Number</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.phone}
                                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        placeholder="+91 00000 00000"
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.phone} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Date of Birth</Label>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={editData.dob}
                                        onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.dob} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Role</Label>
                                <div className="flex items-center gap-2 py-1 min-h-[2.5rem]">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <p className="font-medium text-foreground text-sm">{profileData.role}</p>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-muted-foreground">Bio</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        className="min-h-[80px] resize-y"
                                        placeholder="Tell us a little about yourself..."
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.bio} />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Address Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Country</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.country}
                                        onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                                        placeholder="India"
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.country} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">City</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.city}
                                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                        placeholder="City"
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.city} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Postal Code</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.postalCode}
                                        onChange={(e) => setEditData({ ...editData, postalCode: e.target.value })}
                                        placeholder="Postal code"
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.postalCode} />
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-muted-foreground">Business Name</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.businessName}
                                        onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                                        placeholder="Enter your business name"
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.businessName} />
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-muted-foreground">Business Address</Label>
                                {isEditing ? (
                                    <Textarea
                                        value={editData.address}
                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                        className="min-h-[80px] resize-y"
                                        placeholder="Enter your business address..."
                                    />
                                ) : (
                                    <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center whitespace-pre-wrap">
                                        {profileData.address || "-"}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-muted-foreground">GSTIN Number</Label>
                                {isEditing ? (
                                    <Input
                                        value={editData.gstNumber}
                                        onChange={(e) => setEditData({ ...editData, gstNumber: e.target.value.toUpperCase() })}
                                        placeholder="Enter GSTIN number"
                                    />
                                ) : (
                                    <FieldDisplay value={profileData.gstNumber} />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-2 pb-4">
                    <Button variant="outline" onClick={handleCancelEdit} disabled={saving} className="gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[120px]">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Profile;
