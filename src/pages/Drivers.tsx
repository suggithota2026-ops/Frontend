import { useState, useEffect } from "react";
import { Plus, Truck, MoreHorizontal, Edit, Trash2, Search, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnterNavigation } from "@/hooks/useEnterNavigation";
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

interface Driver {
    id: number;
    username: string;
    name: string;
    mobileNumber: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const Drivers = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        name: "",
        mobileNumber: "",
        role: "driver",
        isActive: true,
    });

    const fetchDrivers = async () => {
        try {
            const response = await api.get("/admin/drivers");
            if (response.data.success) {
                setDrivers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching drivers:", error);
            toast.error("Failed to fetch drivers");
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleOpenAdd = () => {
        setCurrentDriver(null);
        setFormData({
            username: "",
            password: "",
            name: "",
            mobileNumber: "",
            role: "driver",
            isActive: true
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (driver: Driver) => {
        setCurrentDriver(driver);
        setFormData({
            username: driver.username,
            password: "", // Don't show password
            name: driver.name,
            mobileNumber: driver.mobileNumber,
            role: driver.role,
            isActive: driver.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this driver?")) {
            try {
                const response = await api.delete(`/admin/users/${id}`);
                if (response.data.success) {
                    toast.success("Driver deleted");
                    fetchDrivers();
                }
            } catch (error) {
                console.error("Error deleting driver:", error);
                toast.error("Failed to delete driver");
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
            if (currentDriver) {
                const updateData = { ...formData };
                if (!updateData.password) delete (updateData as any).password;
                response = await api.put(`/admin/users/${currentDriver.id}`, updateData);
            } else {
                response = await api.post("/admin/drivers", formData);
            }

            if (response.data.success) {
                toast.success(currentDriver ? "Driver updated" : "Driver added");
                fetchDrivers();
                setIsDialogOpen(false);
            }
        } catch (error: any) {
            console.error("Error saving driver:", error);
            toast.error(error.response?.data?.message || "Failed to save driver");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Enter key navigation hook
    const { formRef: driverFormRef } = useEnterNavigation({
        onSubmit: handleSave,
        disabled: isLoading
    });

    const filteredDrivers = drivers.filter(driver =>
        driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.mobileNumber?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Driver Management</h1>
                    <p className="text-muted-foreground">Manage your delivery fleet and drivers</p>
                </div>
                <Button onClick={handleOpenAdd} className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Add Driver
                </Button>
            </div>

            {/* Search */}
            <div className="dashboard-card">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search drivers by name, username or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Driver List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                    <div key={driver.id} className="dashboard-card !p-4 group hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">{driver.name || driver.username}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        <span>Delivery Partner</span>
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
                                    <DropdownMenuItem onClick={() => handleOpenEdit(driver)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(driver.id)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>{driver.mobileNumber || "No phone provided"}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Driver ID: <span className="text-foreground">#{driver.id}</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${driver.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {driver.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                Since {new Date(driver.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form ref={driverFormRef}>
                        <DialogHeader>
                            <DialogTitle>{currentDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                            <DialogDescription>
                                {currentDriver ? 'Update details for this driver.' : 'Create a new driver account for delivery management.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Rahul Kumar"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username (Required)</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="rahul_driver"
                                disabled={!!currentDriver}
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Drivers;
