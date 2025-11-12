"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  value: number;
  max?: number;
}

export function GaugeChart({ value, max = 100 }: GaugeChartProps) {
  const percentage = Math.min(value / max, 1);
  const data = [
    { name: "value", value: percentage * 100 },
    { name: "remain", value: 100 - percentage * 100 },
  ];

  const COLORS = ["#4F46E5", "#E5E7EB"]; // Indigo + Gray

  return (
    <div className="bg-white rounded-2xl flex items-center justify-center"> {/* ✅ 배경 흰색 지정 */}
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={45}
            outerRadius={60}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
