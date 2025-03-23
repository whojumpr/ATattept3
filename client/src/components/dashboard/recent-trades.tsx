import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Trade } from "@shared/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RecentTradesProps {
  trades: Trade[];
  className?: string;
}

export function RecentTrades({ trades, className }: RecentTradesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Recent Trades</h3>
          <Link href="/trades">
            <a className="text-blue-500 text-sm font-medium hover:text-blue-700">
              View All Trades
            </a>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exit Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P/L
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No trades found. Add your first trade to see it here.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{trade.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        trade.tradeType === "long" 
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      )}>
                        {trade.tradeType === "long" ? "Long" : "Short"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {formatCurrency(trade.entryPrice)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {formatCurrency(trade.exitPrice)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {trade.positionSize}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn(
                        "font-medium",
                        trade.profitLoss >= 0 ? "text-profit" : "text-loss"
                      )}>
                        {formatCurrency(trade.profitLoss)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {format(new Date(trade.exitDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        trade.status === "win" 
                          ? "bg-green-100 text-green-800"
                          : trade.status === "loss"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      )}>
                        {trade.status === "win" 
                          ? "Win" 
                          : trade.status === "loss" 
                            ? "Loss" 
                            : "Breakeven"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
