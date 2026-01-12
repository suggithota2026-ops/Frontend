import { useState, useEffect } from "react";
import { Plus, Users, MoreHorizontal, Edit, Trash2, Search, Phone, Shield } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StaffMember {
    id: number;
    username: string;
    name: string;
    mobileNumber: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const Staff = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        mobileNumber: "",
        role: "staff",
        isActive: true,
    });

    const fetchStaff = async () => {
        try {
            const response = await api.get("/admin/staff");
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast.error("Failed to fetch staff");
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleOpenAdd = () => {
        setCurrentStaff(null);
        setFormData({
            username: "",
            password: "",
            name: "",
            mobileNumber: "",
            role: "ADMIN",
            isActive: true
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (member: StaffMember) => {
        setCurrentStaff(member);
        setFormData({
            username: member.username,
            password: "", // Don't show password
            name: member.name,
            mobileNumber: member.mobileNumber,
            role: member.role,
            isActive: member.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this staff member?")) {
            try {
                const response = await api.delete(`/admin/users/${id}`);
                if (response.data.success) {
                    toast.success("Staff member deleted");
                    fetchStaff();
                }
            } catch (error) {
                console.error("Error deleting staff:", error);
                toast.error("Failed to delete staff");
            }
        }
    };

    const handleSave = async () => {
        if (!formData.username) {
            toast.error("Please fill in all required fields");
            return;
        }
        setIsLoading(true);

        try {
            let response;
            if (currentStaff) {
                const updateData = { ...formData };
                if (!updateData.password) delete (updateData as any).password;
                response = await api.put(`/admin/users/${currentStaff.id}`, updateData);
            } else {
                response = await api.post("/admin/staff", formData);
            }

            if (response.data.success) {
                toast.success(currentStaff ? "Staff updated" : "Staff added");
                fetchStaff();
                setIsDialogOpen(false);
            }
        } catch (error: any) {
            console.error("Error saving staff:", error);
            toast.error(error.response?.data?.message || "Failed to save staff");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStaff = staff.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.mobileNumber?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
                    <p className="text-muted-foreground">Manage your administrative and ground staff</p>
                </div>
                <Button onClick={handleOpenAdd} className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Add Staff Member
                </Button>
            </div>

            {/* Search */}
            <div className="dashboard-card">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search staff by name, username or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStaff.map((member) => (
                    <div key={member.id} className="dashboard-card !p-4 group hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">{member.name || member.username}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Shield className="w-3 h-3" />
                                        <span className="capitalize">{member.role}</span>
                                    </div>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenEdit(member)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>{member.mobileNumber || "No phone provided"}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Username: <span className="text-foreground">{member.username}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${member.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                Joined {new Date(member.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentStaff ? 'Edit Staff Member' : 'Add New Staff'}</DialogTitle>
                        <DialogDescription>
                            {currentStaff ? 'Update details for this staff member.' : 'Create a new staff login for your team members.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username (Required)</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="johndoe123"
                                disabled={!!currentStaff}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                value={formData.mobileNumber}
                                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                placeholder="9876543210"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
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

export default Staff;
