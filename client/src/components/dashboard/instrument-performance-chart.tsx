import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Chart, registerables } from 'chart.js';
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

// Register Chart.js components
Chart.register(...registerables);

interface InstrumentPerformanceData {
  instrument: string;
  profit: number;
}

interface InstrumentPerformanceChartProps {
  data: InstrumentPerformanceData[];
  className?: string;
}

export function InstrumentPerformanceChart({ data, className }: InstrumentPerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    const labels = data.map(item => item.instrument);
    const values = data.map(item => item.profit);
    
    // Generate colors based on profit (green for positive, red for negative)
    const backgroundColors = values.map(value => 
      value >= 0 
        ? 'rgba(16, 185, 129, 0.8)'
        : 'rgba(239, 68, 68, 0.8)'
    );
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Profit ($)',
          data: values,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);
  
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Performance by Instrument</h3>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
