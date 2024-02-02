"use client";

import {
  ResponsiveContainer,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  Legend,
} from "recharts";

export type PieChartData = {
  name: string;
  value: number;
  sortOrder: number;
}[];

type PieChartProps = {
  data: PieChartData;
};

const colors = ["#BBF7D0", "#4ADE80", "#16A34A", "#166534", "#831843"];

export const PieChart = ({ data }: PieChartProps) => {
  return (
    <ResponsiveContainer width={"100%"} height={350}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={50}
          outerRadius={100}
          label={false}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
        <Legend layout="vertical" iconSize={20} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
