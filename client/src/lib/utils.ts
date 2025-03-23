import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
}

export function calculateProfitLoss(
  entryPrice: number, 
  exitPrice: number, 
  positionSize: number, 
  tradeType: string, 
  fees: number = 0
): number {
  const priceDiff = tradeType === "long" 
    ? exitPrice - entryPrice 
    : entryPrice - exitPrice;
  return priceDiff * positionSize - fees;
}

export function getTradeStatus(profitLoss: number): "win" | "loss" | "breakeven" {
  return profitLoss > 0 ? "win" : profitLoss < 0 ? "loss" : "breakeven";
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return parseFloat(((current - previous) / Math.abs(previous) * 100).toFixed(1));
}

export function groupTradesByDate(trades: any[]): Record<string, any[]> {
  return trades.reduce((acc, trade) => {
    const date = new Date(trade.exitDate).toLocaleDateString();
    acc[date] = acc[date] || [];
    acc[date].push(trade);
    return acc;
  }, {} as Record<string, any[]>);
}

export function getInitials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
