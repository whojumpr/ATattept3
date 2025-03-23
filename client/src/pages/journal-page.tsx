import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { JournalList } from "@/components/journal/journal-list";
import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function JournalPage() {
  const { user } = useAuth();
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <header className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Trading Journal</h1>
                <p className="text-gray-600">Document your thoughts, strategies, and market observations</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button 
                  onClick={() => setIsEntryFormOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Journal Entry
                </Button>
              </div>
            </div>
          </header>
          
          <JournalList />
        </div>
      </div>
      
      {/* Journal Entry Form */}
      {isEntryFormOpen && (
        <JournalEntryForm
          isOpen={isEntryFormOpen}
          onClose={() => setIsEntryFormOpen(false)}
        />
      )}
    </div>
  );
}
