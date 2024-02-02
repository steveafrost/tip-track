"use client";

import {
  ResponsiveContainer,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

export type PieChartData = {
  name: string;
  value: number;
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
          fill="#15803D"
          innerRadius={50}
          outerRadius={100}
          label={(value) => value.name}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
