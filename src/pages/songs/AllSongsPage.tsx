import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "../home/components/SectionGrid"; // Reusing from home/components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"; // Assuming lucide-react is installed
import { Loader2 } from "lucide-react"; // For loading spinner on load more

const AllSongsPage = () => {
  const {
    fetchAllSongs, // Fixed to match store
    allSongs, // Array of all fetched songs so far
    isLoading,
    hasMoreSongs, // Boolean to check if there are more songs to load
  } = useMusicStore();

  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const limit = 10;

  useEffect(() => {
    fetchAllSongs(limit, offset, searchQuery);
  }, [fetchAllSongs, offset, searchQuery]); // Refetch on searchQuery change

  const handleLoadMore = () => {
    if (!isLoading && hasMoreSongs) {
      setOffset((prev) => prev + limit);
    }
  };

  const handleSearch = () => {
    setOffset(0); // Reset to first page on new search
    // Fetch happens via useEffect dep on searchQuery, but since query is already set, this just resets offset
  };

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <Topbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className='p-4 sm:p-6'>
          {/* Search bar, similar to home */}
          <div className="mb-6 flex items-center relative"> {/* Added relative for absolute positioning */}
            <Input 
              placeholder="Search for songs, artists, albums..." 
              className="flex-1 pr-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              variant="ghost" 
              className="absolute right-0" // Adjusted positioning
              onClick={handleSearch}
            >
              <Search className="h-5 w-5 text-zinc-400" />
            </Button>
          </div>

          {/* All Songs section */}
          <SectionGrid 
            title='All Songs' 
            songs={allSongs} 
            isLoading={isLoading} 
          />

          {/* Load More button */}
          {hasMoreSongs && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleLoadMore} 
                disabled={isLoading}
                className="bg-zinc-700 hover:bg-zinc-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </main>
  );
};
export default AllSongsPage;