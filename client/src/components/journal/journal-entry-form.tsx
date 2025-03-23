import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertJournalEntrySchema, JournalEntry } from "@shared/schema";
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

interface JournalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editEntry?: JournalEntry;
}

// Extend the insert schema with more validation
const journalFormSchema = insertJournalEntrySchema.extend({
  date: z.coerce.date(),
});

type JournalFormValues = z.infer<typeof journalFormSchema>;

export function JournalEntryForm({ isOpen, onClose, editEntry }: JournalEntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    editEntry ? new Date(editEntry.date) : new Date()
  );
  
  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: editEntry ? {
      ...editEntry,
      date: new Date(editEntry.date),
    } : {
      userId: user?.id,
      title: "",
      content: "",
      date: new Date(),
      mood: "neutral",
      tags: [],
    }
  });
  
  const journalMutation = useMutation({
    mutationFn: async (data: JournalFormValues) => {
      const url = editEntry 
        ? `/api/journal/${editEntry.id}` 
        : '/api/journal';
      const method = editEntry ? "PUT" : "POST";
      const res = await apiRequest(method, url, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: `Journal entry ${editEntry ? "updated" : "added"} successfully`,
        description: `Your journal entry has been ${editEntry ? "updated" : "added"}.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: `Failed to ${editEntry ? "update" : "add"} journal entry`,
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: JournalFormValues) => {
    // Ensure userId is set
    if (!data.userId && user?.id) {
      data.userId = user.id;
    }
    
    // Convert string tags to array if needed
    if (typeof data.tags === 'string') {
      data.tags = (data.tags as string).split(',').map(tag => tag.trim());
    }
    
    journalMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editEntry ? "Edit Journal Entry" : "Add New Journal Entry"}
          </DialogTitle>
          <DialogDescription>
            {editEntry ? "Update the details of your journal entry." : "Record your trading thoughts and reflections."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for this entry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <DatePicker
                      date={entryDate}
                      setDate={(date) => {
                        setEntryDate(date);
                        if (date) field.onChange(date);
                      }}
                      placeholder="Select date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || 'neutral'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your thoughts, observations, and lessons learned..." 
                      className="h-64 resize-none" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={journalMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={journalMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {journalMutation.isPending 
                  ? "Saving..." 
                  : editEntry 
                    ? "Update Entry" 
                    : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
