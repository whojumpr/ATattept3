import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertTradeSchema, Trade } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { UploadCloud } from "lucide-react";

interface TradeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTrade?: Trade;
}

// Extend the insert schema with more validation
const tradeFormSchema = insertTradeSchema.extend({
  entryDate: z.coerce.date(),
  exitDate: z.coerce.date(),
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

export function TradeEntryForm({ isOpen, onClose, editTrade }: TradeEntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    editTrade ? new Date(editTrade.entryDate) : new Date()
  );
  const [exitDate, setExitDate] = useState<Date | undefined>(
    editTrade ? new Date(editTrade.exitDate) : new Date()
  );
  
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: editTrade ? {
      ...editTrade,
      entryDate: new Date(editTrade.entryDate),
      exitDate: new Date(editTrade.exitDate),
    } : {
      userId: user?.id,
      symbol: "",
      tradeType: "long",
      entryPrice: 0,
      exitPrice: 0,
      positionSize: 0,
      profitLoss: 0,
      fees: 0,
      instrumentType: "stocks",
      setup: "",
      riskRewardRatio: "",
      tags: [],
      notes: "",
      screenshots: [],
      status: "win",
      entryDate: new Date(),
      exitDate: new Date(),
    }
  });
  
  const tradeMutation = useMutation({
    mutationFn: async (data: TradeFormValues) => {
      // Calculate P/L if not manually set
      if (!data.profitLoss) {
        const priceDiff = data.tradeType === "long" 
          ? data.exitPrice - data.entryPrice 
          : data.entryPrice - data.exitPrice;
        data.profitLoss = priceDiff * data.positionSize - data.fees;
      }
      
      // Determine status based on P/L
      if (!data.status) {
        data.status = data.profitLoss > 0 ? "win" : data.profitLoss < 0 ? "loss" : "breakeven";
      }
      
      const url = editTrade 
        ? `/api/trades/${editTrade.id}` 
        : '/api/trades';
      const method = editTrade ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: `Trade ${editTrade ? "updated" : "added"} successfully`,
        description: `Your trade has been ${editTrade ? "updated" : "added"} to your journal.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Failed to ${editTrade ? "update" : "add"} trade`,
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: TradeFormValues) => {
    // Ensure userId is set
    if (!data.userId && user?.id) {
      data.userId = user.id;
    }
    
    // Convert string tags to array if needed
    if (typeof data.tags === 'string') {
      data.tags = (data.tags as string).split(',').map(tag => tag.trim());
    }
    
    tradeMutation.mutate(data);
  };

  const calculateProfitLoss = () => {
    const values = form.getValues();
    const { entryPrice, exitPrice, positionSize, fees, tradeType } = values;
    
    if (!entryPrice || !exitPrice || !positionSize) return;
    
    const priceDiff = tradeType === "long" 
      ? exitPrice - entryPrice 
      : entryPrice - exitPrice;
    const profitLoss = priceDiff * positionSize - (fees || 0);
    
    form.setValue("profitLoss", profitLoss);
    
    // Set status based on P/L
    const status = profitLoss > 0 ? "win" : profitLoss < 0 ? "loss" : "breakeven";
    form.setValue("status", status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editTrade ? "Edit Trade" : "Add New Trade"}
          </DialogTitle>
          <DialogDescription>
            {editTrade ? "Update the details of your trade." : "Enter the details of your trade."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AAPL, MSFT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tradeType"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Trade Type</FormLabel>
                      <div className="flex mt-1">
                        <Button
                          type="button"
                          className={`flex-1 rounded-l-lg ${field.value === 'long' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
                          onClick={() => form.setValue('tradeType', 'long')}
                        >
                          Long
                        </Button>
                        <Button
                          type="button"
                          className={`flex-1 rounded-r-lg ${field.value === 'short' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
                          onClick={() => form.setValue('tradeType', 'short')}
                        >
                          Short
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="entryPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value));
                              setTimeout(calculateProfitLoss, 100);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="exitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exit Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value));
                              setTimeout(calculateProfitLoss, 100);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="positionSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position Size</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="# of shares/contracts" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value));
                              setTimeout(calculateProfitLoss, 100);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instrumentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instrument Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select instrument type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stocks">Stocks</SelectItem>
                            <SelectItem value="options">Options</SelectItem>
                            <SelectItem value="futures">Futures</SelectItem>
                            <SelectItem value="forex">Forex</SelectItem>
                            <SelectItem value="crypto">Crypto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="entryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Date & Time</FormLabel>
                        <DatePicker
                          date={entryDate}
                          setDate={(date) => {
                            setEntryDate(date);
                            if (date) field.onChange(date);
                          }}
                          placeholder="Select entry date"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="exitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exit Date & Time</FormLabel>
                        <DatePicker
                          date={exitDate}
                          setDate={(date) => {
                            setExitDate(date);
                            if (date) field.onChange(date);
                          }}
                          placeholder="Select exit date"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="fees"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Trade Fees</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value));
                            setTimeout(calculateProfitLoss, 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Right Column */}
              <div>
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Add tags (comma separated)" 
                          {...field} 
                          value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="setup"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Trade Setup</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select setup type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="breakout">Breakout</SelectItem>
                          <SelectItem value="pullback">Pullback</SelectItem>
                          <SelectItem value="trend">Trend Continuation</SelectItem>
                          <SelectItem value="reversal">Reversal</SelectItem>
                          <SelectItem value="range">Range Play</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="riskRewardRatio"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Risk:Reward Ratio</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1:2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Trade Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add your trade analysis, thoughts, and lessons learned..." 
                          className="h-32 resize-none" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="screenshots"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Upload Screenshots</FormLabel>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-1 text-sm text-gray-500">
                          Drag and drop your files here, or <span className="text-blue-500">browse</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Supports: JPG, PNG, GIF (Max 5MB each)
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={tradeMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={tradeMutation.isPending}
              >
                {tradeMutation.isPending 
                  ? "Saving..." 
                  : editTrade 
                    ? "Update Trade" 
                    : "Save Trade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
