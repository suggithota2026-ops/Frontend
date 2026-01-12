import { useState, useRef } from "react";
import { User, Mail, Lock, Save, Camera, Shield, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Profile = () => {
    const [profileData, setProfileData] = useState({
        firstName: "Admin",
        lastName: "",
        email: "admin@prksmiles.com",
        role: "Administrator",
        bio: "Senior Store Manager responsible for inventory and client relations.",
    });

    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face");

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock API call
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Profile updated successfully!");
        }, 1000);
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Password changed successfully!");
        }, 1000);
    };

    const handleTakePhoto = () => {
        // Access device camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                // For now, we'll just show a message
                // In a real app, you'd create a camera preview and capture functionality
                toast.info("Camera access granted. Photo capture feature coming soon!");
                // Stop the stream
                stream.getTracks().forEach(track => track.stop());
            })
            .catch((error) => {
                toast.error("Camera access denied or not available");
                console.error("Camera error:", error);
            });
    };

    const handleUploadPhoto = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarUrl(reader.result as string);
                    toast.success("Profile photo updated successfully!");
                };
                reader.readAsDataURL(file);
            } else {
                toast.error("Please select an image file");
            }
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account information and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="text-center">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-xl cursor-pointer hover:opacity-90 transition-opacity">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback className="text-4xl">AD</AvatarFallback>
                                </Avatar>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md hover:scale-105 transition-transform">
                                            <Camera className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={handleTakePhoto} className="cursor-pointer">
                                            <Image className="w-4 h-4 mr-2" />
                                            Take Photo
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleUploadPhoto} className="cursor-pointer">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Photo
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <CardTitle>{profileData.firstName} {profileData.lastName}</CardTitle>
                            <CardDescription className="flex items-center justify-center gap-1 mt-1">
                                <Shield className="w-3 h-3 text-primary" />
                                {profileData.role}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="truncate">{profileData.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Personal Info Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="profile-form" onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="firstName"
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            className="pl-9"
                                            disabled
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Email address cannot be changed. Contact support.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        placeholder="Write a short bio..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t p-6">
                            <Button type="submit" form="profile-form" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Password Change Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="password-form" onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="current-password" type="password" className="pl-9" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="new-password" type="password" className="pl-9" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="confirm-password" type="password" className="pl-9" />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t p-6">
                            <Button type="submit" form="password-form" variant="outline" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
