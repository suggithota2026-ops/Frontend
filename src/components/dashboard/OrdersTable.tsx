import { cn } from "@/lib/utils";

// orders mock removed

const statusStyles = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  delivered: "status-delivered",
};

interface OrdersTableProps {
  orders?: any[];
  onViewAll?: () => void;
}

export function OrdersTable({ orders = [], onViewAll }: OrdersTableProps) {
  return (
    <div className="dashboard-card animate-fade-in border-2 border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Latest client transactions</p>
        </div>
        <button
          onClick={onViewAll}
          className="px-4 py-2 text-sm text-primary font-medium hover:bg-primary/10 rounded-md transition-colors w-full sm:w-auto text-left sm:text-right"
        >
          View All
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b-2 border-border">
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                Order ID
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                Client
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                Product
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3.5 px-4 text-xs font-semibold text-foreground uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <td className="py-4 px-4 text-sm font-medium text-foreground">
                  {order.id}
                </td>
                <td className="py-4 px-4 text-sm text-foreground">{order.customer}</td>
                <td className="py-4 px-4 text-sm text-muted-foreground">
                  {order.product}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-foreground">
                  {order.amount}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "status-badge capitalize rounded-full px-3 py-1",
                      statusStyles[order.status as keyof typeof statusStyles]
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-border rounded-lg p-4 space-y-3 bg-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{order.id}</span>
              <span
                className={cn(
                  "status-badge capitalize text-xs",
                  statusStyles[order.status as keyof typeof statusStyles]
                )}
              >
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{order.customer}</p>
              <p className="text-xs text-muted-foreground mt-1">{order.product}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold text-foreground">{order.amount}</span>
              <span className="text-xs text-muted-foreground">{order.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
