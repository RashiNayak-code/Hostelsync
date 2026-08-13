import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function DonutProgress({ value, label }: { value: number; label: string }) {
  const data = [
    { name: "done", value },
    { name: "left", value: 100 - value },
  ];
  return (
    <div className="relative h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="70%" outerRadius="92%" startAngle={90} endAngle={-270} stroke="none">
            <Cell fill="var(--role)" />
            <Cell fill="var(--muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
