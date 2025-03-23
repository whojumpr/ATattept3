import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { JournalEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

import { JournalEntryForm } from "./journal-entry-form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Search, Filter, SunMedium, Cloud, CloudRain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function JournalList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);
  
  // Fetch journal entries
  const { 
    data: entries = [], 
    isLoading, 
    isError,
    error
  } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
    enabled: !!user,
  });

  // Handle entry deletion
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/journal/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Journal entry deleted",
        description: "The journal entry has been deleted successfully.",
      });
      setDeleteEntryId(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error deleting journal entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const confirmDelete = (id: number) => {
    setDeleteEntryId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = () => {
    if (deleteEntryId) {
      deleteMutation.mutate(deleteEntryId);
    }
  };
  
  const openEditForm = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsEntryFormOpen(true);
  };

  const toggleExpand = (id: number) => {
    setExpandedEntryId(expandedEntryId === id ? null : id);
  };
  
  // Get all unique tags from entries
  const allTags = Array.from(
    new Set(
      entries
        .flatMap(entry => entry.tags || [])
        .filter(Boolean)
    )
  );
  
  // Filter entries
  const filteredEntries = entries.filter(entry => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Mood filter
    const matchesMood = selectedMood === "" || entry.mood === selectedMood;
    
    // Tag filter
    const matchesTag = selectedTag === "" || 
      (entry.tags && entry.tags.includes(selectedTag));
    
    // Date range filter
    const matchesDateRange = (!startDate || !endDate) || 
      (new Date(entry.date) >= startDate && new Date(entry.date) <= endDate);
    
    return matchesSearch && matchesMood && matchesTag && matchesDateRange;
  });
  
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive':
        return <SunMedium className="h-5 w-5 text-yellow-500" />;
      case 'negative':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      default:
        return <Cloud className="h-5 w-5 text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading journal entries: {error?.message || "Unknown error"}
      </div>
    );
  }
  
  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search journal entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Moods</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DatePicker 
                date={startDate} 
                setDate={setStartDate} 
                placeholder="Start Date"
                className="w-[140px]"
              />
              
              <DatePicker 
                date={endDate} 
                setDate={setEndDate} 
                placeholder="End Date"
                className="w-[140px]"
              />
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMood("");
                  setSelectedTag("");
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {filteredEntries.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-gray-500">No journal entries found. Add your first entry to see it here.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getMoodIcon(entry.mood || 'neutral')}
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.date), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{entry.title}</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditForm(entry)}
                      title="Edit entry"
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(entry.id)}
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className={cn(
                  "prose max-w-none",
                  expandedEntryId !== entry.id && "line-clamp-3"
                )}>
                  {entry.content}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end py-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleExpand(entry.id)}
                >
                  {expandedEntryId === entry.id ? "Read Less" : "Read More"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Journal Entry Form */}
      {isEntryFormOpen && (
        <JournalEntryForm
          isOpen={isEntryFormOpen}
          onClose={() => {
            setIsEntryFormOpen(false);
            setEditingEntry(undefined);
          }}
          editEntry={editingEntry}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this journal entry? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
