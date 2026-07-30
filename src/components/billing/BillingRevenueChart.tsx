import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type BillingRevenueChartProps = {
  data: Array<{ month: string; sales: number; gst: number }>;
};

export function BillingRevenueChart({ data }: BillingRevenueChartProps) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorGst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#2563eb"
            fillOpacity={1}
            fill="url(#colorSales)"
            name="Total Sales (₹)"
          />
          <Area
            type="monotone"
            dataKey="gst"
            stroke="#16a34a"
            fillOpacity={1}
            fill="url(#colorGst)"
            name="GST (₹)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
