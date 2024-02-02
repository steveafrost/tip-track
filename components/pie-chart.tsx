"use client";

import {
  ResponsiveContainer,
  Pie,
  PieChart as RechartsPieChart,
} from "recharts";

export type PieChartData = {
  name: string;
  value: number;
}[];

type PieChartProps = {
  data: PieChartData;
};

export const PieChart = ({ data }: PieChartProps) => {
  return (
    <ResponsiveContainer width={375} height="80%">
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          fill="#8884d8"
          innerRadius={50}
          outerRadius={100}
          label={(value) => value.name}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
