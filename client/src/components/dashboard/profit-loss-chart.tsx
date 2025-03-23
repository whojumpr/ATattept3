import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chart, registerables } from 'chart.js';
import { cn } from "@/lib/utils";

// Register Chart.js components
Chart.register(...registerables);

type TimeFrame = 'daily' | 'weekly' | 'monthly';

interface ProfitLossChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  className?: string;
}

export function ProfitLossChart({ data, className }: ProfitLossChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
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
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Profit/Loss ($)',
          data: data.values,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
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
            beginAtZero: true,
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
  
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
    // In a real application, you would fetch new data based on the timeframe
  };
  
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Profit/Loss Over Time</h3>
          <div className="flex space-x-2">
            <Button 
              variant={timeFrame === 'daily' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleTimeFrameChange('daily')}
              className="text-xs"
            >
              Daily
            </Button>
            <Button 
              variant={timeFrame === 'weekly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleTimeFrameChange('weekly')}
              className="text-xs"
            >
              Weekly
            </Button>
            <Button 
              variant={timeFrame === 'monthly' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleTimeFrameChange('monthly')}
              className="text-xs"
            >
              Monthly
            </Button>
          </div>
        </div>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
