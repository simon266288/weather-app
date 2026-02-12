/**
 * 降水概率图表（可选，基于预报数据）
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyForecast } from '../../services/api/weatherApi';
import { Card, CardHeader, CardBody } from '../common/Card';

interface PrecipitationChartProps {
  data: DailyForecast[];
}

export function PrecipitationChart({ data }: PrecipitationChartProps) {
  const chartData = data.map((day) => ({
    date: day.dayOfWeek,
    probability: day.pop,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-500 text-sm">
            降水概率: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader title="降水概率">
        {/* Extra content can go here */}
      </CardHeader>
      <CardBody>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="probability"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
