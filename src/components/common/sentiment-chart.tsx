import { MentionPoint } from "@/types";
import { Card } from "@/components/common/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface SentimentChartProps {
  data: MentionPoint[];
  title?: string;
  description?: string;
  className?: string;
  height?: number;
}

export function SentimentChart({
  data,
  title = "Complaint Trend",
  description,
  className,
  height = 300,
}: SentimentChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: format(parseISO(item.date), "MMM dd"),
  }));

  return (
    <Card
      title={title}
      description={description}
      className={className}
      contentClassName="p-0"
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--chart-1))"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--chart-1))"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--chart-4))"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--chart-4))"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--muted))" }}
            axisLine={{ stroke: "hsl(var(--muted))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--card-foreground))",
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: any) => [value, "Complaints"]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            name="Complaints"
            stroke="hsl(var(--chart-1))"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
