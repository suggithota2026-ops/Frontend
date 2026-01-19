import { ShoppingBag, Clock, CheckCircle2, IndianRupee } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TopHotelsChart } from "@/components/dashboard/TopHotelsChart";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { useEffect, useRef, useState, useMemo } from "react";
import api from "@/api/axios";
import { toast } from "sonner";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  todaySales: number;
  topHotels: Array<{
    hotelName: string;
    orderCount: number;
    totalAmount: number;
  }>;
  recentOrders: Array<{
    id: number;
    customer: string;
    amount: string;
    status: string;
    date: string;
    product: string;
  }>;
}

const Dashboard = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todaySales: 0,
    topHotels: [],
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching dashboard stats from /api/admin/dashboard");
      const response = await api.get("/admin/dashboard");
      console.log("Dashboard API Response:", response.data);

      if (response.data.success && response.data.data) {
        console.log("Setting stats:", response.data.data);
        setStats(response.data.data);
      } else {
        console.warn("API response missing success or data:", response.data);
        toast.error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      toast.error(error.response?.data?.message || "Failed to fetch dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, observerOptions);

    if (chartRef.current) observer.observe(chartRef.current);
    if (tableRef.current) observer.observe(tableRef.current);

    return () => {
      if (chartRef.current) observer.unobserve(chartRef.current);
      if (tableRef.current) observer.unobserve(tableRef.current);
    };
  }, []);

  // Prepare stats data with real values - use useMemo to recompute when stats change
  const statsData = useMemo(() => [
    {
      title: "Total Orders",
      value: (stats.totalOrders ?? 0).toString(),
      change: "0%",
      trend: "up" as const,
      icon: ShoppingBag,
      iconBg: "primary" as const,
    },
    {
      title: "Pending Orders",
      value: (stats.pendingOrders ?? 0).toString(),
      change: "0%",
      trend: "down" as const,
      icon: Clock,
      iconBg: "primary" as const,
    },
    {
      title: "Completed Orders",
      value: (stats.completedOrders ?? 0).toString(),
      change: "0%",
      trend: "up" as const,
      icon: CheckCircle2,
      iconBg: "primary" as const,
    },
    {
      title: "Today's Sales",
      value: `₹${(stats.todaySales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "0%",
      trend: "up" as const,
      icon: IndianRupee,
      iconBg: "primary" as const,
    },
  ], [stats.totalOrders, stats.pendingOrders, stats.completedOrders, stats.todaySales]);

  // Debug: Log current stats
  console.log("Current stats state:", stats);
  console.log("Stats data array:", statsData);
  console.log("Stats data values:", statsData.map(s => `${s.title}: ${s.value}`));
  console.log("Is loading:", isLoading);

  return (
    <div className="w-full max-w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-card animate-pulse border border-border/60 bg-white shadow-sm p-4 rounded-lg">
              <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          ))
        ) : (statsData && statsData.length > 0) ? (
          statsData.map((stat, index) => {
            console.log(`Rendering ${stat.title} with value: ${stat.value}`);
            return (
              <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
                <StatsCard {...stat} />
              </div>
            );
          })
        ) : (
          // Fallback if no stats data
          <div className="col-span-4 text-center text-muted-foreground p-4">
            No stats available
          </div>
        )}
      </div>

      {/* Charts & Table */}
      <div ref={chartRef} className="mb-4 md:mb-6 scroll-reveal">
        <TopHotelsChart data={stats.topHotels} />
      </div>

      {/* Orders Table */}
      <div ref={tableRef} className="scroll-reveal">
        <OrdersTable
          orders={stats.recentOrders}
          onViewAll={() => tableRef.current?.scrollIntoView({ behavior: "smooth" })}
        />
      </div>
    </div>
  );
};

export default Dashboard;
