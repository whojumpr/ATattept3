import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Trade } from "@shared/schema";
import { format } from "date-fns";

interface MonthlyPerformanceProps {
  trades: Trade[];
  className?: string;
}

export function MonthlyPerformance({ trades, className }: MonthlyPerformanceProps) {
  // Group trades by month and calculate performance
  const monthlyData = trades.reduce((acc: Record<string, { 
    profit: number; 
    trades: number; 
    wins: number; 
    losses: number;
    month: string;
  }>, trade) => {
    const monthKey = format(new Date(trade.exitDate), "yyyy-MM");
    const month = format(new Date(trade.exitDate), "MMMM yyyy");
    
    if (!acc[monthKey]) {
      acc[monthKey] = { 
        profit: 0, 
        trades: 0, 
        wins: 0, 
        losses: 0,
        month
      };
    }
    
    acc[monthKey].profit += trade.profitLoss;
    acc[monthKey].trades += 1;
    
    if (trade.status === 'win') {
      acc[monthKey].wins += 1;
    } else if (trade.status === 'loss') {
      acc[monthKey].losses += 1;
    }
    
    return acc;
  }, {});
  
  // Convert to array and sort by date (most recent first)
  const monthlyStats = Object.values(monthlyData).sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  );
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Monthly Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {monthlyStats.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No trade data available for monthly analysis.</p>
          ) : (
            monthlyStats.map((stats, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{stats.month}</h3>
                  <Badge variant={stats.profit > 0 ? "default" : "destructive"}>
                    {formatCurrency(stats.profit)}
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ 
                      width: `${(stats.wins / stats.trades) * 100}%`,
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <div>Win rate: {((stats.wins / stats.trades) * 100).toFixed(1)}%</div>
                  <div>{stats.wins} wins / {stats.losses} losses</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
