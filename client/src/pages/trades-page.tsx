import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TradeList } from "@/components/trades/trade-list";
import { TradeEntryForm } from "@/components/trades/trade-entry-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TradesPage() {
  const { user } = useAuth();
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <header className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Trade History</h1>
                <p className="text-gray-600">View, edit and analyze your trading activity</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button 
                  onClick={() => setIsTradeFormOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Trade
                </Button>
              </div>
            </div>
          </header>
          
          <TradeList />
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
