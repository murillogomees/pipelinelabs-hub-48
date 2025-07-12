import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ReportData } from '@/hooks/useReports';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ReportChartProps {
  data: ReportData;
  type: string;
}

export function ReportChart({ data, type }: ReportChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
      },
    },
    scales: type !== 'pie' ? {
      x: {
        grid: {
          color: 'hsl(var(--border))',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
      },
      y: {
        grid: {
          color: 'hsl(var(--border))',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
      },
    } : undefined,
  };

  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || [
        'hsl(var(--primary))',
        'hsl(var(--secondary))',
        'hsl(var(--accent))',
        'hsl(var(--muted))',
      ],
      borderColor: dataset.borderColor || 'hsl(var(--primary))',
      borderWidth: 2,
    })),
  };

  switch (type) {
    case 'line':
      return <Line data={chartData} options={options} />;
    case 'pie':
      return <Pie data={chartData} options={options} />;
    default:
      return <Bar data={chartData} options={options} />;
  }
}