"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  APPROVED: "#3b82f6",
  REJECTED: "#ef4444",
  COMPLETED: "#10b981",
};

const CATEGORY_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#84cc16", "#f97316", "#14b8a6",
];

interface ChartProps {
  ordersData: { name: string; value: number }[];
  categoryData: { name: string; value: number }[];
}

export function AdminCharts({ ordersData, categoryData }: ChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Orders by Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No order data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={ordersData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ordersData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Product Distribution by Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Products by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No product data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" name="Products" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
