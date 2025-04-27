import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  title: string;
  data: ChartData<'line' | 'bar'>;
  type?: 'line' | 'bar';
  options?: ChartOptions<'line' | 'bar'>;
}

const defaultOptions: ChartOptions<'line' | 'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  title, 
  data, 
  type = 'line',
  options = {} 
}) => {
  const chartOptions = { ...defaultOptions, ...options };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {type === 'line' ? (
            <Line data={data} options={chartOptions} />
          ) : (
            <Bar data={data} options={chartOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;