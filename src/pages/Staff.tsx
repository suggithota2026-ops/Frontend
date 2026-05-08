import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, MoreHorizontal, Edit, Trash2, Search, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StaffMember {
    id: number;
    username: string;
    name: string;
    mobileNumber: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    permissions?: string[];
}

const Staff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

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
                <Button onClick={() => navigate("/admin/staff/new")} className="gap-2 w-full sm:w-auto">
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
                                    <DropdownMenuItem onClick={() => navigate(`/admin/staff/${member.id}/edit`)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    {member.role?.toUpperCase() !== "ADMIN" && (
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    )}
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
        </div>
    );
};

export default Staff;
