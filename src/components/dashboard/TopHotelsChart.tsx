import { useState, useMemo, useEffect, useRef } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type HotelDataPoint = {
    name: string;
    total: number;
};

type RangeKey = "weekly" | "monthly" | "yearly";

// Data is now passed as props from parent

// Use a single, consistent color for all bars to avoid a rainbow effect
const BAR_COLOR = "hsl(var(--primary))";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="font-semibold text-foreground mb-1">{label}</p>
                <p className="text-primary font-medium">
                    Revenue: ₹{payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export function TopHotelsChart({ data = [] }: { data?: any[] }) {
    const [range, setRange] = useState<RangeKey>("monthly");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartData = useMemo(() => {
        return data.map(h => ({
            name: h.hotelName,
            total: h.totalAmount
        }));
    }, [data]);

    const activeData = chartData;

    const subtitle =
        range === "weekly"
            ? "Revenue performance by client · This week"
            : range === "monthly"
                ? "Revenue performance by client · This month"
                : "Revenue performance by client · This year";

    const hasData = activeData && activeData.length > 0;

    return (
        <div className="dashboard-card animate-fade-in relative overflow-hidden bg-white border border-border/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="relative mb-4 rounded-2xl bg-white px-4 py-3 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                        Top Ordering Hotels
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-[0.2em]">
                        {subtitle}
                    </p>
                </div>
                {/* range switch */}
                <div className="flex items-center rounded-full bg-white border border-border/60 p-1 text-[11px] font-medium shadow-sm">
                    {(["weekly", "monthly", "yearly"] as RangeKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setRange(key)}
                            className={`px-2.5 py-1 rounded-full transition-all ${range === key
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {key === "weekly" ? "Weekly" : key === "monthly" ? "Monthly" : "Yearly"}
                        </button>
                    ))}
                </div>
            </div>
            <div className="relative h-[320px] w-full bg-white min-w-[300px]">
                {isMounted && hasData ? (
                    <div className="w-full h-full min-h-[320px] min-w-[300px]">
                        <ResponsiveContainer width="100%" height={300} minWidth={300} minHeight={320}>
                            <BarChart
                                data={activeData}
                                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                                barCategoryGap={32}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="hsl(var(--muted-foreground) / 0.15)"
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: "transparent" }}
                                />
                                <Bar
                                    dataKey="total"
                                    radius={[10, 10, 4, 4]}
                                    animationDuration={900}
                                    fill={BAR_COLOR}
                                    className="transition-all"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : isMounted && !hasData ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No data available</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse bg-muted rounded w-full h-full min-h-[320px]" />
                    </div>
                )}
            </div>
        </div>
    );
}
