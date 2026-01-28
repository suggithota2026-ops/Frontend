import { useState, useRef, useEffect, MouseEvent } from "react";
import {
    User, Mail, Phone, Calendar, MapPin,
    Briefcase, Camera, Edit2, Save, X,
    Globe, Shield, CheckCircle2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    // Profile Data State
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
    });

    const [avatarUrl, setAvatarUrl] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Profile Data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/admin/auth/profile');
            const data = response.data.data;

            if (data) {
                // Parse name into first/last
                const nameParts = (data.name || "").split(" ");
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";

                // Construct location
                const loc = [data.city, data.country].filter(Boolean).join(", ");

                setProfileData({
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
                });

                if (data.avatarUrl) {
                    setAvatarUrl(data.avatarUrl);
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            // Don't toast error on mount if unauthorized, just let it be empty
        }
    };

    const handleDeleteAvatar = async (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent any bubbling if necessary
        if (isDeleting) return;

        try {
            setIsDeleting(true);
            await api.put('/admin/auth/profile', { avatarUrl: null });
            setAvatarUrl("");
            // Optionally force a refresh or just update local state
        } catch (error) {
            console.error("Failed to delete avatar:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">View your profile details</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Last login: Today, 10:45 AM</span>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card className="border-none shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8">
                        {/* Avatar Section */}
                        <div className="relative -mt-20 sm:-mt-24 group">
                            <div className="p-1.5 bg-background rounded-full ring-4 ring-background/50 shadow-sm relative">
                                <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-xl">
                                    <AvatarImage src={avatarUrl} className="object-cover bg-muted" />
                                    <AvatarFallback className="text-5xl bg-muted/50 text-muted-foreground/50 font-semibold">
                                        {profileData.firstName[0]}{profileData.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Delete Overlay */}
                                {avatarUrl && (
                                    <div
                                        onClick={handleDeleteAvatar}
                                        className="absolute inset-0 m-1.5 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-20 backdrop-blur-[2px]"
                                    >
                                        <Trash2 className="w-8 h-8 text-white mb-1" />
                                        <span className="text-white text-xs font-medium">Remove</span>
                                    </div>
                                )}
                            </div>
                            <span className="absolute bottom-6 right-6 w-5 h-5 bg-green-500 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2 shadow-sm z-10" title="Online"></span>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center sm:text-left space-y-3 pt-2">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-1">
                                    {profileData.firstName} {profileData.lastName}
                                </h2>
                                <p className="text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                                    {profileData.role}
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                                    <span>{profileData.email}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                                <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors">
                                    {profileData.role} Account
                                </Badge>
                                {profileData.location && profileData.location !== "Location not set" && (
                                    <span className="flex items-center text-sm px-3 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                        {profileData.location}
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
                {/* Personal Information Card */}
                <Card className="border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* First Name */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">First Name</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.firstName || "-"}</p>
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Last Name</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.lastName || "-"}</p>
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Email Address</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.email || "-"}</p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Phone Number</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.phone || "-"}</p>
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Date of Birth</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.dob || "-"}</p>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Role</Label>
                                <div className="flex items-center gap-2 py-1 min-h-[2.5rem]">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <p className="font-medium text-foreground text-sm">{profileData.role}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address Card */}
                <Card className="border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Address Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Country */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Country</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.country || "-"}</p>
                            </div>

                            {/* City */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">City</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.city || "-"}</p>
                            </div>

                            {/* Postal Code */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Postal Code</Label>
                                <p className="font-medium text-foreground text-sm py-2 border-b border-transparent min-h-[2.5rem] flex items-center">{profileData.postalCode || "-"}</p>
                            </div>
                        </div>

                        {/* Map placeholder (Visual enhancement) */}
                        <div className="mt-8 h-40 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground text-sm">
                            <div className="text-center">
                                <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <span>Map View Unavailable</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
