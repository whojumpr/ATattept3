import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trade, TradingMetrics } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { ProfitLossChart } from "@/components/dashboard/profit-loss-chart";
import { WinLossChart } from "@/components/dashboard/win-loss-chart";
import { SessionPerformanceChart } from "@/components/dashboard/session-performance-chart";
import { InstrumentPerformanceChart } from "@/components/dashboard/instrument-performance-chart";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { TradeEntryForm } from "@/components/trades/trade-entry-form";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<string>("today");
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  
  // Fetch metrics data
  const { 
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery<TradingMetrics>({
    queryKey: ["/api/metrics"],
    enabled: !!user,
  });
  
  // Fetch trades for the recent trades table
  const { 
    data: trades = [], 
    isLoading: isLoadingTrades 
  } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
    enabled: !!user,
  });
  
  // Mock data for charts - in a real app, this would come from the API
  const profitLossData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    values: [320, 480, 350, 740, 590, 680],
  };
  
  const winLossData = {
    winPercentage: metrics?.winRate || 68.5,
    lossPercentage: 100 - (metrics?.winRate || 68.5),
  };
  
  const sessionPerformanceData = [
    { session: "Morning", winRate: 72 },
    { session: "Midday", winRate: 58 },
    { session: "Afternoon", winRate: 65 },
    { session: "Evening", winRate: 70 },
  ];
  
  const instrumentPerformanceData = [
    { instrument: "Stocks", profit: 1250 },
    { instrument: "Options", profit: 780 },
    { instrument: "Futures", profit: 320 },
    { instrument: "Forex", profit: -150 },
    { instrument: "Crypto", profit: 320 },
  ];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <header className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name || user?.username}! Here's your trading overview.</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                <Button 
                  onClick={() => setIsTradeFormOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Trade
                </Button>
                <Button variant="outline" className="text-gray-700">
                  <Download className="h-5 w-5 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </header>
          
          {/* Time Period Filter */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
              <span className="mb-2 sm:mb-0 text-gray-600 font-medium">View:</span>
              <div className="grid grid-cols-3 sm:flex gap-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                <Button 
                  variant={timeFilter === "today" ? "default" : "ghost"}
                  size="sm" 
                  onClick={() => setTimeFilter("today")}
                  className={timeFilter === "today" ? "bg-white shadow-sm text-gray-700" : "text-gray-600"}
                >
                  Today
                </Button>
                <Button 
                  variant={timeFilter === "week" ? "default" : "ghost"}
                  size="sm" 
                  onClick={() => setTimeFilter("week")}
                  className={timeFilter === "week" ? "bg-white shadow-sm text-gray-700" : "text-gray-600"}
                >
                  Week
                </Button>
                <Button 
                  variant={timeFilter === "month" ? "default" : "ghost"}
                  size="sm" 
                  onClick={() => setTimeFilter("month")}
                  className={timeFilter === "month" ? "bg-white shadow-sm text-gray-700" : "text-gray-600"}
                >
                  Month
                </Button>
                <Button 
                  variant={timeFilter === "year" ? "default" : "ghost"}
                  size="sm" 
                  onClick={() => setTimeFilter("year")}
                  className={timeFilter === "year" ? "bg-white shadow-sm text-gray-700" : "text-gray-600"}
                >
                  Year
                </Button>
                <Button 
                  variant={timeFilter === "all" ? "default" : "ghost"}
                  size="sm" 
                  onClick={() => setTimeFilter("all")}
                  className={`${timeFilter === "all" ? "bg-white shadow-sm text-gray-700" : "text-gray-600"} col-span-3 sm:col-span-1`}
                >
                  All Time
                </Button>
              </div>
            </div>
          </div>
          
          {/* Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricsCard
              title="Total Profit/Loss"
              value={formatCurrency(metrics?.totalProfitLoss || 0)}
              change={12.5}
              valueClassName={metrics?.totalProfitLoss && metrics.totalProfitLoss >= 0 ? "text-profit" : "text-loss"}
            />
            <MetricsCard
              title="Win Rate"
              value={`${metrics?.winRate?.toFixed(1) || 0}%`}
              change={5.2}
            />
            <MetricsCard
              title="Avg. Trade Profit"
              value={formatCurrency(metrics?.avgTradeProfit || 0)}
              change={8.3}
            />
            <MetricsCard
              title="Profit Factor"
              value={metrics?.profitFactor?.toFixed(2) || 0}
              change={-0.4}
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ProfitLossChart 
              data={profitLossData} 
              className="lg:col-span-2"
            />
            <WinLossChart 
              data={winLossData}
            />
          </div>
          
          {/* Recent Trades Table */}
          <RecentTrades 
            trades={trades.slice(0, 5)} 
            className="mb-6"
          />
          
          {/* Trading Performance by Session & Instrument */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SessionPerformanceChart data={sessionPerformanceData} />
            <InstrumentPerformanceChart data={instrumentPerformanceData} />
          </div>
        </div>
      </div>
      
      {/* Trade Entry Form */}
      {isTradeFormOpen && (
        <TradeEntryForm
          isOpen={isTradeFormOpen}
          onClose={() => setIsTradeFormOpen(false)}
        />
      )}
    </div>
  );
}
