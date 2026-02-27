import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"; // Assuming lucide-react is installed for icons; install if needed: npm install lucide-react
import { Link } from "react-router-dom"; // Assuming you're using react-router-dom for navigation; import if not already

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		isLoading,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
	} = useMusicStore();

	const { initializeQueue } = usePlayerStore();

	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchFeaturedSongs();
		fetchMadeForYouSongs();
		fetchTrendingSongs();
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs]);

	useEffect(() => {
		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
			const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs]);

	// Local filtering for each section based on searchQuery
	const filteredFeatured = featuredSongs.filter((song) =>
		song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		song.albumId?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredMadeForYou = madeForYouSongs.filter((song) =>
		song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		song.albumId?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const filteredTrending = trendingSongs.filter((song) =>
		song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
		song.albumId?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					{/* Search bar with local filtering */}
					<div className="mb-6 flex items-center relative">
						<Input 
							placeholder="Search for songs, artists, albums..." 
							className="flex-1 pr-10" 
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<Button 
							variant="ghost" 
							className="absolute right-0"
						>
							<Search className="h-5 w-5 text-zinc-400" />
						</Button>
					</div>

					{/* Assuming "See All" is for featured songs leading to AllSongsPage; placed here as an example header with link. 
					    If "See All" is inside FeaturedSection.tsx or SectionGrid.tsx, modify those components instead to include <Link to="/songs">See All</Link>. */}
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-bold text-white">Featured</h2>
						<Link to="/songs" className="text-sm text-zinc-400 hover:text-white">
							See All
						</Link>
					</div>
					{/* Pass filtered songs to FeaturedSection */}
					<FeaturedSection songs={filteredFeatured} />

					<div className='space-y-8'>
						<SectionGrid title='Made For You' songs={filteredMadeForYou} isLoading={isLoading} />
						<SectionGrid title='Trending' songs={filteredTrending} isLoading={isLoading} />
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;