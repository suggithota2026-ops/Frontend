import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEnterNavigation } from "@/hooks/useEnterNavigation";
import { PERMISSION_OPTIONS } from "@/config/permissions";
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
  permissions?: string[];
}

const StaffFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    mobileNumber: "",
    role: "STAFF",
    isActive: true,
    permissions: [] as string[],
  });

  const title = useMemo(
    () => (isEdit ? "Edit Staff Member" : "Add New Staff"),
    [isEdit]
  );

  useEffect(() => {
    if (!isEdit || !id) return;
    const fetchStaffMember = async () => {
      setIsFetching(true);
      try {
        const response = await api.get("/admin/staff");
        const list: StaffMember[] = response.data?.data || [];
        const member = list.find((item) => String(item.id) === String(id));
        if (!member) {
          toast.error("Staff member not found");
          navigate("/admin/staff");
          return;
        }
        setFormData({
          username: member.username || "",
          password: "",
          name: member.name || "",
          mobileNumber: member.mobileNumber || "",
          role: member.role || "STAFF",
          isActive: member.isActive !== false,
          permissions: member.permissions || [],
        });
      } catch (error) {
        console.error("Error fetching staff member:", error);
        toast.error("Failed to fetch staff member");
        navigate("/admin/staff");
      } finally {
        setIsFetching(false);
      }
    };
    fetchStaffMember();
  }, [id, isEdit, navigate]);

  const togglePermission = (permission: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      return {
        ...prev,
        permissions: checked
          ? Array.from(new Set([...current, permission]))
          : current.filter((item) => item !== permission),
      };
    });
  };

  const handleSave = async () => {
    if (!formData.username) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      if (isEdit && id) {
        const updateData: Record<string, unknown> = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/admin/users/${id}`, updateData);
        toast.success("Staff updated");
      } else {
        await api.post("/admin/staff", formData);
        toast.success("Staff added");
      }
      navigate("/admin/staff");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to save staff");
    } finally {
      setIsLoading(false);
    }
  };

  const { formRef } = useEnterNavigation({
    onSubmit: handleSave,
    disabled: isLoading || isFetching,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update staff details and permissions."
              : "Create a new staff login for your team members."}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/staff")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <form ref={formRef} className="space-y-6">
        <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Staff Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                disabled={isFetching}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="e.g. 9876543210"
                disabled={isFetching}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username (Required)</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. johndoe123"
                disabled={isEdit || isFetching}
              />
            </div>
            {!isEdit && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password (Required)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  disabled={isFetching}
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Access Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isFetching}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "active" })
                }
                disabled={isFetching}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 rounded-md border p-4 max-h-64 overflow-y-auto">
              {PERMISSION_OPTIONS.map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={(formData.permissions || []).includes(item.key)}
                    onCheckedChange={(checked) =>
                      togglePermission(item.key, checked === true)
                    }
                    disabled={isFetching}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/staff")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isLoading || isFetching}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StaffFormPage;
