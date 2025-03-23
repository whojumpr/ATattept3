import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trade, TradingMetrics } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";
import { MonthlyPerformance } from "@/components/analytics/monthly-performance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<string>("month");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedTab, setSelectedTab] = useState<string>("overview");
  
  // Fetch metrics data
  const { 
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery<TradingMetrics>({
    queryKey: ["/api/metrics", startDate, endDate],
    queryFn: async () => {
      const url = new URL("/api/metrics", window.location.origin);
      if (startDate) url.searchParams.append("startDate", startDate.toISOString());
      if (endDate) url.searchParams.append("endDate", endDate.toISOString());
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
    enabled: !!user,
  });
  
  // Fetch trades for analysis
  const { 
    data: trades = [], 
    isLoading: isLoadingTrades 
  } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
    enabled: !!user,
  });
  
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const now = new Date();
    
    switch (range) {
      case "week":
        setStartDate(new Date(now.setDate(now.getDate() - 7)));
        setEndDate(new Date());
        break;
      case "month":
        setStartDate(new Date(now.setMonth(now.getMonth() - 1)));
        setEndDate(new Date());
        break;
      case "quarter":
        setStartDate(new Date(now.setMonth(now.getMonth() - 3)));
        setEndDate(new Date());
        break;
      case "year":
        setStartDate(new Date(now.setFullYear(now.getFullYear() - 1)));
        setEndDate(new Date());
        break;
      case "all":
        setStartDate(undefined);
        setEndDate(undefined);
        break;
      default:
        break;
    }
  };
  
  // Prepare chart data
  const winLossData = {
    labels: ['Wins', 'Losses'],
    datasets: [{
      data: [
        metrics?.winRate || 0, 
        100 - (metrics?.winRate || 0)
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 1
    }]
  };
  
  const profitByInstrumentData = {
    labels: metrics?.profitByInstrument ? Object.keys(metrics.profitByInstrument).map(k => k.charAt(0).toUpperCase() + k.slice(1)) : [],
    datasets: [{
      label: 'Profit/Loss',
      data: metrics?.profitByInstrument ? Object.values(metrics.profitByInstrument) : [],
      backgroundColor: metrics?.profitByInstrument 
        ? Object.values(metrics.profitByInstrument).map(v => v >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)')
        : [],
      borderWidth: 1
    }]
  };
  
  const profitBySessionData = {
    labels: metrics?.profitBySession ? Object.keys(metrics.profitBySession).map(k => k.charAt(0).toUpperCase() + k.slice(1)) : [],
    datasets: [{
      label: 'Profit/Loss',
      data: metrics?.profitBySession ? Object.values(metrics.profitBySession) : [],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };
  
  // Calculate trade sizes
  const tradeSizes = trades.map(trade => trade.positionSize);
  const tradeSizeData = {
    labels: ['1-10', '11-50', '51-100', '101-500', '500+'],
    datasets: [{
      label: 'Number of Trades',
      data: [
        tradeSizes.filter(size => size >= 1 && size <= 10).length,
        tradeSizes.filter(size => size >= 11 && size <= 50).length,
        tradeSizes.filter(size => size >= 51 && size <= 100).length,
        tradeSizes.filter(size => size >= 101 && size <= 500).length,
        tradeSizes.filter(size => size > 500).length,
      ],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderWidth: 1
    }]
  };
  
  if (isLoadingMetrics || isLoadingTrades) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <header className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
                <p className="text-gray-600">Detailed insights into your trading performance</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="quarter">Past Quarter</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                
                {dateRange === "custom" && (
                  <>
                    <DatePicker 
                      date={startDate} 
                      setDate={setStartDate} 
                      placeholder="Start Date"
                    />
                    <DatePicker 
                      date={endDate} 
                      setDate={setEndDate} 
                      placeholder="End Date"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        // Refresh metrics with the selected date range
                      }}
                    >
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="patterns">Patterns & Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Profit/Loss
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${metrics?.totalProfitLoss && metrics.totalProfitLoss >= 0 ? "text-profit" : "text-loss"}`}>
                      {formatCurrency(metrics?.totalProfitLoss || 0)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Win Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.winRate?.toFixed(1) || 0}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Profit Factor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.profitFactor?.toFixed(2) || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Trades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.totalTrades || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalyticsChart 
                  title="Win/Loss Distribution" 
                  type="doughnut" 
                  data={winLossData} 
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
                
                <AnalyticsChart 
                  title="Profit by Instrument" 
                  type="bar" 
                  data={profitByInstrumentData} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalyticsChart 
                  title="Profit by Trading Session" 
                  type="bar" 
                  data={profitBySessionData} 
                />
                
                <AnalyticsChart 
                  title="Trade Size Distribution" 
                  type="bar" 
                  data={tradeSizeData} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Avg. Trade Profit</h3>
                        <p className="text-xl font-bold">{formatCurrency(metrics?.avgTradeProfit || 0)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Largest Win</h3>
                        <p className="text-xl font-bold text-profit">{formatCurrency(metrics?.largestWin || 0)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Largest Loss</h3>
                        <p className="text-xl font-bold text-loss">{formatCurrency(metrics?.largestLoss || 0)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Profit Factor</h3>
                        <p className="text-xl font-bold">{metrics?.profitFactor?.toFixed(2) || 0}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Win Streak</h3>
                        <p className="text-xl font-bold">
                          {
                            trades.length === 0 ? 0 :
                            trades
                              .filter(t => t.status === 'win')
                              .reduce((max, _, i, arr) => {
                                let streak = 0;
                                for (let j = i; j < arr.length; j++) {
                                  if (arr[j]) streak++;
                                  else break;
                                }
                                return Math.max(max, streak);
                              }, 0)
                          }
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Loss Streak</h3>
                        <p className="text-xl font-bold">
                          {
                            trades.length === 0 ? 0 :
                            trades
                              .filter(t => t.status === 'loss')
                              .reduce((max, _, i, arr) => {
                                let streak = 0;
                                for (let j = i; j < arr.length; j++) {
                                  if (arr[j]) streak++;
                                  else break;
                                }
                                return Math.max(max, streak);
                              }, 0)
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <MonthlyPerformance trades={trades} />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Trade Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Win Rate by Day of Week</h3>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                        const dayTrades = trades.filter(t => 
                          new Date(t.exitDate).toLocaleDateString('en-US', { weekday: 'long' }) === day
                        );
                        const wins = dayTrades.filter(t => t.status === 'win').length;
                        const winRate = dayTrades.length ? (wins / dayTrades.length) * 100 : 0;
                        
                        return (
                          <div key={day} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{day}</span>
                              <span>{winRate.toFixed(1)}% ({dayTrades.length} trades)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div 
                                className="bg-blue-500 h-2.5 rounded-full" 
                                style={{ width: `${winRate}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Win Rate by Session</h3>
                      {["Morning", "Midday", "Afternoon", "Evening"].map(session => {
                        const sessionValue = session.toLowerCase();
                        const sessionTrades = trades.filter(t => {
                          const hour = new Date(t.entryDate).getHours();
                          if (session === "Morning" && hour >= 4 && hour < 10) return true;
                          if (session === "Midday" && hour >= 10 && hour < 14) return true;
                          if (session === "Afternoon" && hour >= 14 && hour < 18) return true;
                          if (session === "Evening" && (hour >= 18 || hour < 4)) return true;
                          return false;
                        });
                        
                        const wins = sessionTrades.filter(t => t.status === 'win').length;
                        const winRate = sessionTrades.length ? (wins / sessionTrades.length) * 100 : 0;
                        
                        return (
                          <div key={session} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{session}</span>
                              <span>{winRate.toFixed(1)}% ({sessionTrades.length} trades)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div 
                                className="bg-blue-500 h-2.5 rounded-full" 
                                style={{ width: `${winRate}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="patterns" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trade Performance by Setup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Group by setup type */}
                    {trades.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No trade data available for setup analysis.</p>
                    ) : (
                      (() => {
                        const setupGroups = trades.reduce((acc: Record<string, any>, trade) => {
                          const setup = trade.setup || 'unspecified';
                          if (!acc[setup]) {
                            acc[setup] = { 
                              totalTrades: 0, 
                              wins: 0, 
                              losses: 0, 
                              profitLoss: 0 
                            };
                          }
                          
                          acc[setup].totalTrades += 1;
                          if (trade.status === 'win') acc[setup].wins += 1;
                          else if (trade.status === 'loss') acc[setup].losses += 1;
                          acc[setup].profitLoss += trade.profitLoss;
                          
                          return acc;
                        }, {});
                        
                        return Object.entries(setupGroups).map(([setup, data]: [string, any]) => {
                          const winRate = (data.wins / data.totalTrades) * 100;
                          
                          return (
                            <div key={setup} className="mb-4 border-b pb-4 last:border-0">
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-medium capitalize">{setup}</h3>
                                <div className={data.profitLoss >= 0 ? "text-profit" : "text-loss"}>
                                  {formatCurrency(data.profitLoss)}
                                </div>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Win rate: {winRate.toFixed(1)}%</span>
                                <span>{data.totalTrades} trades</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-500 h-2.5 rounded-full" 
                                  style={{ width: `${winRate}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Trade Performance by Symbol</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Group by symbol */}
                    {trades.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No trade data available for symbol analysis.</p>
                    ) : (
                      (() => {
                        const symbolGroups = trades.reduce((acc: Record<string, any>, trade) => {
                          const symbol = trade.symbol;
                          if (!acc[symbol]) {
                            acc[symbol] = { 
                              totalTrades: 0, 
                              wins: 0, 
                              losses: 0, 
                              profitLoss: 0 
                            };
                          }
                          
                          acc[symbol].totalTrades += 1;
                          if (trade.status === 'win') acc[symbol].wins += 1;
                          else if (trade.status === 'loss') acc[symbol].losses += 1;
                          acc[symbol].profitLoss += trade.profitLoss;
                          
                          return acc;
                        }, {});
                        
                        // Sort by total profit
                        return Object.entries(symbolGroups)
                          .sort((a, b) => b[1].profitLoss - a[1].profitLoss)
                          .slice(0, 5) // Top 5 symbols
                          .map(([symbol, data]: [string, any]) => {
                            const winRate = (data.wins / data.totalTrades) * 100;
                            
                            return (
                              <div key={symbol} className="mb-4 border-b pb-4 last:border-0">
                                <div className="flex justify-between items-center mb-1">
                                  <h3 className="font-medium">{symbol}</h3>
                                  <div className={data.profitLoss >= 0 ? "text-profit" : "text-loss"}>
                                    {formatCurrency(data.profitLoss)}
                                  </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                  <span>Win rate: {winRate.toFixed(1)}%</span>
                                  <span>{data.totalTrades} trades</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                  <div 
                                    className="bg-blue-500 h-2.5 rounded-full" 
                                    style={{ width: `${winRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          });
                      })()
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk:Reward Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {trades.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No trade data available for risk:reward analysis.</p>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Analysis of your trade risk-to-reward ratios and their performance outcomes
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["1:1", "1:2", "1:3", "2:1", "3:1"].map(ratio => {
                          const ratioTrades = trades.filter(t => t.riskRewardRatio === ratio);
                          const wins = ratioTrades.filter(t => t.status === 'win').length;
                          const losses = ratioTrades.filter(t => t.status === 'loss').length;
                          const totalPL = ratioTrades.reduce((sum, t) => sum + t.profitLoss, 0);
                          const winRate = ratioTrades.length ? (wins / ratioTrades.length) * 100 : 0;
                          
                          return (
                            <Card key={ratio}>
                              <CardContent className="pt-6">
                                <h3 className="text-center font-medium mb-2">{ratio}</h3>
                                <div className="flex justify-center mb-2">
                                  <div 
                                    className={`text-xl font-bold ${totalPL >= 0 ? "text-profit" : "text-loss"}`}
                                  >
                                    {formatCurrency(totalPL)}
                                  </div>
                                </div>
                                <div className="text-sm text-center text-gray-500">
                                  {winRate.toFixed(1)}% win rate
                                </div>
                                <div className="text-sm text-center text-gray-500">
                                  {ratioTrades.length} trades
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
