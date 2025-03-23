import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@shared/schema";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TradingCalendarProps {
  trades: Trade[];
  className?: string;
}

export function TradingCalendar({ trades, className }: TradingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Group trades by date
  const tradesByDate = trades.reduce((acc: Record<string, Trade[]>, trade) => {
    const dateKey = format(new Date(trade.exitDate), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(trade);
    return acc;
  }, {});
  
  // Calculate profit/loss for each date
  const profitByDate = Object.entries(tradesByDate).reduce((acc: Record<string, number>, [date, dayTrades]) => {
    acc[date] = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    return acc;
  }, {});
  
  // Create date styling function
  const dayClassName = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const profit = profitByDate[dateKey] || 0;
    const hasTradesForDay = tradesByDate[dateKey] && tradesByDate[dateKey].length > 0;
    
    if (!hasTradesForDay) return "";
    
    return cn(
      "relative after:absolute after:top-0 after:left-0 after:w-full after:h-full after:rounded-full",
      profit > 0 
        ? "after:bg-green-100" 
        : profit < 0 
          ? "after:bg-red-100" 
          : "after:bg-gray-100"
    );
  };
  
  // Get trades for selected date
  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const selectedDateTrades = tradesByDate[selectedDateKey] || [];
  const totalProfitForSelectedDate = selectedDateTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Trading Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              setSelectedDate(newDate);
            }}
            className="rounded-md border"
            modifiersClassNames={{
              selected: "bg-primary text-primary-foreground",
            }}
            components={{
              day: ({ date: dayDate, ...props }) => (
                <Button 
                  {...props}
                  variant="ghost"
                  className={cn(
                    props.className,
                    dayClassName(dayDate)
                  )}
                />
              ),
            }}
          />
          <div className="mt-4 flex justify-around text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-100 mr-2"></div>
              <span>Profitable</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-100 mr-2"></div>
              <span>Loss</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-100 mr-2"></div>
              <span>Breakeven</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Trades on ${format(selectedDate, "MMMM d, yyyy")}` 
              : "Select a date to view trades"}
          </CardTitle>
          {selectedDateTrades.length > 0 && (
            <div className={cn(
              "text-sm font-medium",
              totalProfitForSelectedDate > 0 ? "text-profit" : "text-loss"
            )}>
              {formatCurrency(totalProfitForSelectedDate)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selectedDateTrades.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              {selectedDate 
                ? "No trades on this date" 
                : "Please select a date to view trades"}
            </p>
          ) : (
            <div className="space-y-4">
              {selectedDateTrades.map((trade, index) => (
                <div 
                  key={trade.id} 
                  className={cn(
                    "p-4 rounded-lg border",
                    trade.profitLoss > 0 
                      ? "border-green-200 bg-green-50" 
                      : "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{trade.symbol} ({trade.tradeType})</div>
                    <div className={cn(
                      "font-medium",
                      trade.profitLoss > 0 ? "text-profit" : "text-loss"
                    )}>
                      {formatCurrency(trade.profitLoss)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Entry: {formatCurrency(trade.entryPrice)}</div>
                    <div>Exit: {formatCurrency(trade.exitPrice)}</div>
                    <div>Size: {trade.positionSize}</div>
                    <div>{trade.instrumentType}</div>
                  </div>
                  {trade.notes && (
                    <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                      {trade.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
