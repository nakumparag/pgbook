"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsChartsProps {
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    net: number;
  }>;
  occupancy: {
    occupied: number;
    vacant: number;
    reserved: number;
  };
}

const OCCUPANCY_COLORS = ["#2563eb", "#10b981", "#f59e0b"];

export function RevenueExpensesChart({
  data,
}: {
  data: AnalyticsChartsProps["monthlyData"];
}) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: any, name: any) => [
              formatCurrency(Number(value) || 0),
              name === "revenue" ? "Rent Revenue" : "Operating Expenses",
            ]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OccupancyDonutChart({
  occupied,
  vacant,
  reserved,
}: {
  occupied: number;
  vacant: number;
  reserved: number;
}) {
  const pieData = [
    { name: "Occupied", value: occupied },
    { name: "Vacant", value: vacant },
    { name: "Reserved", value: reserved },
  ].filter((d) => d.value > 0);

  const total = occupied + vacant + reserved;
  const occPct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full h-72 relative">
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={pieData.length > 0 ? pieData : [{ name: "No Beds", value: 1 }]}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={88}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={OCCUPANCY_COLORS[index % OCCUPANCY_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any) => [`${value} Beds`, name]}
            contentStyle={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "10px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute top-[82px] flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-foreground font-heading">
          {occPct}%
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          Occupancy
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
          <span className="font-medium text-foreground">Occupied ({occupied})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span className="font-medium text-foreground">Vacant ({vacant})</span>
        </div>
        {reserved > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="font-medium text-foreground">Reserved ({reserved})</span>
          </div>
        )}
      </div>
    </div>
  );
}

