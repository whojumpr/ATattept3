import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  changePeriod?: string;
  className?: string;
  valueClassName?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  changePeriod = "from last period",
  className,
  valueClassName,
}: MetricsCardProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  return (
    <div className={cn("bg-white rounded-xl shadow-sm p-6", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className={cn(
            "text-2xl font-bold", 
            valueClassName,
            !valueClassName && isPositive && "text-profit",
            !valueClassName && !isPositive && !isNeutral && "text-loss",
            !valueClassName && isNeutral && "text-gray-800"
          )}>
            {value}
          </h3>
          <div className="flex items-center mt-1">
            {isPositive ? (
              <ArrowUp className="h-4 w-4 text-profit" />
            ) : isNeutral ? (
              <span className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4 text-loss" />
            )}
            <span 
              className={cn(
                "text-sm ml-1",
                isPositive && "text-profit",
                !isPositive && !isNeutral && "text-loss",
                isNeutral && "text-gray-500"
              )}
            >
              {isNeutral ? '' : (isPositive ? '+' : '')}{change}%
            </span>
            <span className="text-gray-500 text-sm ml-1">{changePeriod}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
