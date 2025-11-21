"use client";

import React from "react";
import { PieChart, Pie, Cell } from "recharts";

export function GaugeChart({ value, max }: { value: number; max: number }) {
  const percentage = (value / max) * 100;
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];
  const COLORS = ["#4F46E5", "#E5E7EB"];

  return (
    <PieChart width={150} height={150}>
      <Pie
        data={data}
        startAngle={180}
        endAngle={0}
        innerRadius={50}
        outerRadius={70}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <text
        x={75}
        y={90}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-lg font-semibold fill-slate-800"
      >
        {`${Math.round(percentage)}%`}
      </text>
    </PieChart>
  );
}
