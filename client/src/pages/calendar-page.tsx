import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trade } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TradingCalendar } from "@/components/calendar/trading-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<string>("month");
  
  // Calculate date ranges based on selected view
  const getDateRange = () => {
    if (selectedTab === "month") {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
        title: format(currentDate, "MMMM yyyy")
      };
    } else {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        title: `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d, yyyy")}`
      };
    }
  };
  
  const dateRange = getDateRange();
  
  // Fetch trades for the selected date range
  const { 
    data: trades = [], 
    isLoading,
    isError,
    error
  } = useQuery<Trade[]>({
    queryKey: ["/api/trades/range", dateRange.start, dateRange.end],
    queryFn: async () => {
      const url = new URL("/api/trades/range", window.location.origin);
      url.searchParams.append("startDate", dateRange.start.toISOString());
      url.searchParams.append("endDate", dateRange.end.toISOString());
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch trades");
      return res.json();
    },
    enabled: !!user,
  });
  
  // Helper functions to navigate between time periods
  const goToPrevious = () => {
    if (selectedTab === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };
  
  const goToNext = () => {
    if (selectedTab === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Calculate summary statistics
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = trades.filter(trade => trade.profitLoss > 0);
  const losingTrades = trades.filter(trade => trade.profitLoss < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  
  // Group trades by day for the heatmap visualization
  const tradesByDay = trades.reduce((acc: Record<string, any>, trade) => {
    const day = format(new Date(trade.exitDate), "yyyy-MM-dd");
    if (!acc[day]) {
      acc[day] = { count: 0, profit: 0 };
    }
    acc[day].count += 1;
    acc[day].profit += trade.profitLoss;
    return acc;
  }, {});
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="text-center text-red-500 py-8">
            Error loading trades: {error?.message || "Unknown error"}
          </div>
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
                <h1 className="text-2xl font-bold text-gray-800">Trading Calendar</h1>
                <p className="text-gray-600">View your trading activity by date</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <Tabs 
                  value={selectedTab} 
                  onValueChange={setSelectedTab}
                  className="border rounded-lg p-1"
                >
                  <TabsList className="grid grid-cols-2 w-[180px]">
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center space-x-2 ml-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={goToToday}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{dateRange.title}</CardTitle>
                <div className="text-sm text-gray-500">
                  {trades.length} trades
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total P/L</h3>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-profit" : "text-loss"}`}>
                    {formatCurrency(totalProfit)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
                  <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Winning Trades</h3>
                  <p className="text-2xl font-bold text-profit">{winningTrades.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Losing Trades</h3>
                  <p className="text-2xl font-bold text-loss">{losingTrades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsContent value="month" className="mt-0 p-0">
              <TradingCalendar trades={trades} />
            </TabsContent>
            
            <TabsContent value="week" className="mt-0 p-0">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Generate days for the week */}
                    {Array.from({ length: 7 }).map((_, i) => {
                      const day = new Date(startOfWeek(currentDate, { weekStartsOn: 1 }));
                      day.setDate(day.getDate() + i);
                      const dayStr = format(day, "yyyy-MM-dd");
                      const dayTrades = trades.filter(t => 
                        format(new Date(t.exitDate), "yyyy-MM-dd") === dayStr
                      );
                      const dayProfit = dayTrades.reduce((sum, t) => sum + t.profitLoss, 0);
                      
                      return (
                        <div key={i} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">
                              {format(day, "EEEE, MMMM d, yyyy")}
                            </h3>
                            <div className={`font-medium ${dayProfit > 0 ? "text-profit" : dayProfit < 0 ? "text-loss" : ""}`}>
                              {dayTrades.length > 0 ? formatCurrency(dayProfit) : "No trades"}
                            </div>
                          </div>
                          
                          {dayTrades.length > 0 ? (
                            <div className="space-y-2">
                              {dayTrades.map(trade => (
                                <div 
                                  key={trade.id}
                                  className={`p-3 rounded-lg text-sm ${
                                    trade.profitLoss > 0 
                                      ? "bg-green-50 border border-green-100" 
                                      : "bg-red-50 border border-red-100"
                                  }`}
                                >
                                  <div className="flex justify-between mb-1">
                                    <div className="font-medium">{trade.symbol} ({trade.tradeType})</div>
                                    <div className={trade.profitLoss > 0 ? "text-profit" : "text-loss"}>
                                      {formatCurrency(trade.profitLoss)}
                                    </div>
                                  </div>
                                  <div>
                                    {format(new Date(trade.entryDate), "h:mm a")} - {format(new Date(trade.exitDate), "h:mm a")}
                                    {" • "}
                                    {trade.positionSize} shares at {formatCurrency(trade.entryPrice)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No trades on this day</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
